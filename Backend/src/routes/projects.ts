import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { 
  Project, 
  OnboardProjectRequest, 
  OnboardProjectResponse,
  ProjectTeamMember,
  Milestone,
  ProjectStatus
} from '../types/api';
import { lockFunds } from '../services/smartContract';

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
  })) || []
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
    if (!researcherId && body.researcherEmail) {
      const user = await prisma.user.findUnique({ where: { email: body.researcherEmail } });
      if (user) {
        const researcher = await prisma.researcher.findUnique({ where: { userId: user.id } });
        if (researcher) researcherId = researcher.id;
      }
    }

    // 2. Create Project in DB
    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
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

    if (process.env.BLOCKFROST && process.env.mnemonic) {
        try {
            const mockHash = "a2c20c77887ace1cd986193e4e75babd8993cfd56995cd5cfce609c2"; // Example
            
            txHash = await lockFunds(
                body.totalFunding,
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

    res.json({ success: true, data: {
      id: teamMember.member.id,
      name: teamMember.member.name,
      role: teamMember.member.role,
      email: teamMember.member.email
    }});
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

export default router;
