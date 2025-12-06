// API Client for ScienceTrust Nigeria

// ============================================
// API CONFIGURATION
// ============================================

const API_BASE_URL = "http://localhost:3001/api";

// ============================================
// TYPES (Mirrored from Backend)
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

export interface SignInResponse {
  user: AuthUser;
  token: string;
  expiresIn: number;
}

export interface SignUpResponse {
  user: AuthUser;
  token: string;
  message: string;
}

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
  totalFunding: number;
  fundingReleased: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
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
  walletAddress?: string;
  walletProvider?: WalletProvider;
}

export interface Milestone {
  id: string;
  projectId: string;
  stageNumber: number;
  title: string;
  description: string;
  fundingAmount: number;
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
}

export interface OrganizationDashboardStats {
  overview: {
    totalProjects: number;
    activeProjects: number;
    totalFundingCommitted: number;
    totalFundingReleased: number;
    pendingApprovals: number;
  };
  recentProjects: Project[];
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
  projectProgress: Array<{
    projectId: string;
    projectName: string;
    progress: number;
  }>;
}

export interface OnboardProjectRequest {
  organizationId: string;
  campaignId?: string;
  researcherId?: string;
  researcherEmail: string;
  projectTitle: string;
  projectDescription: string;
  category?: string;
  totalFunding: number;
  milestones: any[];
  milestoneMode: 'fixed' | 'custom';
  stagesCount: number;
  teamMemberIds: string[];
  researcherName?: string;
  institution?: string;
  // Optional: If frontend signed the lock transaction
  transactionHash?: string;
}

export interface LockTxParams {
  scriptAddress: string;
  scriptCbor: string;
  datumStructure: {
    fields: string[];
  };
}

export interface OnboardProjectResponse {
  projectId: string;
  status: string;
  message: string;
  emailSent: boolean;
  researcherEmail: string;
  smartContractAddress?: string;
  transactionHash?: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  votingPower: number;
  joinedAt: string;
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
  signature?: string;
  walletAddress?: string;
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
  milestoneStatus: MilestoneStatus;
  transactionHash?: string;
  releaseData?: any;
}

