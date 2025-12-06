import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { SubmitVoteRequest, SubmitVoteResponse } from '../types/api';
import { releaseFunds, getBackendWalletPubKeyHash, getScript } from '../services/smartContract';

const router = Router();

// POST /api/votes - OFF-CHAIN VOTING (No wallet signature needed)
router.post('/', async (req, res) => {
  try {
    const body: SubmitVoteRequest = req.body;

    // 1. Validate Milestone Status
    const milestone = await prisma.milestone.findUnique({
      where: { id: body.milestoneId },
      include: {
        project: {
          include: {
            researcher: true,
            milestones: { orderBy: { stageNumber: 'asc' } }
          }
        }
      }
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

    // 3. Get Member Voting Power
    const member = await prisma.organizationMember.findUnique({
      where: { id: body.memberId }
    });

    if (!member) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Member not found' } });
    }

    // 4. Create Vote (NO SIGNATURE REQUIRED - off-chain voting)
    const vote = await prisma.vote.create({
      data: {
        milestoneId: body.milestoneId,
        projectId: milestone.projectId,
        memberId: body.memberId,
        voteType: body.voteType,
        votingPower: member.votingPower,
        comment: body.comment,
        transactionHash: 'offchain-vote' // No on-chain tx for voting
      }
    });

    console.log(`[Vote] Member ${body.memberId} voted ${body.voteType} with power ${member.votingPower}`);

    // 5. Calculate Voting Summary
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
    const hasReachedThreshold = percentageApproved >= 75;

    let fundReleaseResult = null;

    // 6. AUTO-RELEASE FUNDS if threshold reached
    if (hasReachedThreshold) {
      console.log(`[Vote] Milestone approved! Releasing funds...`);

      // Update milestone status to 'approved'
      await prisma.milestone.update({
        where: { id: milestone.id },
        data: {
          status: 'approved',
          approvedDate: new Date()
        }
      });

      // Fresh DB query for researcher wallet
      const freshResearcher = await prisma.researcher.findUnique({
        where: { id: milestone.project.researcher?.id }
      });
      const researcherWallet = freshResearcher?.walletAddress;

      // Validate wallet address format - must be bech32
      if (researcherWallet && researcherWallet.startsWith('addr')) {
        try {
          const backendPubKeyHash = await getBackendWalletPubKeyHash();
          const milestoneIndex = milestone.project.milestones.findIndex(m => m.id === milestone.id);

          // DEBUG: Log exact values for comparison with test script
          console.log(`[DEBUG] milestoneIndex: ${milestoneIndex}`);
          console.log(`[DEBUG] project.totalFunding: ${milestone.project.totalFunding} (type: ${typeof milestone.project.totalFunding})`);
          console.log(`[DEBUG] milestones from DB:`, milestone.project.milestones.map(m => ({
            stageNumber: m.stageNumber,
            fundingPercentage: m.fundingPercentage,
            type: typeof m.fundingPercentage
          })));
          console.log(`[DEBUG] project.transactionHash: ${milestone.project.transactionHash}`);

          // Build datum params - MUST match exactly what was used in lockFunds!
          const datumParams = {
            organization: backendPubKeyHash,
            researcher: backendPubKeyHash,
            members: [backendPubKeyHash],
            totalFunds: Number(milestone.project.totalFunding) * 1_000_000, // LOVELACE
            milestones: milestone.project.milestones.map(m => Number(m.fundingPercentage) || 0),
            currentMilestone: milestoneIndex
          };

          console.log(`[DEBUG] Final datumParams.milestones: [${datumParams.milestones.join(', ')}]`);
          console.log(`[DEBUG] Final datumParams.totalFunds: ${datumParams.totalFunds}`);
          console.log(`[Vote] Releasing ${milestone.fundingAmount} ADA to ${researcherWallet.slice(0, 20)}...`);

          // Release funds to researcher
          const txHash = await releaseFunds(
            milestoneIndex,
            Number(milestone.fundingAmount),
            researcherWallet,
            milestone.project.transactionHash || '',
            datumParams
          );

          // Update milestone with release info
          await prisma.milestone.update({
            where: { id: milestone.id },
            data: {
              status: 'released',
              releaseDate: new Date(),
              transactionHash: txHash
            }
          });

          // Update project funding released
          await prisma.project.update({
            where: { id: milestone.projectId },
            data: {
              fundingReleased: {
                increment: Number(milestone.fundingAmount)
              }
            }
          });

          fundReleaseResult = {
            success: true,
            txHash,
            amount: Number(milestone.fundingAmount),
            recipient: researcherWallet
          };

          console.log(`[Vote] Funds released! Tx: ${txHash}`);
        } catch (releaseError: any) {
          console.error('[Vote] Failed to auto-release funds:', releaseError);
          fundReleaseResult = {
            success: false,
            error: releaseError.message
          };
        }
      } else {
        // Wallet address is either missing or in wrong format (hex instead of bech32)
        const errorMsg = researcherWallet
          ? 'Researcher wallet is in invalid format. Must start with addr_test1 or addr1.'
          : 'Researcher has not set their wallet address';
        console.warn(`[Vote] Cannot release funds - ${errorMsg}`);
        fundReleaseResult = {
          success: false,
          error: errorMsg
        };
      }

      // Auto-activate the next milestone
      const currentIndex = milestone.project.milestones.findIndex(m => m.id === milestone.id);
      const nextMilestone = milestone.project.milestones[currentIndex + 1];

      if (nextMilestone) {
        await prisma.milestone.update({
          where: { id: nextMilestone.id },
          data: {
            status: 'in_progress',
            startDate: new Date()
          }
        });
        console.log(`[Vote] Next milestone ${nextMilestone.id} activated`);
      }
    }

    const response: SubmitVoteResponse = {
      success: true,
      voteId: vote.id,
      weightedVote: member.votingPower,
      message: hasReachedThreshold ? 'Vote submitted - Threshold reached! Funds releasing...' : 'Vote submitted successfully',
      votingSummary: {
        totalVotingPower,
        approveVotes,
        rejectVotes,
        percentageApproved,
        hasReachedThreshold
      },
      milestoneStatus: hasReachedThreshold ? 'approved' : 'voting',
      fundRelease: fundReleaseResult
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('[Vote] Error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

export default router;
