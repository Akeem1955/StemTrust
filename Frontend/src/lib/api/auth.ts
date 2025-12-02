/**
 * Authentication API Service
 * 
 * All authentication and user management endpoints.
 */

import { apiGet, apiPost } from '../apiClient';
import type {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  AuthUser,
  WalletConnectRequest,
  WalletConnectResponse,
} from './types';

// ============================================
// AUTHENTICATION
// ============================================

/**
 * POST /auth/signup
 * Register a new user (organization or researcher)
 */
export async function signUp(request: SignUpRequest): Promise<SignUpResponse> {
  return apiPost<SignUpResponse>('/auth/signup', request);
}

/**
 * POST /auth/signin
 * Sign in with email and password
 */
export async function signIn(request: SignInRequest): Promise<SignInResponse> {
  return apiPost<SignInResponse>('/auth/signin', request);
}

/**
 * POST /auth/signout
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  return apiPost<void>('/auth/signout');
}

/**
 * GET /auth/me
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser> {
  return apiGet<AuthUser>('/auth/me');
}

/**
 * POST /auth/refresh-token
 * Refresh authentication token
 */
export async function refreshToken(): Promise<{
  token: string;
  expiresIn: number;
}> {
  return apiPost<any>('/auth/refresh-token');
}

// ============================================
// WALLET CONNECTION
// ============================================

/**
 * POST /auth/wallet/connect
 * Connect Cardano wallet to user account
 */
export async function connectWallet(
  request: WalletConnectRequest
): Promise<WalletConnectResponse> {
  return apiPost<WalletConnectResponse>('/auth/wallet/connect', request);
}

/**
 * POST /auth/wallet/disconnect
 * Disconnect wallet from user account
 */
export async function disconnectWallet(userId: string): Promise<void> {
  return apiPost<void>('/auth/wallet/disconnect', { userId });
}

/**
 * GET /auth/wallet/verify
 * Verify wallet ownership with signature
 */
export async function verifyWalletSignature(params: {
  walletAddress: string;
  signature: string;
  message: string;
}): Promise<{
  valid: boolean;
  walletAddress: string;
}> {
  return apiPost<any>('/auth/wallet/verify', params);
}

// ============================================
// PASSWORD MANAGEMENT
// ============================================

/**
 * POST /auth/password/reset-request
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  return apiPost<any>('/auth/password/reset-request', { email });
}

/**
 * POST /auth/password/reset
 * Reset password with token
 */
export async function resetPassword(params: {
  token: string;
  newPassword: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  return apiPost<any>('/auth/password/reset', params);
}

/**
 * POST /auth/password/change
 * Change password (authenticated user)
 */
export async function changePassword(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  return apiPost<any>('/auth/password/change', params);
}

// ============================================
// EMAIL VERIFICATION
// ============================================

/**
 * POST /auth/email/verify
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{
  success: boolean;
  message: string;
}> {
  return apiPost<any>('/auth/email/verify', { token });
}

/**
 * POST /auth/email/resend-verification
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  return apiPost<any>('/auth/email/resend-verification', { email });
}
