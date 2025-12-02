import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { SubmitVoteRequest, SubmitVoteResponse } from '../types/api';

const router = Router();

// POST /api/votes
router.post('/', async (req, res) => {
  try {
    const body: SubmitVoteRequest = req.body;
    
    // 1. Validate Milestone Status
    const milestone = await prisma.milestone.findUnique({
      where: { id: body.milestoneId },
      include: { project: true }
    });

    if (!milestone) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    if (milestone.status !== 'voting') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Milestone is not in voting phase' } });
    }

    // 2. Check for duplicate vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        milestoneId: body.milestoneId,
        memberId: body.memberId
      }
    });

    if (existingVote) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE_VOTE', message: 'Member has already voted' } });
    }

    // 3. Get Member Voting Power (verify it matches request or fetch from DB)
    const member = await prisma.organizationMember.findUnique({
      where: { id: body.memberId }
    });

    if (!member) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Member not found' } });
    }

    // 4. Create Vote
    const vote = await prisma.vote.create({
      data: {
        milestoneId: body.milestoneId,
        projectId: milestone.projectId,
        memberId: body.memberId,
        voteType: body.voteType,
        votingPower: member.votingPower,
        comment: body.comment,
        transactionHash: 'tx-hash-vote' // Mock for now, or real if we had on-chain voting
      }
    });

    // 5. Calculate New Summary
    const allVotes = await prisma.vote.findMany({
      where: { milestoneId: body.milestoneId }
    });

    const orgMembers = await prisma.organizationMember.findMany({
      where: { organizationId: milestone.project.organizationId! }
    });

    const totalVotingPower = orgMembers.reduce((sum, m) => sum + m.votingPower, 0);
    
    const approveVotes = allVotes
      .filter(v => v.voteType === 'approve')
      .reduce((sum, v) => sum + (v.votingPower || 0), 0);
      
    const rejectVotes = allVotes
      .filter(v => v.voteType === 'reject')
      .reduce((sum, v) => sum + (v.votingPower || 0), 0);

    const percentageApproved = totalVotingPower > 0 ? (approveVotes / totalVotingPower) * 100 : 0;
    const hasReachedThreshold = percentageApproved >= 75; // Hardcoded threshold

    const response: SubmitVoteResponse = {
      success: true,
      voteId: vote.id,
      weightedVote: member.votingPower,
      message: 'Vote submitted successfully',
      votingSummary: {
        totalVotingPower,
        approveVotes,
        rejectVotes,
        percentageApproved,
        hasReachedThreshold
      },
      milestoneStatus: milestone.status as any,
      transactionHash: vote.transactionHash || undefined
    };
    
    res.json({ success: true, data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

export default router;
