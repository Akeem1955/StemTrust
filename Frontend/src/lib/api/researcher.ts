/**
 * Researcher API Service
 * 
 * All researcher-related API endpoints.
 */

import { apiGet, apiPost, apiPatch } from '../apiClient';
import type {
  Researcher,
  ResearcherDashboardStats,
  Project,
  WalletBalance,
  FundingTransaction,
  WithdrawFundsRequest,
  WithdrawFundsResponse,
  ClaimMilestoneRequest,
  ClaimMilestoneResponse,
  PaginatedResponse,
  FilterParams,
  PaginationParams,
} from './types';

// ============================================
// RESEARCHER PROFILE
// ============================================

/**
 * GET /researchers/:id
 * Get researcher profile
 */
export async function getResearcher(researcherId: string): Promise<Researcher> {
  return apiGet<Researcher>(`/researchers/${researcherId}`);
}

/**
 * PATCH /researchers/:id
 * Update researcher profile
 */
export async function updateResearcher(
  researcherId: string,
  data: Partial<Researcher>
): Promise<Researcher> {
  return apiPatch<Researcher>(`/researchers/${researcherId}`, data);
}

// ============================================
// RESEARCHER DASHBOARD
// ============================================

/**
 * GET /researchers/:id/dashboard/stats
 * Get dashboard statistics for researcher
 */
export async function getResearcherDashboardStats(
  researcherId: string
): Promise<ResearcherDashboardStats> {
  return apiGet<ResearcherDashboardStats>(
    `/researchers/${researcherId}/dashboard/stats`
  );
}

/**
 * GET /researchers/:id/projects
 * Get all projects for researcher
 */
export async function getResearcherProjects(
  researcherId: string,
  params?: FilterParams & PaginationParams
): Promise<PaginatedResponse<Project>> {
  return apiGet<PaginatedResponse<Project>>(
    `/researchers/${researcherId}/projects`,
    params
  );
}

/**
 * GET /researchers/:id/pending-milestones
 * Get milestones pending submission
 */
export async function getPendingMilestones(
  researcherId: string
): Promise<any[]> {
  return apiGet<any[]>(`/researchers/${researcherId}/pending-milestones`);
}

/**
 * GET /researchers/:id/recent-activity
 * Get recent activity feed
 */
export async function getResearcherActivity(
  researcherId: string,
  params?: { limit?: number }
): Promise<any[]> {
  return apiGet<any[]>(`/researchers/${researcherId}/recent-activity`, params);
}

// ============================================
// WALLET & FUNDING
// ============================================

/**
 * GET /researchers/:id/wallet/balance
 * Get wallet balance for researcher
 */
export async function getResearcherWalletBalance(
  researcherId: string
): Promise<WalletBalance> {
  return apiGet<WalletBalance>(`/researchers/${researcherId}/wallet/balance`);
}

/**
 * GET /researchers/:id/wallet/transactions
 * Get funding transaction history
 */
export async function getResearcherTransactions(
  researcherId: string,
  params?: FilterParams & PaginationParams
): Promise<PaginatedResponse<FundingTransaction>> {
  return apiGet<PaginatedResponse<FundingTransaction>>(
    `/researchers/${researcherId}/wallet/transactions`,
    params
  );
}

/**
 * POST /researchers/:id/wallet/withdraw
 * Withdraw funds from platform wallet to personal wallet
 */
export async function withdrawFunds(
  request: WithdrawFundsRequest
): Promise<WithdrawFundsResponse> {
  return apiPost<WithdrawFundsResponse>(
    `/researchers/${request.researcherId}/wallet/withdraw`,
    request
  );
}

/**
 * POST /researchers/:id/milestones/:milestoneId/claim
 * Claim approved milestone funding
 */
export async function claimMilestoneFunding(
  request: ClaimMilestoneRequest
): Promise<ClaimMilestoneResponse> {
  return apiPost<ClaimMilestoneResponse>(
    `/researchers/${request.researcherId}/milestones/${request.milestoneId}/claim`,
    request
  );
}

/**
 * GET /researchers/:id/funding/summary
 * Get funding summary (total received, pending, etc.)
 */
export async function getResearcherFundingSummary(
  researcherId: string
): Promise<{
  totalReceived: number;
  pendingRelease: number;
  availableToWithdraw: number;
  totalWithdrawn: number;
}> {
  return apiGet<any>(`/researchers/${researcherId}/funding/summary`);
}

// ============================================
// RESEARCHER ANALYTICS
// ============================================

/**
 * GET /researchers/:id/analytics/progress
 * Get project progress analytics
 */
export async function getResearcherProgressAnalytics(
  researcherId: string
): Promise<any> {
  return apiGet<any>(`/researchers/${researcherId}/analytics/progress`);
}

/**
 * GET /researchers/:id/analytics/funding
 * Get funding analytics over time
 */
export async function getResearcherFundingAnalytics(
  researcherId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<any> {
  return apiGet<any>(`/researchers/${researcherId}/analytics/funding`, params);
}

/**
 * GET /researchers/:id/analytics/milestones
 * Get milestone completion analytics
 */
export async function getResearcherMilestoneAnalytics(
  researcherId: string
): Promise<any> {
  return apiGet<any>(`/researchers/${researcherId}/analytics/milestones`);
}
