/**
 * Mock API Server
 * 
 * Simple Express server that mimics the real backend API.
 * Returns realistic JSON responses for all endpoints.
 * 
 * To run:
 * 1. npm install express cors
 * 2. node mock-server/server.js
 * 3. Server runs on http://localhost:3001
 */

const express = require('express');
const cors = require('cors');
const mockData = require('./mockData');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ============================================
// AUTHENTICATION
// ============================================

app.post('/api/auth/signup', (req, res) => {
  const { email, password, role, organizationName, researchInstitution } = req.body;
  
  const user = {
    id: `user-${Date.now()}`,
    email,
    role,
    createdAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: {
      user,
      token: `mock-token-${Date.now()}`,
      message: 'Account created successfully',
    },
  });
});

app.post('/api/auth/signin', (req, res) => {
  const { email } = req.body;
  
  res.json({
    success: true,
    data: {
      user: mockData.users[0],
      token: `mock-token-${Date.now()}`,
      expiresIn: 3600,
    },
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: mockData.users[0],
  });
});

app.post('/api/auth/wallet/connect', (req, res) => {
  const { walletAddress, walletProvider } = req.body;
  
  res.json({
    success: true,
    data: {
      success: true,
      walletAddress,
      message: `${walletProvider} wallet connected successfully`,
    },
  });
});

// ============================================
// ORGANIZATION
// ============================================

app.get('/api/organizations/:id', (req, res) => {
  res.json({
    success: true,
    data: mockData.organization,
  });
});

app.patch('/api/organizations/:id', (req, res) => {
  res.json({
    success: true,
    data: { ...mockData.organization, ...req.body },
  });
});

app.get('/api/organizations/:id/members', (req, res) => {
  res.json({
    success: true,
    data: mockData.organizationMembers,
  });
});

app.post('/api/organizations/:id/members', (req, res) => {
  const newMember = {
    id: `member-${Date.now()}`,
    ...req.body,
    status: 'pending',
    joinedDate: new Date().toISOString().split('T')[0],
  };
  
  res.json({
    success: true,
    data: newMember,
  });
});

app.patch('/api/members/:id', (req, res) => {
  const updatedMember = {
    ...mockData.organizationMembers[0],
    ...req.body,
  };
  
  res.json({
    success: true,
    data: updatedMember,
  });
});

app.delete('/api/members/:id', (req, res) => {
  res.json({
    success: true,
    data: null,
  });
});

app.get('/api/organizations/:id/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: mockData.organizationDashboardStats,
  });
});

app.get('/api/organizations/:id/projects', (req, res) => {
  res.json({
    success: true,
    data: {
      data: mockData.projects,
      pagination: {
        page: 1,
        limit: 10,
        total: mockData.projects.length,
        totalPages: 1,
      },
    },
  });
});

app.get('/api/organizations/:id/pending-approvals', (req, res) => {
  const pendingMilestones = mockData.milestones.filter(m => m.status === 'voting');
  res.json({
    success: true,
    data: pendingMilestones,
  });
});

// ============================================
// RESEARCHER
// ============================================

app.get('/api/researchers/:id', (req, res) => {
  res.json({
    success: true,
    data: mockData.researcher,
  });
});

app.patch('/api/researchers/:id', (req, res) => {
  res.json({
    success: true,
    data: { ...mockData.researcher, ...req.body },
  });
});

app.get('/api/researchers/:id/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: mockData.researcherDashboardStats,
  });
});

app.get('/api/researchers/:id/projects', (req, res) => {
  res.json({
    success: true,
    data: {
      data: mockData.projects,
      pagination: {
        page: 1,
        limit: 10,
        total: mockData.projects.length,
        totalPages: 1,
      },
    },
  });
});

app.get('/api/researchers/:id/wallet/balance', (req, res) => {
  res.json({
    success: true,
    data: mockData.walletBalance,
  });
});

app.get('/api/researchers/:id/wallet/transactions', (req, res) => {
  res.json({
    success: true,
    data: {
      data: mockData.transactions,
      pagination: {
        page: 1,
        limit: 10,
        total: mockData.transactions.length,
        totalPages: 1,
      },
    },
  });
});

app.post('/api/researchers/:id/wallet/withdraw', (req, res) => {
  const { amount } = req.body;
  
  res.json({
    success: true,
    data: {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      amount,
      newBalance: mockData.walletBalance.balance - amount,
      message: `Successfully withdrawn ${amount} ADA`,
    },
  });
});

