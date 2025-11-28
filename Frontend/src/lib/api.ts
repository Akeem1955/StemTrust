// Mock API configuration
// Replace these URLs with your real backend endpoints when ready
const API_BASE_URL = 'https://api.stemtrust.example.com';
const MOCK_DELAY = 800; // Simulate network delay

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API response helper
async function mockApiCall<T>(data: T, shouldSucceed = true): Promise<T> {
  await delay(MOCK_DELAY);
  if (!shouldSucceed) {
    throw new Error('API call failed');
  }
  return data;
}

// ============================================
// MEMBER MANAGEMENT API
// ============================================

export interface OrganizationMember {
  id: string;
  email: string;
  name?: string;
  votingPower: number; // 1 = normal, higher = more weight
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  lastActive?: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface AddMemberRequest {
  organizationId: string;
  email: string;
  votingPower?: number;
  role?: 'admin' | 'member' | 'viewer';
}

export interface UpdateMemberRequest {
  memberId: string;
  votingPower?: number;
  role?: 'admin' | 'member' | 'viewer';
  status?: 'active' | 'pending' | 'inactive';
}

// Mock data for testing
let mockMembers: OrganizationMember[] = [
  {
    id: 'member-1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    votingPower: 1,
    status: 'active',
    joinedDate: '2024-01-15',
    lastActive: '2024-11-28',
    role: 'member',
  },
  {
    id: 'member-2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    votingPower: 2,
    status: 'active',
    joinedDate: '2024-02-01',
    lastActive: '2024-11-27',
    role: 'admin',
  },
  {
    id: 'member-3',
    email: 'bob.wilson@example.com',
    name: 'Bob Wilson',
    votingPower: 1,
    status: 'pending',
    joinedDate: '2024-11-20',
    role: 'viewer',
  },
];

/**
 * Get all members for an organization
 */
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  console.log(`[Mock API] GET ${API_BASE_URL}/organizations/${organizationId}/members`);
  
  // In production, replace with:
  // const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/members`);
  // return response.json();
  
  return mockApiCall(mockMembers);
}

/**
 * Add a new member to an organization
 */
export async function addOrganizationMember(request: AddMemberRequest): Promise<OrganizationMember> {
  console.log(`[Mock API] POST ${API_BASE_URL}/organizations/${request.organizationId}/members`, request);
  
  // In production, replace with:
  // const response = await fetch(`${API_BASE_URL}/organizations/${request.organizationId}/members`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();
  
  const newMember: OrganizationMember = {
    id: `member-${Date.now()}`,
    email: request.email,
    votingPower: request.votingPower || 1,
    status: 'pending',
    joinedDate: new Date().toISOString().split('T')[0],
    role: request.role || 'viewer',
  };
  
  mockMembers.push(newMember);
  return mockApiCall(newMember);
}

/**
 * Update a member's settings
 */
export async function updateOrganizationMember(request: UpdateMemberRequest): Promise<OrganizationMember> {
  console.log(`[Mock API] PATCH ${API_BASE_URL}/members/${request.memberId}`, request);
  
  // In production, replace with:
  // const response = await fetch(`${API_BASE_URL}/members/${request.memberId}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();
  
  const memberIndex = mockMembers.findIndex(m => m.id === request.memberId);
  if (memberIndex === -1) {
    throw new Error('Member not found');
  }
  
  mockMembers[memberIndex] = {
    ...mockMembers[memberIndex],
    ...(request.votingPower !== undefined && { votingPower: request.votingPower }),
    ...(request.role !== undefined && { role: request.role }),
    ...(request.status !== undefined && { status: request.status }),
  };
  
  return mockApiCall(mockMembers[memberIndex]);
}

/**
 * Remove a member from an organization
 */
export async function removeOrganizationMember(memberId: string): Promise<void> {
  console.log(`[Mock API] DELETE ${API_BASE_URL}/members/${memberId}`);
  
  // In production, replace with:
  // await fetch(`${API_BASE_URL}/members/${memberId}`, {
  //   method: 'DELETE',
  // });
  
  mockMembers = mockMembers.filter(m => m.id !== memberId);
  return mockApiCall(undefined);
}

// ============================================
// PROJECT ONBOARDING API
// ============================================

export interface OnboardProjectRequest {
  organizationId: string;
  campaignId?: string;
  researcherEmail: string;
  projectTitle: string;
  projectDescription: string;
  totalFunding: number;
  milestones: Array<{
    title: string;
    description: string;
    fundingAmount: number;
    durationWeeks: number;
  }>;
}

export interface OnboardProjectResponse {
  projectId: string;
  status: 'success' | 'pending';
  message: string;
  emailSent: boolean;
  researcherEmail: string;
}

/**
 * Onboard a new project and send login instructions to researcher
 */
export async function onboardProject(request: OnboardProjectRequest): Promise<OnboardProjectResponse> {
  console.log(`[Mock API] POST ${API_BASE_URL}/projects/onboard`, request);
  console.log(`[Mock API] Sending login instructions to ${request.researcherEmail}`);
  
  // In production, replace with:
  // const response = await fetch(`${API_BASE_URL}/projects/onboard`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();
  
  const response: OnboardProjectResponse = {
    projectId: `proj-${Date.now()}`,
    status: 'success',
    message: `Project "${request.projectTitle}" has been onboarded successfully. Login instructions sent to ${request.researcherEmail}`,
    emailSent: true,
    researcherEmail: request.researcherEmail,
  };
  
  return mockApiCall(response);
}

// ============================================
// CAMPAIGN API
// ============================================

export interface CreateCampaignRequest {
  organizationId: string;
  title: string;
  description: string;
  totalBudget: number;
  stagesCount: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateCampaignResponse {
  campaignId: string;
  status: 'success' | 'pending';
  message: string;
}

/**
 * Create a new campaign
 */
export async function createCampaign(request: CreateCampaignRequest): Promise<CreateCampaignResponse> {
  console.log(`[Mock API] POST ${API_BASE_URL}/campaigns`, request);
  
  // In production, replace with:
  // const response = await fetch(`${API_BASE_URL}/campaigns`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();
  
  const response: CreateCampaignResponse = {
    campaignId: `campaign-${Date.now()}`,
    status: 'success',
    message: `Campaign "${request.title}" created successfully`,
  };
  
  return mockApiCall(response);
}

// ============================================
// VOTING API
// ============================================

export interface SubmitVoteRequest {
  memberId: string;
  projectId: string;
  milestoneId: string;
  vote: 'approve' | 'reject';
  votingPower: number;
}

export interface SubmitVoteResponse {
  success: boolean;
  voteId: string;
  weightedVote: number;
  message: string;
}

/**
 * Submit a vote for a milestone (considers voting power)
 */
export async function submitVote(request: SubmitVoteRequest): Promise<SubmitVoteResponse> {
  console.log(`[Mock API] POST ${API_BASE_URL}/votes`, request);
  console.log(`[Mock API] Vote weight: ${request.votingPower}`);
  
  // In production, replace with:
  // const response = await fetch(`${API_BASE_URL}/votes`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();
  
  const response: SubmitVoteResponse = {
    success: true,
    voteId: `vote-${Date.now()}`,
    weightedVote: request.votingPower,
    message: `Your vote (weight: ${request.votingPower}) has been recorded successfully`,
  };
  
  return mockApiCall(response);
}
