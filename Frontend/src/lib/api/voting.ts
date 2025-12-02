/**
 * Voting API Service
 * 
 * All voting-related API endpoints for milestone approvals.
 */

import { apiGet, apiPost } from '../apiClient';
import type {
  Vote,
  SubmitVoteRequest,
  SubmitVoteResponse,
  Milestone,
} from './types';

// ============================================
// VOTING
// ============================================

/**
 * POST /votes
 * Submit a vote for milestone approval
 */
export async function submitVote(request: SubmitVoteRequest): Promise<SubmitVoteResponse> {
  return apiPost<SubmitVoteResponse>('/votes', request);
}

/**
 * GET /milestones/:id/votes
 * Get all votes for a milestone
 */
export async function getMilestoneVotes(milestoneId: string): Promise<Vote[]> {
  return apiGet<Vote[]>(`/milestones/${milestoneId}/votes`);
}

/**
 * GET /milestones/:id/voting-summary
 * Get voting summary for milestone
 */
export async function getMilestoneVotingSummary(milestoneId: string): Promise<{
  totalVotingPower: number;
  approveVotes: number;
  rejectVotes: number;
  percentageApproved: number;
  thresholdRequired: number;
  hasReachedThreshold: boolean;
  votesRequired: number;
  votesRemaining: number;
}> {
  return apiGet<any>(`/milestones/${milestoneId}/voting-summary`);
}

/**
 * GET /projects/:id/voting-status
 * Get voting status for all milestones in project
 */
export async function getProjectVotingStatus(projectId: string): Promise<any[]> {
  return apiGet<any[]>(`/projects/${projectId}/voting-status`);
}

/**
 * GET /members/:id/votes
 * Get all votes submitted by a member
 */
export async function getMemberVotes(
  memberId: string,
  params?: { projectId?: string; status?: string }
): Promise<Vote[]> {
  return apiGet<Vote[]>(`/members/${memberId}/votes`, params);
}

/**
 * GET /members/:id/pending-votes
 * Get milestones pending vote from member
 */
export async function getMemberPendingVotes(memberId: string): Promise<Milestone[]> {
  return apiGet<Milestone[]>(`/members/${memberId}/pending-votes`);
}

// ============================================
// VOTE VALIDATION
// ============================================

/**
 * GET /milestones/:id/can-vote
 * Check if member can vote on milestone
 */
export async function canMemberVote(
  milestoneId: string,
  memberId: string
): Promise<{
  canVote: boolean;
  reason?: string;
  hasAlreadyVoted: boolean;
}> {
  return apiGet<any>(`/milestones/${milestoneId}/can-vote`, { memberId });
}

/**
 * POST /milestones/:id/finalize-voting
 * Finalize voting and trigger milestone approval/rejection
 */
export async function finalizeMilestoneVoting(
  milestoneId: string
): Promise<{
  success: boolean;
  milestoneStatus: 'approved' | 'rejected';
  message: string;
  transactionHash?: string;
}> {
  return apiPost<any>(`/milestones/${milestoneId}/finalize-voting`);
}