app.post('/api/researchers/:id/milestones/:milestoneId/claim', (req, res) => {
  const milestone = mockData.milestones.find(m => m.id === req.params.milestoneId);
  
  res.json({
    success: true,
    data: {
      success: true,
      milestoneId: req.params.milestoneId,
      fundingAmount: milestone?.fundingAmount || 10000,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      message: 'Milestone funding claimed successfully',
      newWalletBalance: mockData.walletBalance.balance + (milestone?.fundingAmount || 10000),
    },
  });
});

// ============================================
// PROJECTS
// ============================================

app.get('/api/projects/:id', (req, res) => {
  const project = mockData.projects.find(p => p.id === req.params.id) || mockData.projects[0];
  res.json({
    success: true,
    data: project,
  });
});

app.post('/api/projects/onboard', (req, res) => {
  const { projectTitle, researcherEmail, milestones, teamMemberIds } = req.body;
  
  res.json({
    success: true,
    data: {
      projectId: `proj-${Date.now()}`,
      status: 'success',
      message: `Project "${projectTitle}" onboarded successfully`,
      emailSent: true,
      researcherEmail,
      smartContractAddress: `addr1${Math.random().toString(36).substr(2, 58)}`,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    },
  });
});

app.get('/api/projects/:id/milestones', (req, res) => {
  res.json({
    success: true,
    data: mockData.milestones,
  });
});

app.get('/api/projects/:id/team', (req, res) => {
  res.json({
    success: true,
    data: mockData.projectTeamMembers,
  });
});

// ============================================
// MILESTONES
// ============================================

app.get('/api/milestones/:id', (req, res) => {
  const milestone = mockData.milestones.find(m => m.id === req.params.id) || mockData.milestones[0];
  res.json({
    success: true,
    data: milestone,
  });
});

app.post('/api/milestones/:id/submit', (req, res) => {
  const { evidence } = req.body;
  
  res.json({
    success: true,
    data: {
      success: true,
      milestoneId: req.params.id,
      evidenceCount: evidence.length,
      message: 'Evidence submitted successfully. Milestone is now pending approval.',
      milestoneStatus: 'voting',
    },
  });
});

app.get('/api/milestones/:id/evidence', (req, res) => {
  res.json({
    success: true,
    data: mockData.evidence,
  });
});

app.post('/api/milestones/:id/evidence', (req, res) => {
  const newEvidence = {
    id: `evidence-${Date.now()}`,
    milestoneId: req.params.id,
    ...req.body,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'current-user',
  };
  
  res.json({
    success: true,
    data: newEvidence,
  });
});

// ============================================
// VOTING
// ============================================

app.post('/api/votes', (req, res) => {
  const { voteType, votingPower, milestoneId } = req.body;
  
  // Calculate mock voting summary
  const approveVotes = voteType === 'approve' ? votingPower : 0;
  const totalPower = 26; // Mock total
  const newApproveTotal = 15 + approveVotes; // Mock existing + new
  const percentageApproved = (newApproveTotal / totalPower) * 100;
  
  res.json({
    success: true,
    data: {
      success: true,
      voteId: `vote-${Date.now()}`,
      weightedVote: votingPower,
      message: `Your vote (weight: ${votingPower}) has been recorded`,
      votingSummary: {
        totalVotingPower: totalPower,
        approveVotes: newApproveTotal,
        rejectVotes: 2,
        percentageApproved: Math.round(percentageApproved),
        hasReachedThreshold: percentageApproved >= 75,
      },
      milestoneStatus: percentageApproved >= 75 ? 'approved' : 'voting',
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    },
  });
});

app.get('/api/milestones/:id/votes', (req, res) => {
  res.json({
    success: true,
    data: mockData.votes,
  });
});

app.get('/api/milestones/:id/voting-summary', (req, res) => {
  res.json({
    success: true,
    data: {
      totalVotingPower: 26,
      approveVotes: 15,
      rejectVotes: 2,
      percentageApproved: 58,
      thresholdRequired: 75,
      hasReachedThreshold: false,
      votesRequired: 20,
      votesRemaining: 5,
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
      details: err.message,
    },
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   StemTrust Mock API Server              ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API Base: http://localhost:${PORT}/api`);
  console.log(`✓ Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('Available Endpoints:');
  console.log('  - POST /api/auth/signin');
  console.log('  - GET  /api/organizations/:id');
  console.log('  - GET  /api/researchers/:id');
  console.log('  - POST /api/projects/onboard');
  console.log('  - POST /api/votes');
  console.log('  - GET  /api/milestones/:id');
  console.log('  ... and more');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});
