import { Router } from 'express';
import { prisma } from '../lib/prisma';
import {
  Researcher,
  ResearcherDashboardStats,
  Project,
  WalletBalance,
  FundingTransaction,
  WithdrawFundsRequest,
  WithdrawFundsResponse,
  ClaimMilestoneRequest,
  ClaimMilestoneResponse,
  ProjectStatus
} from '../types/api';

const router = Router();

// Helper to format researcher
const formatResearcher = (res: any): Researcher => ({
  id: res.id,
  email: res.user?.email || '',
  name: res.name || '',
  institution: res.institution || '',
  bio: res.bio || '',
  walletAddress: res.walletAddress || undefined,
  createdAt: res.createdAt.toISOString(),
  updatedAt: res.updatedAt.toISOString(),
  stats: {
    totalProjects: res.projects?.length || 0,
    activeProjects: res.projects?.filter((p: any) => p.status === 'active').length || 0,
    completedMilestones: res.projects?.reduce((sum: number, p: any) =>
      sum + (p.milestones?.filter((m: any) => m.status === 'completed').length || 0), 0) || 0,
    totalFundingReceived: res.projects?.reduce((sum: number, p: any) =>
      sum + Number(p.fundingReleased || 0), 0) || 0
  }
});

// GET /api/researchers/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const researcher = await prisma.researcher.findUnique({
      where: { id },
      include: {
        user: true,
        projects: {
          include: {
            milestones: true
          }
        }
      }
    });

    if (!researcher) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Researcher not found' } });
    }

    res.json({ success: true, data: formatResearcher(researcher) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// PATCH /api/researchers/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // VALIDATE WALLET ADDRESS - must be bech32 format (addr_test1... or addr1...)
    // Reject hex format wallet addresses
    if (updates.walletAddress) {
      if (!updates.walletAddress.startsWith('addr')) {
        console.log(`[Researcher] ❌ REJECTED invalid wallet format: ${updates.walletAddress}`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_WALLET_FORMAT',
            message: 'Wallet address must be in bech32 format (start with addr_test1 or addr1)'
          }
        });
      }
      console.log(`[Researcher] ✅ Valid wallet format: ${updates.walletAddress}`);
    }

    const researcher = await prisma.researcher.update({
      where: { id },
      data: {
        name: updates.name,
        institution: updates.institution,
        bio: updates.bio,
        walletAddress: updates.walletAddress
      },
      include: {
        user: true,
        projects: {
          include: {
            milestones: true
          }
        }
      }
    });

    res.json({ success: true, data: formatResearcher(researcher) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/researchers/:id/dashboard/stats
router.get('/:id/dashboard/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const researcher = await prisma.researcher.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            milestones: true
          }
        }
      }
    });

    if (!researcher) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }

    const totalProjects = researcher.projects.length;
    const activeProjects = researcher.projects.filter(p => p.status === 'active').length;
    const totalFundingReceived = researcher.projects.reduce((sum, p) => sum + Number(p.fundingReleased || 0), 0);

    let completedMilestones = 0;
    let pendingMilestones = 0;

    researcher.projects.forEach(p => {
      completedMilestones += p.milestones.filter(m => m.status === 'completed').length;
      pendingMilestones += p.milestones.filter(m => m.status === 'pending' || m.status === 'in_progress').length;
    });

    const stats: ResearcherDashboardStats = {
      overview: {
        totalProjects,
        activeProjects,
        completedMilestones,
        totalFundingReceived,
        pendingMilestones,
        walletBalance: 0 // TODO: Fetch real wallet balance
      },
      milestoneTimeline: [], // TODO: Aggregate from milestones
      fundingReceived: [], // TODO: Aggregate from transactions
      projectProgress: researcher.projects.map(p => ({
        projectId: p.id,
        projectName: p.title,
        progress: 0, // TODO: Calculate progress
        status: p.status as ProjectStatus
      })),
      recentActivity: [] // TODO: Fetch recent activity
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/researchers/:id/projects
router.get('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await prisma.project.findMany({
      where: { researcherId: id },
      include: {
        organization: true,
        milestones: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedProjects = projects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      category: p.category || '',
      organizationId: p.organizationId || '',
      organizationName: p.organization?.name || '',
      researcherId: p.researcherId || '',
      researcherName: '', // Already known
      researcherEmail: '',
      institution: '',
      totalFunding: Number(p.totalFunding),
      fundingReleased: Number(p.fundingReleased),
      status: p.status as ProjectStatus,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      milestones: p.milestones.map(m => ({
        id: m.id,
        stageNumber: m.stageNumber,
        title: m.title,
        status: m.status as any,
        fundingAmount: Number(m.fundingAmount)
      })),
      teamMembers: []
    }));

    res.json({ success: true, data: formattedProjects });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/researchers/:id/pending-milestones
router.get('/:id/pending-milestones', async (req, res) => {
  try {
    const { id } = req.params;
    const milestones = await prisma.milestone.findMany({
      where: {
        project: {
          researcherId: id
        },
        status: {
          in: ['pending', 'in_progress']
        }
      },
      include: {
        project: true
      },
      orderBy: { stageNumber: 'asc' }
    });

    const formattedMilestones = milestones.map(m => ({
      id: m.id,
      title: m.title,
      projectTitle: m.project.title,
      status: m.status,
      dueDate: new Date().toISOString() // TODO: Add dueDate to Milestone model
    }));

    res.json({ success: true, data: formattedMilestones });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/researchers/:id/recent-activity
router.get('/:id/recent-activity', (req, res) => {
  // TODO: Implement activity log
  res.json({ success: true, data: [] });
});

// GET /api/researchers/:id/wallet/balance
router.get('/:id/wallet/balance', async (req, res) => {
  try {
    const { id } = req.params;
    const researcher = await prisma.researcher.findUnique({
      where: { id }
    });

    const balance: WalletBalance = {
      address: researcher?.walletAddress || '',
      balance: 0, // TODO: Fetch from blockchain or internal ledger
      pendingFunds: 0,
      lastUpdated: new Date().toISOString()
    };
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/researchers/:id/wallet/transactions
router.get('/:id/wallet/transactions', (req, res) => {
  res.json({ success: true, data: [] });
});

// POST /api/researchers/:id/wallet/withdraw
router.post('/:id/wallet/withdraw', (req, res) => {
  const body: WithdrawFundsRequest = req.body;
  res.json({
    success: true,
    transactionHash: 'tx-hash-withdraw',
    amount: body.amount,
    newBalance: 0,
    message: 'Withdrawal successful'
  } as WithdrawFundsResponse);
});

// POST /api/researchers/:id/milestones/:milestoneId/claim
router.post('/:id/milestones/:milestoneId/claim', (req, res) => {
  // Logic to claim funds from smart contract
  res.json({
    success: true,
    milestoneId: req.params.milestoneId,
    fundingAmount: 15000,
    transactionHash: 'tx-hash-claim',
    message: 'Funds claimed successfully',
    newWalletBalance: 20000
  } as ClaimMilestoneResponse);
});

// GET /api/researchers/:id/funding/summary
router.get('/:id/funding/summary', async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await prisma.project.findMany({
      where: { researcherId: id }
    });

    const totalReceived = projects.reduce((sum, p) => sum + Number(p.fundingReleased || 0), 0);
    const totalFunding = projects.reduce((sum, p) => sum + Number(p.totalFunding || 0), 0);
    const pending = totalFunding - totalReceived;

    res.json({ success: true, data: { totalReceived, pending } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// Analytics
router.get('/:id/analytics/:metric', (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
