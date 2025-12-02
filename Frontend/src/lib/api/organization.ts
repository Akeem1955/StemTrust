/**
 * Organization API Service
 * 
 * All organization-related API endpoints.
 * These map to real backend endpoints - just change the base URL for production.
 */

import { apiGet, apiPost, apiPatch, apiDelete } from '../apiClient';
import type {
  Organization,
  OrganizationMember,
  AddMemberRequest,
  UpdateMemberRequest,
  OrganizationDashboardStats,
  PaginatedResponse,
  FilterParams,
  PaginationParams,
} from './types';

// ============================================
// ORGANIZATION PROFILE
// ============================================

/**
 * GET /organizations/:id
 * Get organization profile
 */
export async function getOrganization(organizationId: string): Promise<Organization> {
  return apiGet<Organization>(`/organizations/${organizationId}`);
}

/**
 * PATCH /organizations/:id
 * Update organization profile
 */
export async function updateOrganization(
  organizationId: string,
  data: Partial<Organization>
): Promise<Organization> {
  return apiPatch<Organization>(`/organizations/${organizationId}`, data);
}

// ============================================
// ORGANIZATION MEMBERS
// ============================================

/**
 * GET /organizations/:id/members
 * Get all members of an organization
 */
export async function getOrganizationMembers(
  organizationId: string,
  params?: FilterParams & PaginationParams
): Promise<OrganizationMember[]> {
  return apiGet<OrganizationMember[]>(`/organizations/${organizationId}/members`, params);
}

/**
 * POST /organizations/:id/members
 * Add a new member to organization
 */
export async function addOrganizationMember(
  request: AddMemberRequest
): Promise<OrganizationMember> {
  return apiPost<OrganizationMember>(
    `/organizations/${request.organizationId}/members`,
    request
  );
}

/**
 * PATCH /members/:id
 * Update member settings (voting power, role, status)
 */
export async function updateOrganizationMember(
  request: UpdateMemberRequest
): Promise<OrganizationMember> {
  return apiPatch<OrganizationMember>(`/members/${request.memberId}`, request);
}

/**
 * DELETE /members/:id
 * Remove a member from organization
 */
export async function removeOrganizationMember(memberId: string): Promise<void> {
  return apiDelete<void>(`/members/${memberId}`);
}

/**
 * GET /members/:id
 * Get single member details
 */
export async function getOrganizationMember(memberId: string): Promise<OrganizationMember> {
  return apiGet<OrganizationMember>(`/members/${memberId}`);
}

// ============================================
// ORGANIZATION DASHBOARD
// ============================================

/**
 * GET /organizations/:id/dashboard/stats
 * Get dashboard statistics for organization
 */
export async function getOrganizationDashboardStats(
  organizationId: string
): Promise<OrganizationDashboardStats> {
  return apiGet<OrganizationDashboardStats>(
    `/organizations/${organizationId}/dashboard/stats`
  );
}

/**
 * GET /organizations/:id/projects
 * Get all projects for organization
 */
export async function getOrganizationProjects(
  organizationId: string,
  params?: FilterParams & PaginationParams
): Promise<PaginatedResponse<any>> {
  return apiGet<PaginatedResponse<any>>(
    `/organizations/${organizationId}/projects`,
    params
  );
}

/**
 * GET /organizations/:id/pending-approvals
 * Get milestones pending approval
 */
export async function getPendingApprovals(
  organizationId: string
): Promise<any[]> {
  return apiGet<any[]>(`/organizations/${organizationId}/pending-approvals`);
}

// ============================================
// ORGANIZATION ANALYTICS
// ============================================

/**
 * GET /organizations/:id/analytics/funding
 * Get funding analytics over time
 */
export async function getOrganizationFundingAnalytics(
  organizationId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<any> {
  return apiGet<any>(`/organizations/${organizationId}/analytics/funding`, params);
}

/**
 * GET /organizations/:id/analytics/projects
 * Get project analytics
 */
export async function getOrganizationProjectAnalytics(
  organizationId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<any> {
  return apiGet<any>(`/organizations/${organizationId}/analytics/projects`, params);
}

/**
 * GET /organizations/:id/analytics/milestones
 * Get milestone analytics
 */
export async function getOrganizationMilestoneAnalytics(
  organizationId: string
): Promise<any> {
  return apiGet<any>(`/organizations/${organizationId}/analytics/milestones`);
}
