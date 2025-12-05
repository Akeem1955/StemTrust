import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../services/email';
import {
  Project,
  OnboardProjectRequest,
  OnboardProjectResponse,
  ProjectTeamMember,
  Milestone,
  ProjectStatus
} from '../types/api';
import { lockFunds, getScript, buildDatum } from '../services/smartContract';

const router = Router();

// Helper to format project
const formatProject = (p: any): Project => ({
  id: p.id,
  title: p.title,
  description: p.description || '',
  category: p.category || '',
  organizationId: p.organizationId || '',
  organizationName: p.organization?.name || '',
  researcherId: p.researcherId || '',
  researcherName: p.researcher?.name || '',
  researcherEmail: p.researcher?.user?.email || '',
  institution: p.researcher?.institution || '',
  researcherWalletAddress: p.researcher?.walletAddress || '',
  totalFunding: Number(p.totalFunding),
  fundingReleased: Number(p.fundingReleased),
  status: p.status as ProjectStatus,
  createdAt: p.createdAt.toISOString(),
  updatedAt: p.updatedAt.toISOString(),
  milestones: p.milestones?.map((m: any) => ({
    id: m.id,
    stageNumber: m.stageNumber,
    title: m.title,
    status: m.status as any,
    fundingAmount: Number(m.fundingAmount),
    fundingPercentage: m.fundingPercentage
  })) || [],
  teamMembers: p.teamMembers?.map((tm: any) => ({
    id: tm.member.id,
    name: tm.member.name,
    role: tm.member.role,
    email: tm.member.email
  })) || [],
  backers: p.organization ? [{
    id: p.organization.id,
    name: p.organization.name,
    walletAddress: p.organization.walletAddress || '',
    amount: Number(p.totalFunding)
  }] : [],
  currentMilestone: (p.milestones?.filter((m: any) => m.status === 'approved').length || 0) + 1
});

