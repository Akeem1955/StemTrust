/**
 * Projects API Service
 * 
 * All project-related API endpoints (create, read, update, milestones).
 */

import { apiGet, apiPost, apiPatch, apiUpload } from '../apiClient';
import type {
  Project,
  OnboardProjectRequest,
  OnboardProjectResponse,
  Milestone,
  SubmitEvidenceRequest,
  SubmitEvidenceResponse,
  Evidence,
  ProjectTeamMember,
} from './types';

// ============================================
// PROJECT CRUD
// ============================================

/**
 * GET /projects/:id
 * Get project details
 */
export async function getProject(projectId: string): Promise<Project> {
  return apiGet<Project>(`/projects/${projectId}`);
}

/**
 * POST /projects/onboard
 * Onboard a new research project
 */
export async function onboardProject(
  request: OnboardProjectRequest
): Promise<OnboardProjectResponse> {
  return apiPost<OnboardProjectResponse>('/projects/onboard', request);
}

/**
 * PATCH /projects/:id
 * Update project details
 */
export async function updateProject(
  projectId: string,
  data: Partial<Project>
): Promise<Project> {
  return apiPatch<Project>(`/projects/${projectId}`, data);
}

/**
 * PATCH /projects/:id/status
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: string
): Promise<Project> {
  return apiPatch<Project>(`/projects/${projectId}/status`, { status });
}

// ============================================
// PROJECT TEAM
// ============================================

/**
 * GET /projects/:id/team
 * Get project team members
 */
export async function getProjectTeam(projectId: string): Promise<ProjectTeamMember[]> {
  return apiGet<ProjectTeamMember[]>(`/projects/${projectId}/team`);
}

/**
 * POST /projects/:id/team
 * Add team member to project
 */
export async function addProjectTeamMember(
  projectId: string,
  memberId: string
): Promise<ProjectTeamMember> {
  return apiPost<ProjectTeamMember>(`/projects/${projectId}/team`, { memberId });
}

/**
 * DELETE /projects/:id/team/:memberId
 * Remove team member from project
 */
export async function removeProjectTeamMember(
  projectId: string,
  memberId: string
): Promise<void> {
  return apiPost<void>(`/projects/${projectId}/team/${memberId}/remove`);
}

// ============================================
// MILESTONES
// ============================================

/**
 * GET /projects/:id/milestones
 * Get all milestones for a project
 */
export async function getProjectMilestones(projectId: string): Promise<Milestone[]> {
  return apiGet<Milestone[]>(`/projects/${projectId}/milestones`);
}

/**
 * GET /milestones/:id
 * Get single milestone details
 */
export async function getMilestone(milestoneId: string): Promise<Milestone> {
  return apiGet<Milestone>(`/milestones/${milestoneId}`);
}

/**
 * PATCH /milestones/:id/start
 * Start a milestone (researcher begins work)
 */
export async function startMilestone(
  milestoneId: string,
  researcherId: string
): Promise<Milestone> {
  return apiPatch<Milestone>(`/milestones/${milestoneId}/start`, { researcherId });
}

/**
 * POST /milestones/:id/submit
 * Submit milestone with evidence
 */
export async function submitMilestone(
  request: SubmitEvidenceRequest
): Promise<SubmitEvidenceResponse> {
  return apiPost<SubmitEvidenceResponse>(
    `/milestones/${request.milestoneId}/submit`,
    request
  );
}

// ============================================
// EVIDENCE
// ============================================

/**
 * GET /milestones/:id/evidence
 * Get all evidence for a milestone
 */
export async function getMilestoneEvidence(milestoneId: string): Promise<Evidence[]> {
  return apiGet<Evidence[]>(`/milestones/${milestoneId}/evidence`);
}

/**
 * POST /milestones/:id/evidence
 * Add evidence to milestone
 */
export async function addEvidence(
  milestoneId: string,
  evidence: {
    type: 'image' | 'document' | 'link' | 'app';
    title: string;
    description: string;
    url: string;
  }
): Promise<Evidence> {
  return apiPost<Evidence>(`/milestones/${milestoneId}/evidence`, evidence);
}

/**
 * POST /milestones/:id/evidence/upload
 * Upload file evidence (images, documents)
 */
export async function uploadEvidence(
  milestoneId: string,
  formData: FormData
): Promise<Evidence[]> {
  return apiUpload<Evidence[]>(`/milestones/${milestoneId}/evidence/upload`, formData);
}

/**
 * DELETE /evidence/:id
 * Delete evidence item
 */
export async function deleteEvidence(evidenceId: string): Promise<void> {
  return apiPost<void>(`/evidence/${evidenceId}/delete`);
}

// ============================================
// PROJECT SMART CONTRACTS
// ============================================

/**
 * GET /projects/:id/contract
 * Get smart contract details for project
 */
export async function getProjectSmartContract(projectId: string): Promise<{
  address: string;
  status: string;
  transactionHash: string;
  createdAt: string;
}> {
  return apiGet<any>(`/projects/${projectId}/contract`);
}

/**
 * GET /projects/:id/transactions
 * Get all blockchain transactions for project
 */
export async function getProjectTransactions(projectId: string): Promise<any[]> {
  return apiGet<any[]>(`/projects/${projectId}/transactions`);
}

// ============================================
// PROJECT SEARCH
// ============================================

/**
 * GET /projects/search
 * Search projects by various criteria
 */
export async function searchProjects(params: {
  query?: string;
  category?: string;
  status?: string;
  organizationId?: string;
  researcherId?: string;
  limit?: number;
  offset?: number;
}): Promise<Project[]> {
  return apiGet<Project[]>('/projects/search', params);
}
