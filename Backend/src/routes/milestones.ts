import { Router } from 'express';
import { prisma } from '../lib/prisma';
import {
  Milestone,
  Evidence,
  SubmitEvidenceRequest,
  SubmitEvidenceResponse,
  Vote
} from '../types/api';

const router = Router();

// Helper to format milestone
const formatMilestone = (m: any): Milestone => ({
  id: m.id,
  projectId: m.projectId,
  stageNumber: m.stageNumber,
  title: m.title,
  description: m.description || '',
  fundingAmount: Number(m.fundingAmount),
  fundingPercentage: m.fundingPercentage || 0,
  durationWeeks: m.durationWeeks || 0,
  status: m.status as any,
  startDate: m.startDate?.toISOString(),
  evidence: m.evidence?.map((e: any) => ({
    id: e.id,
    milestoneId: e.milestoneId,
    type: e.type,
    title: e.title,
    description: e.description,
    url: e.url,
    uploadedAt: e.uploadedAt.toISOString(),
    uploadedBy: e.uploadedBy || ''
  })) || [],
  votes: m.votes?.map((v: any) => ({
    id: v.id,
    milestoneId: v.milestoneId,
    memberId: v.memberId,
    memberName: v.member?.name || '',
    vote: v.voteType === 'approve',
    comment: v.comment,
    timestamp: v.createdAt.toISOString()
  })) || []
});

// GET /api/milestones/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: {
        evidence: true,
        votes: {
          include: { member: true }
        }
      }
    });

    if (!milestone) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    res.json({ success: true, data: formatMilestone(milestone) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// PATCH /api/milestones/:id/start
router.patch('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        status: 'in_progress',
        startDate: new Date()
      },
      include: {
        evidence: true,
        votes: { include: { member: true } }
      }
    });

    res.json({ success: true, data: formatMilestone(milestone) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// POST /api/milestones/:id/submit
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const body: SubmitEvidenceRequest = req.body;

    // Validate that evidence was provided
    const evidenceList = body?.evidence || [];

    // 1. Create Evidence records
    if (evidenceList.length > 0) {
      await prisma.evidence.createMany({
        data: evidenceList.map(e => ({
          milestoneId: id,
          type: e.type,
          title: e.title,
          description: e.description,
          url: e.url,
          uploadedBy: null // TODO: Get actual user ID from auth context
        }))
      });
    }

    // 2. Update Milestone Status to 'voting' (signifying it's submitted for review)
    await prisma.milestone.update({
      where: { id },
      data: {
        status: 'voting',
        submittedDate: new Date()
      }
    });

    res.json({
      success: true,
      milestoneId: id,
      evidenceCount: evidenceList.length,
      message: 'Evidence submitted successfully',
      milestoneStatus: 'voting'
    } as SubmitEvidenceResponse);
  } catch (error) {
    console.error('Error submitting evidence:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/milestones/:id/evidence
router.get('/:id/evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const evidence = await prisma.evidence.findMany({
      where: { milestoneId: id }
    });

    const formattedEvidence = evidence.map(e => ({
      id: e.id,
      milestoneId: e.milestoneId,
      type: e.type as any,
      title: e.title || '',
      description: e.description || '',
      url: e.url || '',
      uploadedAt: e.uploadedAt.toISOString(),
      uploadedBy: e.uploadedBy || ''
    }));

    res.json({ success: true, data: formattedEvidence });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// POST /api/milestones/:id/evidence
router.post('/:id/evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const evidence = await prisma.evidence.create({
      data: {
        milestoneId: id,
        type: body.type,
        title: body.title,
        description: body.description,
        url: body.url,
        uploadedBy: null // TODO: Get actual user ID from auth context
      }
    });

    res.json({
      success: true, data: {
        id: evidence.id,
        milestoneId: evidence.milestoneId,
        type: evidence.type,
        title: evidence.title,
        description: evidence.description,
        url: evidence.url,
        uploadedAt: evidence.uploadedAt.toISOString(),
        uploadedBy: evidence.uploadedBy
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// POST /api/milestones/:id/evidence/upload
router.post('/:id/evidence/upload', (req, res) => {
  // Handle file upload (mock)
  // In a real app, we would upload to IPFS or S3 here
  res.json({ success: true, data: { url: 'https://ipfs.io/ipfs/QmHash...', ipfsHash: 'QmHash...' } });
});

// GET /api/milestones/:id/votes
router.get('/:id/votes', async (req, res) => {
  try {
    const { id } = req.params;
    const votes = await prisma.vote.findMany({
      where: { milestoneId: id },
      include: { member: true }
    });

    const formattedVotes = votes.map(v => ({
      id: v.id,
      milestoneId: v.milestoneId,
      memberId: v.memberId,
      memberName: v.member.name || '',
      vote: v.voteType === 'approve',
      comment: v.comment || '',
      timestamp: v.createdAt.toISOString()
    }));

    res.json({ success: true, data: formattedVotes });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/milestones/:id/voting-summary
router.get('/:id/voting-summary', async (req, res) => {
  try {
    const { id } = req.params;

    // Get all votes
    const votes = await prisma.vote.findMany({
      where: { milestoneId: id }
    });

    // Get total voting power (sum of all members' voting power in the org)
    // First find the project -> org
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!milestone || !milestone.project.organizationId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: milestone.project.organizationId }
    });

    const totalVotingPower = members.reduce((sum, m) => sum + m.votingPower, 0);

    const approveVotes = votes
      .filter(v => v.voteType === 'approve')
      .reduce((sum, v) => sum + (v.votingPower || 1), 0);

    const rejectVotes = votes
      .filter(v => v.voteType === 'reject')
      .reduce((sum, v) => sum + (v.votingPower || 1), 0);

    const percentageApproved = totalVotingPower > 0 ? (approveVotes / totalVotingPower) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalVotingPower,
        approveVotes,
        rejectVotes,
        percentageApproved,
        thresholdRequired: 75, // Hardcoded threshold for now
        hasReachedThreshold: percentageApproved >= 75
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// POST /api/milestones/:id/finalize-voting
router.post('/:id/finalize-voting', async (req, res) => {
  try {
    const { id } = req.params;

    // In a real app, we would verify the threshold again here

    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        status: 'approved',
        approvedDate: new Date()
      }
    });

    // TODO: Trigger smart contract release here

    res.json({ success: true, data: { status: 'approved' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

export default router;
