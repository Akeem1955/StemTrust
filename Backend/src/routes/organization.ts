import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { 
  Organization, 
  OrganizationMember, 
  AddMemberRequest, 
  OrganizationDashboardStats,
  Project,
  ProjectStatus
} from '../types/api';

const router = Router();

// Helper to format organization
const formatOrg = (org: any): Organization => ({
  id: org.id,
  name: org.name,
  email: org.user?.email || '',
  description: org.description || undefined,
  logoUrl: org.logoUrl || undefined,
  walletAddress: org.walletAddress || undefined,
  createdAt: org.createdAt.toISOString(),
  updatedAt: org.updatedAt.toISOString(),
  stats: {
    totalProjects: org.projects?.length || 0,
    activeProjects: org.projects?.filter((p: any) => p.status === 'active').length || 0,
    totalFunding: org.projects?.reduce((sum: number, p: any) => sum + Number(p.totalFunding || 0), 0) || 0,
    totalMembers: org.members?.length || 0
  }
});

// GET /api/organizations/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        user: true,
        projects: true,
        members: true
      }
    });

    if (!org) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Organization not found' } });
    }

    res.json({ success: true, data: formatOrg(org) });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// PATCH /api/organizations/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const org = await prisma.organization.update({
      where: { id },
      data: {
        name: updates.name,
        description: updates.description,
        logoUrl: updates.logoUrl,
        walletAddress: updates.walletAddress
      },
      include: {
        user: true,
        projects: true,
        members: true
      }
    });

    res.json({ success: true, data: formatOrg(org) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/organizations/:id/members
router.get('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: id }
    });

    const formattedMembers = members.map(m => ({
      id: m.id,
      email: m.email,
      name: m.name || '',
      votingPower: m.votingPower,
      status: m.status as any,
      role: m.role as any,
      joinedDate: m.joinedDate.toISOString(),
      lastActive: m.lastActive?.toISOString()
    }));

    res.json({ success: true, data: formattedMembers });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// POST /api/organizations/:id/members
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const body: AddMemberRequest = req.body;

    const member = await prisma.organizationMember.create({
      data: {
        organizationId: id,
        email: body.email,
        name: body.name,
        votingPower: body.votingPower,
        role: body.role,
        status: 'pending'
      }
    });

    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/organizations/:id/dashboard/stats
router.get('/:id/dashboard/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            milestones: true
          }
        }
      }
    });

    if (!org) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }

    const totalProjects = org.projects.length;
    const activeProjects = org.projects.filter(p => p.status === 'active').length;
    const totalFundingCommitted = org.projects.reduce((sum, p) => sum + Number(p.totalFunding || 0), 0);
    const totalFundingReleased = org.projects.reduce((sum, p) => sum + Number(p.fundingReleased || 0), 0);
    
    // Calculate pending approvals (milestones in 'voting' status)
    let pendingApprovals = 0;
    org.projects.forEach(p => {
      pendingApprovals += p.milestones.filter(m => m.status === 'voting').length;
    });

    const stats: OrganizationDashboardStats = {
      overview: {
        totalProjects,
        activeProjects,
        totalFundingCommitted,
        totalFundingReleased,
        pendingApprovals
      },
      projectsOverTime: [
        { month: 'Jan', count: 2 }, // Mock for now, or aggregate from DB
        { month: 'Feb', count: 3 },
        { month: 'Mar', count: 5 }
      ],
      fundingDistribution: [
        { category: 'Agriculture', amount: 150000 }, // Mock or aggregate
        { category: 'Technology', amount: 100000 }
      ],
      milestoneProgress: [
        { status: 'Completed', count: 15 },
        { status: 'In Progress', count: 8 }
      ],
      recentProjects: org.projects.slice(0, 5).map(p => ({
        id: p.id,
        title: p.title,
        status: p.status as ProjectStatus,
        updatedAt: p.updatedAt.toISOString()
      }))
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/organizations/:id/projects
router.get('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await prisma.project.findMany({
      where: { organizationId: id },
      include: {
        researcher: true,
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
      organizationName: 'Nigerian Research Foundation', // Could fetch org name
      researcherId: p.researcherId || '',
      researcherName: p.researcher?.name || '',
      researcherEmail: '', // Need to fetch user email if needed
      institution: p.researcher?.institution || '',
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


// GET /api/organizations/:id/pending-approvals
router.get('/:id/pending-approvals', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find milestones that are in 'voting' status for projects belonging to this org
    const milestones = await prisma.milestone.findMany({
      where: {
        project: {
          organizationId: id
        },
        status: 'voting'
      },
      include: {
        project: {
          include: {
            researcher: true
          }
        }
      }
    });

    const formattedApprovals = milestones.map(m => ({
      id: m.id,
      type: 'milestone_release', // Currently only milestone releases need approval
      projectId: m.projectId,
      projectTitle: m.project.title,
      amount: Number(m.fundingAmount),
      requester: m.project.researcher?.name || 'Unknown Researcher',
      date: m.updatedAt.toISOString(),
      status: 'pending',
      votes: {
        yes: 0, // TODO: Implement voting logic
        no: 0,
        total: 0
      }
    }));

    res.json({ success: true, data: formattedApprovals });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// Analytics endpoints

// GET /api/organizations/:id/analytics/funding
router.get('/:id/analytics/funding', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Aggregate funding by category
    const projects = await prisma.project.findMany({
      where: { organizationId: id },
      select: {
        category: true,
        totalFunding: true
      }
    });

    const distribution: Record<string, number> = {};
    
    projects.forEach(p => {
      const category = p.category || 'Uncategorized';
      const amount = Number(p.totalFunding);
      distribution[category] = (distribution[category] || 0) + amount;
    });

    const formattedDistribution = Object.entries(distribution).map(([category, amount]) => ({
      category,
      amount
    }));

    res.json({ success: true, data: formattedDistribution });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/organizations/:id/analytics/projects
router.get('/:id/analytics/projects', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Group projects by creation month
    // Note: This is a simple JS aggregation. For large datasets, use raw SQL date_trunc
    const projects = await prisma.project.findMany({
      where: { organizationId: id },
      select: { createdAt: true }
    });

    const monthlyCounts: Record<string, number> = {};
    
    projects.forEach(p => {
      const month = p.createdAt.toLocaleString('default', { month: 'short' });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    // Sort by month order if needed, for now just returning what we have
    const formattedProjectsOverTime = Object.entries(monthlyCounts).map(([month, count]) => ({
      month,
      count
    }));

    res.json({ success: true, data: formattedProjectsOverTime });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/organizations/:id/analytics/milestones
router.get('/:id/analytics/milestones', async (req, res) => {
  try {
    const { id } = req.params;
    
    const milestones = await prisma.milestone.findMany({
      where: {
        project: {
          organizationId: id
        }
      },
      select: { status: true }
    });

    const statusCounts: Record<string, number> = {};
    
    milestones.forEach(m => {
      const status = m.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const formattedMilestoneProgress = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));

    res.json({ success: true, data: formattedMilestoneProgress });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

export default router;
