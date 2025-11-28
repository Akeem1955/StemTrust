# Backend Integration Implementation Summary

## What Was Implemented

### 1. Mock API System (`/lib/api.ts`)

A complete mock API system that simulates backend calls with realistic delays and data structures. This makes it easy to develop the frontend before the backend is ready.

**Key Features:**
- Mock delay simulation (800ms) to mimic network latency
- Console logging of all API calls for debugging
- Type-safe interfaces for all requests and responses
- Ready-to-replace structure (commented production code included)

### 2. Member Management System (`/components/MemberManagement.tsx`)

A comprehensive interface for organizations to manage their members.

**Features:**
- **Add Members**: Invite up to 50 members via email
- **Roles**: Admin, Member, Viewer
- **Voting Power**: Assign 1-10x voting weight to members
- **Status Tracking**: Active, Pending, Inactive
- **Live Updates**: Real-time member list with inline editing
- **Email Validation**: Prevents duplicate emails and validates format
- **Visual Feedback**: Loading states, success/error messages via toast
- **Member Stats**: Dashboard showing total, active, and pending members

**API Calls Made:**
- `GET /organizations/{id}/members` - Load members
- `POST /organizations/{id}/members` - Add new member
- `PATCH /members/{id}` - Update voting power or role
- `DELETE /members/{id}` - Remove member

### 3. Enhanced Project Onboarding (`/components/OnboardProjectDialog.tsx`)

Updated to send automatic email invitations to researchers.

**Features:**
- **Email-First Approach**: Researcher email is now primary identifier
- **Automatic Notifications**: Backend sends login instructions via email
- **Fixed 5-Stage Lifecycle**: Predefined milestone structure
- **Funding Distribution**:
  - Stage 1: 15% (Research Planning & Setup)
  - Stage 2: 20% (Data Collection & Preliminary Analysis)
  - Stage 3: 30% (Core Research & Development)
  - Stage 4: 20% (Testing & Validation)
  - Stage 5: 15% (Documentation & Dissemination)
- **Success Confirmation**: Toast notification shows email was sent
- **Form Validation**: Email validation and error handling

**API Call Made:**
- `POST /projects/onboard` - Onboard project and send email

### 4. Updated Organization Dashboard (`/components/OrganizationDashboard.tsx`)

Enhanced with member management and "Coming Soon" placeholder.

**Changes:**
- ✅ Added "Members" tab with full member management interface
- ✅ Changed default tab to "Projects" (more active content)
- ✅ Added "Coming Soon" message for campaigns section
- ✅ Integrated MemberManagement component
- ✅ Added UserCog icon for Members tab

## Data Flow

### Adding a Member

```
User fills form → Validates email → API call → Backend adds member → 
Sends email invite → Updates UI → Shows success toast
```

### Onboarding a Project

```
Org fills form → API call → Backend creates project → 
Sends email to researcher → Shows success with email confirmation → 
Resets form → Closes dialog
```

### Voting Power System

```
Member votes → Vote weight = votingPower (1-10x) → 
Backend calculates weighted total → 
If ≥75% approval → Release milestone funds
```

## Key Interfaces

### OrganizationMember
```typescript
{
  id: string;
  email: string;
  name?: string;
  votingPower: number; // 1-10
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  lastActive?: string;
  role: 'admin' | 'member' | 'viewer';
}
```

### OnboardProjectRequest
```typescript
{
  organizationId: string;
  campaignId?: string;
  researcherEmail: string; // NEW: Primary identifier
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
```

### SubmitVoteRequest
```typescript
{
  memberId: string;
  projectId: string;
  milestoneId: string;
  vote: 'approve' | 'reject';
  votingPower: number; // Used for weighted voting
}
```

## Backend Requirements

Your backend needs to implement:

1. **Email Service**
   - Send login instructions when project is onboarded
   - Include researcher email, project details, and access link
   - Template should be professional and clear

2. **Member Management**
   - Store member data with voting power
   - Track invitation status (pending until they login)
   - Support up to 50 members per organization

3. **Weighted Voting Logic**
   - Calculate: `weighted_votes = sum(vote * voting_power)`
   - Required threshold: `weighted_votes >= 0.75 * total_possible_votes`
   - Trigger smart contract when threshold met

4. **Authentication**
   - JWT tokens or similar
   - Organization-level authentication
   - Member-level authentication

## Console Logging

All mock API calls are logged to the browser console:

```
[Mock API] POST https://api.stemtrust.example.com/organizations/org-123/members
{email: "john@example.com", votingPower: 2, role: "member"}

[Mock API] POST https://api.stemtrust.example.com/projects/onboard
[Mock API] Sending login instructions to researcher@university.edu.ng
```

This helps you:
- Debug data flow
- Verify correct API parameters
- Test error handling
- Plan backend implementation

## How to Replace Mock with Real Backend

### Step 1: Update Base URL
```typescript
// In /lib/api.ts
const API_BASE_URL = 'https://api.stemtrust.io'; // Your real URL
```

### Step 2: Uncomment Production Code
Each function has production code commented out. Simply uncomment and adjust:

```typescript
// BEFORE (Mock)
return mockApiCall(mockMembers);

// AFTER (Production)
const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/members`, {
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json',
  },
});
return response.json();
```

### Step 3: Add Authentication
```typescript
function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}
```

### Step 4: Test Each Endpoint
- Test member management (add, update, remove)
- Test project onboarding (verify email sent)
- Test voting (verify weighted calculation)

## UI/UX Features

### Member Management
- **Inline Editing**: Update roles and voting power without opening dialogs
- **Real-time Stats**: See total, active, and pending members at a glance
- **Visual Hierarchy**: Color-coded badges for roles and status
- **Confirmation Dialogs**: Prevent accidental member removal
- **Loading States**: Spinners and disabled inputs during API calls

### Project Onboarding
- **Email Icon**: Visual indicator for email field
- **Success Feedback**: Rich toast with email confirmation
- **Information Boxes**: Clear explanation of 5-stage lifecycle
- **Disabled States**: Prevents double submission
- **Form Reset**: Clean slate after successful submission

### Organization Dashboard
- **Tab Navigation**: Easy switching between sections
- **Coming Soon**: Professional placeholder for campaigns
- **Empty States**: Helpful messages when no data exists
- **Action Buttons**: Quick access to add members or onboard projects

## Error Handling

All API calls include try/catch blocks and user feedback:

```typescript
try {
  const response = await addOrganizationMember(...);
  toast.success('Member added successfully');
} catch (error) {
  toast.error('Failed to add member');
  console.error(error);
}
```

## Testing Checklist

### Member Management
- [ ] Add member with valid email
- [ ] Try adding duplicate email (should fail)
- [ ] Try adding 51st member (should fail)
- [ ] Update voting power for member
- [ ] Change member role
- [ ] Remove member (with confirmation)
- [ ] Verify pending status for new members

### Project Onboarding
- [ ] Onboard project with all fields filled
- [ ] Verify email notification shows in toast
- [ ] Check console for API call details
- [ ] Test with invalid email (should fail)
- [ ] Verify milestone structure is correct
- [ ] Check funding percentages add up to 100%

### Voting Power
- [ ] Create members with different voting powers
- [ ] Simulate votes with different weights
- [ ] Verify weighted calculation is correct
- [ ] Test 75% threshold logic

## Next Steps

1. **Review the API structure** in `/lib/api.ts`
2. **Set up your backend** with the required endpoints
3. **Test each mock endpoint** in the browser
4. **Replace mock calls** with real HTTP requests
5. **Add authentication** to secure API calls
6. **Test error scenarios** (network failures, invalid data)
7. **Deploy and monitor** with proper logging

## File Structure

```
/lib
  ├── api.ts                    # Mock API with all endpoints
  └── API_INTEGRATION.md        # Detailed integration guide

/components
  ├── MemberManagement.tsx      # Member management interface
  ├── OnboardProjectDialog.tsx  # Enhanced project onboarding
  └── OrganizationDashboard.tsx # Updated dashboard with Members tab
```

## Support

The mock API is designed to be:
- **Self-documenting**: Clear interfaces and comments
- **Easy to test**: Console logging of all calls
- **Production-ready**: Just swap mock with real fetch calls
- **Type-safe**: TypeScript interfaces for all data

All console logs include `[Mock API]` prefix for easy filtering.

## Questions to Consider

Before integrating with backend:

1. **Email Service**: Which email service will you use? (SendGrid, AWS SES, etc.)
2. **Email Template**: What should the login instructions look like?
3. **Authentication**: How will organizations authenticate?
4. **Database**: What schema will you use for members, voting power, votes?
5. **Smart Contracts**: How will weighted voting trigger Cardano transactions?
6. **Rate Limiting**: Should there be limits on member invitations?
7. **Audit Trail**: Should you log all member changes and votes?

## Current Status

✅ **Completed:**
- Mock API system with all required endpoints
- Member management UI (add, update, remove, voting power)
- Enhanced project onboarding with email notifications
- Organization dashboard with Members tab
- "Coming Soon" placeholder for campaigns
- Console logging for debugging
- Type-safe interfaces
- Error handling and user feedback

🔄 **Ready for Backend Integration:**
- All API calls are structured and ready
- Just need to replace mock functions with real fetch calls
- Add authentication headers
- Connect to your backend URL

## Example Backend Response Formats

### Get Members Response
```json
{
  "members": [
    {
      "id": "member-1",
      "email": "john@example.com",
      "name": "John Doe",
      "votingPower": 2,
      "status": "active",
      "joinedDate": "2024-11-15",
      "lastActive": "2024-11-28",
      "role": "admin"
    }
  ]
}
```

### Onboard Project Response
```json
{
  "projectId": "proj-123",
  "status": "success",
  "message": "Project onboarded successfully",
  "emailSent": true,
  "researcherEmail": "researcher@university.edu.ng"
}
```

### Submit Vote Response
```json
{
  "success": true,
  "voteId": "vote-456",
  "weightedVote": 3,
  "message": "Your vote (weight: 3) has been recorded",
  "currentTally": {
    "totalFor": 45,
    "totalAgainst": 12,
    "totalPossible": 75,
    "approvalPercentage": 60,
    "thresholdMet": false
  }
}
```

---

**Last Updated:** November 28, 2024
**Platform:** StemTrust (formerly ScienceTrust Nigeria)
**Technology:** React + TypeScript + Cardano