// GET /api/projects/lock-tx-params - Returns parameters needed for frontend to build lock transaction
// IMPORTANT: This route must be defined BEFORE /:id route to prevent Express treating 'lock-tx-params' as an ID
router.get('/lock-tx-params', async (req, res) => {
  try {
    const { scriptAddr, scriptCbor } = getScript();

    res.json({
      success: true,
      data: {
        scriptAddress: scriptAddr,
        scriptCbor: scriptCbor,
        // Frontend will use buildDatum() equivalent with these params
        datumStructure: {
          fields: ['organizationHash', 'researcherHash', 'memberHashes', 'totalFunds', 'milestonePercentages', 'currentMilestone']
        }
      }
    });
  } catch (error: any) {
    console.error('Error getting lock params:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SMART_CONTRACT_ERROR',
        message: error.message || 'Failed to get script parameters'
      }
    });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        organization: true,
        researcher: {
          include: { user: true }
        },
        milestones: {
          orderBy: { stageNumber: 'asc' }
        },
        teamMembers: {
          include: {
            member: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    res.json({ success: true, data: formatProject(project) });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// POST /api/projects/onboard
router.post('/onboard', async (req, res) => {
  const body: OnboardProjectRequest = req.body;

  try {
    // 1. Find Researcher by email or create if not exists (simplified for now, assuming researcher exists or we link by ID)
    // In a real flow, we might invite them. Here we assume the ID is passed or we look up by email.
    // The request body has researcherEmail.

    let researcherId = body.researcherId;

    // If no ID provided, try to find by email
    if (!researcherId && body.researcherEmail) {
      const user = await prisma.user.findUnique({ where: { email: body.researcherEmail } });

      if (user) {
        // User exists, get their researcher profile
        const researcher = await prisma.researcher.findUnique({ where: { userId: user.id } });
        if (researcher) {
          researcherId = researcher.id;
        } else if (user.role === 'researcher') {
          // User is researcher but no profile? Should not happen, but let's create one
          const newResearcher = await prisma.researcher.create({
            data: { userId: user.id, name: body.researcherName || 'Researcher' }
          });
          researcherId = newResearcher.id;
        }
      } else {
        // User does NOT exist. We need to create a placeholder/shadow user so the project is linked.
        // This ensures when they sign up with this email, they get access.
        // We'll create a user with a default password so they can sign in immediately.

        const tempPassword = 'StemTrust2025!'; // Default password for auto-onboarded users

        // Dynamic import for bcrypt to avoid top-level issues if any
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = await prisma.user.create({
          data: {
            email: body.researcherEmail,
            passwordHash: hashedPassword,
            role: 'researcher',
            researcher: {
              create: {
                name: body.researcherName || 'Invited Researcher',
                institution: body.institution || 'Pending Institution'
              }
            }
          },
          include: { researcher: true }
        });

        if (newUser.researcher) {
          researcherId = newUser.researcher.id;
        }
      }
    }

    // 2. Create Project in DB
    const project = await prisma.project.create({
      data: {
        title: body.projectTitle, // Mapped from projectTitle
        description: body.projectDescription, // Mapped from projectDescription
        category: body.category,
        organizationId: body.organizationId, // Assuming this comes from auth context or body
        researcherId: researcherId,
        totalFunding: body.totalFunding,
        status: 'pending_onboarding',
        milestones: {
          create: body.milestones.map((m, index) => ({
            stageNumber: index + 1,
            title: m.title,
            description: m.description,
            fundingAmount: (Number(body.totalFunding) * (m.fundingPercentage / 100)),
            fundingPercentage: m.fundingPercentage,
            durationWeeks: m.durationWeeks,
            status: 'pending'
          }))
        }
      },
      include: {
        milestones: true
      }
    });

    // 3. Lock Funds on Blockchain
    let txHash = 'mock-tx-hash';
    let scriptAddress = 'addr_test1_mock_script';

    // Check if frontend already signed and submitted the transaction
    if (body.transactionHash) {
      // Frontend handled the signing - use their transaction hash
      txHash = body.transactionHash;
      console.log('Using frontend-signed transaction:', txHash);

      // Get the real script address
      try {
        const { scriptAddr } = getScript();
        scriptAddress = scriptAddr;
      } catch (e) {
        // If blueprint not available, keep mock address
        console.warn('Could not get script address:', e);
      }
    } else if (process.env.BLOCKFROST && process.env.mnemonic) {
      // Fallback: Backend signs with server wallet (deprecated)
      console.warn('Using backend wallet for signing - this is deprecated');
      try {
        const mockHash = "a2c20c77887ace1cd986193e4e75babd8993cfd56995cd5cfce609c2"; // Example

        txHash = await lockFunds(
          Number(body.totalFunding), // Ensure number
          body.milestones.map(m => ({ percentage: m.fundingPercentage })),
          mockHash, // Organization
          mockHash, // Researcher
          [mockHash] // Members
        );
        // In a real app, we would get the script address from the contract compilation
      } catch (e: any) {
        console.error("Smart contract error:", e);
        // We might want to delete the project if locking fails, or mark it as failed
        return res.status(500).json({
          success: false,
          error: {
            code: 'SMART_CONTRACT_ERROR',
            message: e.message || 'Unknown error'
          }
        });
      }
    }

    // 4. Update Project with Smart Contract Info
    await prisma.project.update({
      where: { id: project.id },
      data: {
        smartContractAddress: scriptAddress,
        transactionHash: txHash,
        status: 'active' // Activate project after locking funds
      }
    });

    // 4b. Auto-activate the first milestone so researcher can immediately submit evidence
    const firstMilestone = await prisma.milestone.findFirst({
      where: { projectId: project.id },
      orderBy: { stageNumber: 'asc' }
    });

    if (firstMilestone) {
      await prisma.milestone.update({
        where: { id: firstMilestone.id },
        data: {
          status: 'in_progress',
          startDate: new Date()
        }
      });
    }

    // 5. Send Email to Researcher
    const loginUrl = 'http://localhost:3000/auth';
    const emailSubject = `Project Onboarding: ${body.projectTitle}`;
    const emailBody = `
      Hello ${body.researcherName || 'Researcher'},

      An organization has onboarded a new project titled "${body.projectTitle}" and assigned you as the lead researcher.

      Project Details:
      - Title: ${body.projectTitle}
      - Total Funding: ${body.totalFunding} ADA
      - Milestones: ${body.milestones.length}

      To access your project dashboard and submit evidence for milestones:
      1. Go to ${loginUrl}
      2. Select "Sign In" (Your account has been automatically created)
      3. Email: ${body.researcherEmail}
      4. Password: StemTrust2025!

      Please change your password after your first login.

      Best regards,
      StemTrust Team
    `;

    try {
      await sendEmail(body.researcherEmail, emailSubject, emailBody);
    } catch (emailError) {
      console.error('Failed to send researcher email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    const response: OnboardProjectResponse = {
      projectId: project.id,
      status: 'success',
      message: 'Project onboarded successfully',
      emailSent: true,
      researcherEmail: body.researcherEmail,
      smartContractAddress: scriptAddress,
      transactionHash: txHash
    };

    res.json({ success: true, data: response });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// PATCH /api/projects/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: updates.title,
        description: updates.description,
        status: updates.status
      },
      include: {
        organization: true,
        researcher: { include: { user: true } },
        milestones: true,
        teamMembers: { include: { member: true } }
      }
    });

    res.json({ success: true, data: formatProject(project) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// PATCH /api/projects/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: { status },
      include: {
        organization: true,
        researcher: { include: { user: true } },
        milestones: true,
        teamMembers: { include: { member: true } }
      }
    });

    res.json({ success: true, data: formatProject(project) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/projects/:id/team
router.get('/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    const teamMembers = await prisma.projectTeamMember.findMany({
      where: { projectId: id },
      include: { member: true }
    });

    const formattedTeam = teamMembers.map(tm => ({
      id: tm.member.id,
      name: tm.member.name,
      role: tm.member.role,
      email: tm.member.email
    }));

    res.json({ success: true, data: formattedTeam });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// POST /api/projects/:id/team
router.post('/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    // Check if already exists
    const existing = await prisma.projectTeamMember.findFirst({
      where: { projectId: id, memberId }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE_ENTRY', message: 'Member already in team' } });
    }

    const teamMember = await prisma.projectTeamMember.create({
      data: {
        projectId: id,
        memberId
      },
      include: { member: true }
    });

    res.json({
      success: true, data: {
        id: teamMember.member.id,
        name: teamMember.member.name,
        role: teamMember.member.role,
        email: teamMember.member.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// DELETE /api/projects/:id/team/:memberId
router.delete('/:id/team/:memberId', async (req, res) => {
  try {
    const { id, memberId } = req.params;

    // We need to find the ProjectTeamMember record first because we are deleting by memberId, not the join table ID
    const teamMember = await prisma.projectTeamMember.findFirst({
      where: { projectId: id, memberId }
    });

    if (teamMember) {
      await prisma.projectTeamMember.delete({
        where: { id: teamMember.id }
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/projects/:id/milestones
router.get('/:id/milestones', async (req, res) => {
  try {
    const { id } = req.params;
    const milestones = await prisma.milestone.findMany({
      where: { projectId: id },
      orderBy: { stageNumber: 'asc' }
    });

    const formattedMilestones = milestones.map(m => ({
      id: m.id,
      stageNumber: m.stageNumber,
      title: m.title,
      description: m.description || '',
      fundingAmount: Number(m.fundingAmount),
      fundingPercentage: m.fundingPercentage || 0,
      durationWeeks: m.durationWeeks || 0,
      status: m.status as any,
      startDate: m.startDate?.toISOString(),
      evidence: [], // Not fetching evidence here for list view
      votes: []
    }));

    res.json({ success: true, data: formattedMilestones });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/projects/:id/voting-status
router.get('/:id/voting-status', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any milestone is in voting status
    const votingMilestone = await prisma.milestone.findFirst({
      where: {
        projectId: id,
        status: 'voting'
      }
    });

    res.json({ success: true, data: { status: votingMilestone ? 'active' : 'inactive' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// MILESTONES & EVIDENCE

// POST /api/projects/milestones/:milestoneId/submit
router.post('/milestones/:milestoneId/submit', async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { evidence } = req.body; // Array of evidence objects

    // 1. Create Evidence records
    await prisma.evidence.createMany({
      data: evidence.map((e: any) => ({
        milestoneId,
        type: e.type,
        title: e.title,
        description: e.description,
        url: e.url,
        uploadedAt: new Date()
      }))
    });

    // 2. Update Milestone Status to 'voting'
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'voting',
        submittedDate: new Date()
      }
    });

    res.json({ success: true, message: 'Evidence submitted and voting started' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// GET /api/projects/milestones/:milestoneId/evidence
router.get('/milestones/:milestoneId/evidence', async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const evidence = await prisma.evidence.findMany({
      where: { milestoneId },
      orderBy: { uploadedAt: 'desc' }
    });
    res.json({ success: true, data: evidence });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// VOTING

// POST /api/projects/votes
router.post('/votes', async (req, res) => {
  try {
    const { milestoneId, projectId, memberId, voteType, votingPower, signature, walletAddress } = req.body;

    // 1. Check if already voted
    const existingVote = await prisma.vote.findFirst({
      where: { milestoneId, memberId }
    });

    if (existingVote) {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_VOTED', message: 'You have already voted on this milestone' } });
    }

    // 2. Create Vote
    await prisma.vote.create({
      data: {
        milestoneId,
        projectId,
        memberId,
        voteType,
        votingPower,
        transactionHash: signature // Storing signature as tx hash for now or separate field
      }
    });

    // 3. Check Threshold
    const votes = await prisma.vote.findMany({ where: { milestoneId } });
    const totalVotes = votes.length; // Simplified: 1 vote per member for now, or sum votingPower
    const approveVotes = votes.filter(v => v.voteType === 'approve').length;
    const percentageApproved = totalVotes > 0 ? (approveVotes / totalVotes) * 100 : 0;

    let releaseData = null;

    if (percentageApproved >= 75) {
      // Threshold reached!
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          status: 'approved',
          approvedDate: new Date()
        }
      });

      // Mock release data for smart contract
      releaseData = {
        paymentAmount: 10000000, // Mock amount
        scriptAddr: 'addr_test1_mock',
        researcherAddress: 'addr_test1_researcher',
        datumParams: {
          currentMilestone: 1
        },
        redeemerParams: {
          milestoneIndex: 0
        },
        scriptUtxo: {
          input: { txHash: 'mock', outputIndex: 0 },
          output: { amount: [{ unit: 'lovelace', quantity: '20000000' }] }
        },
        scriptCbor: 'mock_cbor'
      };
    }

    res.json({
      success: true,
      message: 'Vote recorded',
      votingSummary: {
        totalVotingPower: totalVotes,
        approveVotes,
        rejectVotes: totalVotes - approveVotes,
        percentageApproved,
        hasReachedThreshold: percentageApproved >= 75
      },
      releaseData
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// GET /api/projects/milestones/:milestoneId/voting-summary
router.get('/milestones/:milestoneId/voting-summary', async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const votes = await prisma.vote.findMany({ where: { milestoneId } });

    const totalVotes = votes.length;
    const approveVotes = votes.filter(v => v.voteType === 'approve').length;
    const rejectVotes = votes.filter(v => v.voteType === 'reject').length;
    const percentageApproved = totalVotes > 0 ? (approveVotes / totalVotes) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalVotingPower: totalVotes,
        approveVotes,
        rejectVotes,
        percentageApproved,
        hasReachedThreshold: percentageApproved >= 75
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

export default router;
