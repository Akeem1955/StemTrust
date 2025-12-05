/**
 * API Type Definitions
 * 
 * These types match the expected backend API responses.
 * Update these when the backend schema changes.
 */

// ============================================
// COMMON TYPES
// ============================================

export type UserRole = 'organization' | 'researcher' | 'community';

export type ProjectStatus =
  | 'pending_onboarding'
  | 'active'
  | 'milestone_pending'
  | 'milestone_approved'
  | 'milestone_rejected'
  | 'completed'
  | 'cancelled';

export type MilestoneStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'voting'
  | 'approved'
  | 'rejected'
  | 'released';

export type VoteType = 'approve' | 'reject';

export type MemberStatus = 'active' | 'pending' | 'inactive';

export type MemberRole = 'admin' | 'member' | 'viewer';

export type WalletProvider = 'nami' | 'eternl' | 'flint' | 'yoroi' | 'lace';

// ============================================
// AUTHENTICATION
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  organizationName?: string;
  organizationId?: string;
  researcherId?: string;
  institution?: string;
  walletAddress?: string;
  walletProvider?: WalletProvider;
  createdAt: string;
  lastLoginAt?: string;
  memberships?: { id: string; organizationId: string; organizationName: string; role: string; status?: string }[];
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: AuthUser;
  token: string;
  expiresIn: number;
}

export interface SignUpRequest {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
  organizationName?: string;
  researchInstitution?: string;
}

export interface SignUpResponse {
  user: AuthUser;
  token: string;
  message: string;
}

export interface WalletConnectRequest {
  userId: string;
  walletAddress: string;
  walletProvider: WalletProvider;
  signature: string;
}

export interface WalletConnectResponse {
  success: boolean;
  walletAddress: string;
  message: string;
}

// ============================================
// ORGANIZATION
// ============================================

export interface Organization {
  id: string;
  name: string;
  email: string;
  description?: string;
  logoUrl?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalProjects: number;
    activeProjects: number;
    totalFunding: number;
    totalMembers: number;
  };
}

export interface OrganizationMember {
  id: string;
  email: string;
  name?: string;
  votingPower: number; // 1-10
  status: MemberStatus;
  role: MemberRole;
  joinedDate: string;
  lastActive?: string;
  projectsAssigned?: number;
}

export interface AddMemberRequest {
  organizationId: string;
  email: string;
  name?: string;
  votingPower?: number;
  role?: MemberRole;
}

export interface UpdateMemberRequest {
  memberId: string;
  votingPower?: number;
  role?: MemberRole;
  status?: MemberStatus;
}

// ============================================
// RESEARCHER
// ============================================

export interface Researcher {
  id: string;
  email: string;
  name?: string;
  institution?: string;
  bio?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedMilestones: number;
    totalFundingReceived: number;
  };
}

// ============================================
// PROJECTS
// ============================================

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  organizationId: string;
  organizationName: string;
  researcherId: string;
  researcherName: string;
  researcherEmail: string;
  institution: string;
  researcherWalletAddress?: string;
  totalFunding: number; // ADA
  fundingReleased: number; // ADA
  status: ProjectStatus;
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  estimatedEndDate?: string;
  milestones: Milestone[];
  teamMembers: ProjectTeamMember[];
  smartContractAddress?: string;
  transactionHash?: string;
  backers?: Array<{
    id: string;
    name: string;
    walletAddress: string;
    amount: number;
  }>;
  currentMilestone?: number;
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  email: string;
  votingPower: number;
  role: MemberRole;
  status: MemberStatus;
}

export interface Milestone {
  id: string;
  projectId: string;
  stageNumber: number;
  title: string;
  description: string;
  fundingAmount: number; // ADA
  fundingPercentage: number;
  durationWeeks: number;
  status: MilestoneStatus;
  startDate?: string;
  endDate?: string;
  submittedDate?: string;
  approvedDate?: string;
  evidence: Evidence[];
  votes: Vote[];
  votingSummary?: {
    totalVotingPower: number;
    approveVotes: number;
    rejectVotes: number;
    percentageApproved: number;
    thresholdRequired: number; // 75%
    hasReachedThreshold: boolean;
  };
}

