import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { OrganizationMember } from '../types/api';

const router = Router();

// Helper to format member
const formatMember = (m: any): OrganizationMember => ({
  id: m.id,
  email: m.email,
  name: m.name || '',
  votingPower: m.votingPower,
  status: m.status as any,
  role: m.role as any,
  joinedDate: m.joinedDate.toISOString(),
  lastActive: m.lastActive?.toISOString()
});

// GET /api/members/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const member = await prisma.organizationMember.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Member not found' } });
    }

    res.json({ success: true, data: formatMember(member) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// PATCH /api/members/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const member = await prisma.organizationMember.update({
      where: { id },
      data: {
        name: updates.name,
        votingPower: updates.votingPower,
        role: updates.role,
        status: updates.status
      }
    });

    res.json({ success: true, data: formatMember(member) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// DELETE /api/members/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Instead of hard delete, maybe set status to inactive?
    // But for now, let's follow the route which implies removal.
    // However, if they have votes, we might want to keep them for history.
    // Let's try to delete, if it fails due to FK, we might need to handle it.
    // For now, let's just delete the member record.
    
    await prisma.organizationMember.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/members/:id/votes
router.get('/:id/votes', async (req, res) => {
  try {
    const { id } = req.params;
    const votes = await prisma.vote.findMany({
      where: { memberId: id },
      include: {
        milestone: {
          include: { project: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedVotes = votes.map(v => ({
      id: v.id,
      milestoneId: v.milestoneId,
      milestoneTitle: v.milestone.title,
      projectTitle: v.milestone.project.title,
      vote: v.voteType === 'approve',
      comment: v.comment,
      timestamp: v.createdAt.toISOString()
    }));

    res.json({ success: true, data: formattedVotes });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/members/:id/pending-votes
router.get('/:id/pending-votes', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get member's organization
    const member = await prisma.organizationMember.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }

    // 2. Find milestones in 'voting' status for this organization
    const milestones = await prisma.milestone.findMany({
      where: {
        status: 'voting',
        project: {
          organizationId: member.organizationId
        }
      },
      include: {
        project: true,
        votes: {
          where: { memberId: id } // Check if this member voted
        }
      }
    });

    // 3. Filter out milestones where member has already voted
    const pendingMilestones = milestones.filter(m => m.votes.length === 0);

    const formattedPending = pendingMilestones.map(m => ({
      id: m.id,
      title: m.title,
      projectTitle: m.project.title,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Mock deadline (1 week from now)
    }));

    res.json({ success: true, data: formattedPending });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

export default router;
