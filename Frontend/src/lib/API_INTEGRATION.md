# API Integration Guide

This document explains how the mock API is structured and how to replace it with your real backend.

## Overview

The platform uses a centralized API utility (`/lib/api.ts`) that currently simulates backend calls with mock data. When your backend is ready, you can easily swap the mock implementations with real HTTP requests.

## Mock API Configuration

```typescript
const API_BASE_URL = 'https://api.stemtrust.example.com';
```

**Action Required:** Replace this with your actual backend URL.

## API Endpoints

### 1. Member Management

#### Get Organization Members
```typescript
GET /organizations/{organizationId}/members
```

#### Add Member
```typescript
POST /organizations/{organizationId}/members
Body: { email, votingPower, role }
```

#### Update Member
```typescript
PATCH /members/{memberId}
Body: { votingPower?, role?, status? }
```

#### Remove Member
```typescript
DELETE /members/{memberId}
```

### 2. Project Onboarding

#### Onboard Project
```typescript
POST /projects/onboard
Body: {
  organizationId,
  campaignId?,
  researcherEmail,
  projectTitle,
  projectDescription,
  totalFunding,
  milestones: [{
    title,
    description,
    fundingAmount,
    durationWeeks
  }]
}
```

**Important:** This endpoint should trigger an email to the researcher with login instructions.

### 3. Campaign Management

#### Create Campaign
```typescript
POST /campaigns
Body: {
  organizationId,
  title,
  description,
  totalBudget,
  stagesCount,
  category?,
  startDate?,
  endDate?
}
```

### 4. Voting System

#### Submit Vote
```typescript
POST /votes
Body: {
  memberId,
  projectId,
  milestoneId,
  vote: 'approve' | 'reject',
  votingPower
}
```

**Note:** The `votingPower` field is critical for weighted voting.

## How to Integrate with Real Backend

### Step 1: Update API Base URL

In `/lib/api.ts`, replace:
```typescript
const API_BASE_URL = 'https://api.stemtrust.example.com';
```

With your actual backend URL:
```typescript
const API_BASE_URL = 'https://api.stemtrust.io'; // Your real URL
```

### Step 2: Replace Mock Functions

Each API function has a commented section showing the real implementation. For example:

**Current (Mock):**
```typescript
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  console.log(`[Mock API] GET ${API_BASE_URL}/organizations/${organizationId}/members`);
  
  // In production, replace with:
  // const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/members`);
  // return response.json();
  
  return mockApiCall(mockMembers);
}
```

**Production (Real):**
```typescript
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/members`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`, // Add authentication
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch members');
  }
  
  return response.json();
}
```

### Step 3: Add Authentication

You'll need to add authentication headers to your API calls. Create an auth utility:

```typescript
// /lib/auth.ts
export function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}

export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}
```

### Step 4: Error Handling

Add proper error handling for production:

```typescript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API call failed');
  }
  
  return response.json();
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

## Key Features Implemented

### Member Management
- ✅ Add members via email (max 50)
- ✅ Assign voting power (1-10x weight)
- ✅ Assign roles (Admin, Member, Viewer)
- ✅ Update member settings
- ✅ Remove members
- ✅ Track member status (active, pending, inactive)

### Project Onboarding
- ✅ Onboard projects with researcher email
- ✅ Automatic email notification to researcher
- ✅ Fixed 5-stage lifecycle for individual researchers
- ✅ Milestone structure with funding distribution:
  - Stage 1: 15% (Research Planning & Setup)
  - Stage 2: 20% (Data Collection)
  - Stage 3: 30% (Core Research)
  - Stage 4: 20% (Testing & Validation)
  - Stage 5: 15% (Documentation)

### Weighted Voting
- ✅ Members can have voting power from 1x to 10x
- ✅ Votes are weighted by member's voting power
- ✅ 75% approval threshold (weighted) required

## Backend Requirements

Your backend must:

1. **Email Service**: Send login instructions when projects are onboarded
2. **Authentication**: JWT or similar token-based auth
3. **Database**: Store organizations, members, projects, votes
4. **Cardano Integration**: Handle wallet connections and ADA transactions
5. **Voting Logic**: Calculate weighted votes and trigger smart contracts at 75% approval

## Testing the Mock API

The mock API logs all calls to the console:
```
[Mock API] POST https://api.stemtrust.example.com/organizations/org-123/members
[Mock API] Sending login instructions to researcher@university.edu.ng
```

This helps you verify that:
- All data is being sent correctly
- API calls happen at the right times
- Error handling works properly

## Console Logging

All API calls are logged for debugging:
- Request method and URL
- Request body
- Simulated responses

Check your browser console to see these logs.

## Next Steps

1. Set up your backend with the required endpoints
2. Replace `API_BASE_URL` with your real URL
3. Uncomment and adapt the production code in each function
4. Add authentication headers
5. Test each endpoint thoroughly
6. Remove mock data and console logs

## Questions?

If you need help with the backend integration, refer to this file for the expected request/response formats.