export interface Evidence {
  id: string;
  milestoneId: string;
  type: 'image' | 'document' | 'link' | 'app';
  title: string;
  description: string;
  url: string;
  ipfsHash?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Vote {
  id: string;
  milestoneId: string;
  projectId: string;
  memberId: string;
  memberName: string;
  voteType: VoteType;
  votingPower: number;
  comment?: string;
  createdAt: string;
  transactionHash?: string;
}

// ============================================
// PROJECT REQUESTS
// ============================================

export interface OnboardProjectRequest {
  organizationId: string;
  campaignId?: string;
  researcherId?: string;
  researcherEmail: string;
  researcherName: string;
  institution: string;
  projectTitle: string;
  projectDescription: string;
  category: string;
  totalFunding: number;
  teamMemberIds: string[];
  milestoneMode: 'fixed' | 'custom';
  stagesCount: number;
  milestones: Array<{
    title: string;
    description: string;
    fundingAmount: number;
    fundingPercentage: number;
    durationWeeks: number;
  }>;
  // Optional: If frontend signed the lock transaction, pass the hash here
  transactionHash?: string;
}

export interface OnboardProjectResponse {
  projectId: string;
  status: 'success' | 'pending';
  message: string;
  emailSent: boolean;
  researcherEmail: string;
  smartContractAddress?: string;
  transactionHash?: string;
}

export interface SubmitEvidenceRequest {
  milestoneId: string;
  projectId: string;
  evidence: Array<{
    type: 'image' | 'document' | 'link' | 'app';
    title: string;
    description: string;
    url: string;
  }>;
}

export interface SubmitEvidenceResponse {
  success: boolean;
  milestoneId: string;
  evidenceCount: number;
  message: string;
  milestoneStatus: MilestoneStatus;
}

export interface SubmitVoteRequest {
  milestoneId: string;
  projectId: string;
  memberId: string;
  voteType: VoteType;
  votingPower: number;
  comment?: string;
  signature?: string; // Hex encoded signature
  walletAddress?: string; // Address used to sign
}

export interface SubmitVoteResponse {
  success: boolean;
  voteId: string;
  weightedVote: number;
  message: string;
  votingSummary: {
    totalVotingPower: number;
    approveVotes: number;
    rejectVotes: number;
    percentageApproved: number;
    hasReachedThreshold: boolean;
  };
  milestoneStatus?: MilestoneStatus;
  transactionHash?: string;
  releaseData?: {
    scriptCbor: string;
    scriptAddr: string;
    scriptUtxo: any;
    voterHashes: string[];
    datumParams: {
      organizationHash: string;
      researcherHash: string;
      memberHashes: string[];
      totalFunds: number;
      milestones: number[];
      currentMilestone: number;
    };
    redeemerParams: {
      milestoneIndex: number;
      voterHashes: string[];
    };
    paymentAmount: number;
    researcherAddress: string;
  };
}

export interface ClaimMilestoneRequest {
  milestoneId: string;
  projectId: string;
  researcherId: string;
  walletAddress: string;
}

export interface ClaimMilestoneResponse {
  success: boolean;
  milestoneId: string;
  fundingAmount: number;
  transactionHash: string;
  message: string;
  newWalletBalance?: number;
}

// ============================================
// DASHBOARD STATS
// ============================================

export interface OrganizationDashboardStats {
  overview: {
    totalProjects: number;
    activeProjects: number;
    totalFundingCommitted: number;
    totalFundingReleased: number;
    pendingApprovals: number;
  };
  projectsOverTime: Array<{
    month: string;
    count: number;
  }>;
  fundingDistribution: Array<{
    category: string;
    amount: number;
  }>;
  milestoneProgress: Array<{
    status: string;
    count: number;
  }>;
  recentProjects: Array<{
    id: string;
    title: string;
    status: ProjectStatus;
    updatedAt: string;
  }>;
}

export interface ResearcherDashboardStats {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedMilestones: number;
    totalFundingReceived: number;
    pendingMilestones: number;
    walletBalance: number;
  };
  milestoneTimeline: Array<{
    month: string;
    completed: number;
    pending: number;
  }>;
  fundingReceived: Array<{
    month: string;
    amount: number;
  }>;
  projectProgress: Array<{
    projectId: string;
    projectName: string;
    progress: number; // 0-100
    nextMilestone?: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'milestone_approved' | 'funding_released' | 'evidence_submitted' | 'vote_received';
    message: string;
    timestamp: string;
    projectId?: string;
  }>;
}

// ============================================
// WALLET & FUNDING
// ============================================

export interface WalletBalance {
  address: string;
  balance: number; // ADA
  pendingFunds: number; // ADA
  lastUpdated: string;
}

export interface FundingTransaction {
  id: string;
  type: 'funding' | 'withdrawal' | 'milestone_release';
  amount: number; // ADA
  from: string;
  to: string;
  projectId?: string;
  milestoneId?: string;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export interface WithdrawFundsRequest {
  researcherId: string;
  amount: number;
  walletAddress: string;
}

export interface WithdrawFundsResponse {
  success: boolean;
  transactionHash: string;
  amount: number;
  newBalance: number;
  message: string;
}

// ============================================
// CAMPAIGNS (Coming Soon)
// ============================================

export interface Campaign {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  category: string;
  totalBudget: number;
  allocatedFunding: number;
  availableFunding: number;
  stagesCount: number;
  status: 'draft' | 'active' | 'closed';
  startDate: string;
  endDate: string;
  createdAt: string;
  projectCount: number;
}

export interface CreateCampaignRequest {
  organizationId: string;
  title: string;
  description: string;
  totalBudget: number;
  category: string;
  stagesCount: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateCampaignResponse {
  campaignId: string;
  status: 'success';
  message: string;
}

// ============================================
// PAGINATION & FILTERING
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterParams {
  status?: string | string[];
  category?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