// ============================================
// API CLIENT
// ============================================

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Session persistence removed
    // this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    // localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token'); // Just to be safe/cleanup
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      // @ts-ignore
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'API request failed');
    }

    return data.data || data; // Handle { success: true, data: ... } or direct response
  }

  // AUTH
  async signIn(credentials: any) {
    return this.request<SignInResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signUp(data: any) {
    return this.request<SignUpResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<AuthUser>('/auth/me');
  }

  // PROJECTS
  async getProject(id: string) {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(data: OnboardProjectRequest) {
    return this.request<OnboardProjectResponse>('/projects/onboard', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLockTxParams() {
    return this.request<LockTxParams>('/projects/lock-tx-params');
  }

  async onboardProject(data: OnboardProjectRequest) {
    return this.request<OnboardProjectResponse>('/projects/onboard', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get parameters for building unlock transaction
  async getUnlockTxParams(projectId: string, milestoneId: string) {
    return this.request<{
      scriptAddress: string;
      scriptCbor: string;
      projectTxHash: string;
      milestoneIndex: number;
      releaseAmount: number;
      researcherWallet: string;
      datumParams: {
        organization: string;
        researcher: string;
        members: string[];
        totalFunds: number;
        milestones: number[];
        currentMilestone: number;
      };
      isLastMilestone: boolean;
      scriptUtxos?: any[];
    }>(`/projects/${projectId}/milestones/${milestoneId}/unlock-tx-params`);
  }

  // Build unsigned unlock transaction on backend (avoids CORS issues)
  async buildUnlockTx(projectId: string, milestoneId: string, walletAddress: string, walletUtxos: any[]) {
    return this.request<{
      unsignedTx: string;
      txHash: string;
    }>(`/projects/${projectId}/milestones/${milestoneId}/build-unlock-tx`, {
      method: 'POST',
      body: JSON.stringify({ walletAddress, walletUtxos })
    });
  }

  // Release funds using backend wallet (no frontend wallet needed!)
  async releaseFundsBackend(projectId: string, milestoneId: string) {
    return this.request<{
      milestoneId: string;
      status: string;
      transactionHash: string;
      amountReleased: number;
      recipientAddress: string;
      message: string;
    }>(`/projects/${projectId}/milestones/${milestoneId}/release-funds`, {
      method: 'POST'
    });
  }

  // Confirm fund release after blockchain transaction
  async confirmFundRelease(projectId: string, milestoneId: string, transactionHash: string) {
    return this.request<{
      milestoneId: string;
      status: string;
      transactionHash: string;
      amountReleased: number;
      message: string;
    }>(`/projects/${projectId}/milestones/${milestoneId}/confirm-release`, {
      method: 'POST',
      body: JSON.stringify({ transactionHash }),
    });
  }

  // Get deposit address for organizations to send funds
  async getDepositAddress() {
    return this.request<{
      depositAddress: string;
      network: string;
      currentBalance: number;
      instructions: string;
    }>('/projects/deposit-address');
  }

  // DASHBOARD
  async getOrgDashboard() {
    return this.request<Project[]>('/projects');
  }

  async getResearcherDashboard() {
    return this.request<Project[]>('/projects');
  }

  async getOrganizationProjects(organizationId: string) {
    return this.request<Project[]>(`/organizations/${organizationId}/projects`);
  }

  async getResearcherProjects(researcherId: string) {
    return this.request<Project[]>(`/researchers/${researcherId}/projects`);
  }

  async updateResearcher(id: string, data: any) {
    return this.request<any>(`/researchers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // CAMPAIGNS (Mocked for now as backend doesn't support it yet)
  async getCampaigns(organizationId?: string) {
    // Return empty array or mock data to prevent errors
    return [];
  }

  async getOrganizationMembers(organizationId: string) {
    return this.request<OrganizationMember[]>(`/organizations/${organizationId}/members`);
  }

  async addOrganizationMember(data: any) {
    return this.request<OrganizationMember>(`/organizations/${data.organizationId}/members`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateOrganizationMember(data: { memberId: string; votingPower?: number; role?: string }) {
    return this.request<OrganizationMember>(`/members/${data.memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async removeOrganizationMember(memberId: string) {
    return this.request<void>(`/members/${memberId}`, {
      method: 'DELETE'
    });
  }

  // MILESTONES & EVIDENCE
  async submitEvidence(milestoneId: string, evidence: any[], walletAddress?: string) {
    return this.request<SubmitEvidenceResponse>(`/milestones/${milestoneId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ evidence, walletAddress })
    });
  }

  async getMilestoneEvidence(milestoneId: string) {
    return this.request<Evidence[]>(`/milestones/${milestoneId}/evidence`);
  }

  // VOTING
  async submitVote(data: SubmitVoteRequest) {
    return this.request<SubmitVoteResponse>('/votes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMilestoneVotes(milestoneId: string) {
    return this.request<any[]>(`/milestones/${milestoneId}/votes`);
  }

  async getVotingSummary(milestoneId: string) {
    return this.request<any>(`/milestones/${milestoneId}/voting-summary`);
  }
}

export const api = new ApiClient();

// Helper functions for backward compatibility or direct usage
export const getOrganizationProjects = (id: string) => api.getOrganizationProjects(id);
export const getResearcherProjects = (id: string) => api.getResearcherProjects(id);
export const updateResearcher = (id: string, data: any) => api.updateResearcher(id, data);
export const getCampaigns = (orgId?: string) => api.getCampaigns(orgId);
export const login = (creds: any) => api.signIn(creds);
export const signup = (data: any) => api.signUp(data);
export const getProject = (id: string) => api.getProject(id);
export const onboardProject = (data: OnboardProjectRequest) => api.onboardProject(data);
export const getOrganizationMembers = (id: string) => api.getOrganizationMembers(id);
export const addOrganizationMember = (data: any) => api.addOrganizationMember(data);
export const updateOrganizationMember = (data: any) => api.updateOrganizationMember(data);
export const removeOrganizationMember = (id: string) => api.removeOrganizationMember(id);
export const submitEvidence = (id: string, evidence: any[], walletAddress?: string) => api.submitEvidence(id, evidence, walletAddress);
export const submitVote = (data: SubmitVoteRequest) => api.submitVote(data);
export const getMilestoneVotes = (id: string) => api.getMilestoneVotes(id);
export const getVotingSummary = (id: string) => api.getVotingSummary(id);
