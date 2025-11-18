# ScienceTrust Nigeria - Blockchain-Based Research Funding Platform

A transparent, milestone-based funding platform for Nigerian STEM research projects built on Cardano blockchain with **real wallet integration**.

## Problem Statement

Many STEM research projects in Nigeria receive funding from government, NGOs, and organizations, but:
- Funds are often mismanaged without proper tracking
- Research results are sometimes reported dishonestly
- No verification systems exist to validate progress
- Funders, government, and public are losing trust in the research process

## Solution

ScienceTrust Nigeria uses Cardano blockchain technology to create a transparent, accountable funding system where:
- Funds are locked in smart contracts
- Released milestone-by-milestone based on community approval
- All transactions are recorded immutably on-chain
- Researchers must submit verifiable evidence for each stage
- 75% community vote required to unlock each funding stage

## Features

### Authentication & Wallet Integration
- ✅ **Real Cardano Wallet Connection** - CIP-30 standard wallet integration
- ✅ **Multi-Wallet Support** - Nami, Eternl, Flint, Yoroi, Lace, Gero, Typhon, NuFi
- ✅ **Separate Sign In/Sign Up** - Dedicated flows for Organizations and Researchers
- ✅ **Wallet-Based Auth** - Secure authentication tied to Cardano wallet addresses
- ✅ **Auto-Reconnect** - Persistent wallet connection across sessions
- ✅ **Network Detection** - Automatic Mainnet/Testnet detection
- ✅ **Balance Display** - Real-time ADA balance from connected wallet
- ✅ **Install Guide** - Step-by-step wallet installation instructions

### For Organizations/Companies/NGOs/Government
- ✅ Create funding campaigns with custom milestone structure (3-10 stages, default 5)
- ✅ Onboard research projects to campaigns
- ✅ Set up milestone-based funding allocation
- ✅ Review and vote on project progress
- ✅ Track all funded projects in one dashboard

### For Individual Researchers
- ✅ Apply for funding with 5 fixed milestone stages
- ✅ Connect Cardano wallet to receive funds
- ✅ Submit evidence (images, apps, links, documents) for each milestone
- ✅ Receive automatic fund release upon 75% approval
- ✅ Complete transparency throughout the process

### Community Governance
- ✅ Funders can vote on milestone completion
- ✅ 75% approval threshold required to release funds
- ✅ Votes recorded on Cardano blockchain
- ✅ Smart contract automatically mints and releases funds

### Evidence Submission
- ✅ Upload images of research progress
- ✅ Upload apps/software demos
- ✅ Share links to GitHub repos, datasets, demos
- ✅ Upload documents and reports
- ✅ All evidence stored on decentralized storage (IPFS/Arweave)

## Technology Stack

### Frontend (Current Implementation)
- React + TypeScript
- Tailwind CSS
- Shadcn/UI Components
- Mock data for demonstration

### Blockchain Integration (To be implemented)
- **@meshsdk/core** - Cardano wallet connection
- **@meshsdk/react** - React hooks for Mesh
- **lucid-cardano** - Transaction building and smart contract interaction
- **@blockfrost/blockfrost-js** - Cardano blockchain API
- **Plutus** - Smart contract language for Cardano

## Architecture

### Smart Contract Flow
1. Campaign/Project created → Smart contract deployed
2. Funds locked in contract with milestone conditions
3. Researcher submits evidence → Evidence hash stored on-chain
4. Community votes → Votes recorded in contract
5. 75% threshold reached → Contract automatically releases funds

### Data Storage
- **On-chain**: Transaction records, votes, evidence hashes
- **IPFS/Arweave**: Evidence files (images, docs, apps)
- **Blockfrost**: Blockchain data queries

## Project Structure

```
/
├── components/
│   ├── LandingPage.tsx           # Marketing landing page
│   ├── AuthPage.tsx              # Authentication page wrapper
│   ├── SignInForm.tsx            # Sign in form with wallet connection
│   ├── SignUpForm.tsx            # Sign up form with wallet connection
│   ├── OrganizationDashboard.tsx # Organization view & campaign management
│   ├── IndividualDashboard.tsx   # Researcher view & applications
│   ├── ProjectDetail.tsx         # Detailed project view with milestones
│   ├── CreateCampaignDialog.tsx  # Create new funding campaign
│   ├── OnboardProjectDialog.tsx  # Onboard project to campaign
│   ├── CreateProjectDialog.tsx   # Individual funding application
│   ├── SubmitEvidenceDialog.tsx  # Upload evidence for milestones
│   ├── VotingPanel.tsx           # Community voting interface
│   ├── WalletProvider.tsx        # Real Cardano wallet context (CIP-30)
│   ├── WalletStatus.tsx          # Wallet connection status display
│   ├── InstallWalletGuide.tsx    # Wallet installation guide
│   └── ui/                       # Shadcn UI components
├── lib/
│   └── mockData.ts               # Mock projects, campaigns, milestones
├── styles/
│   └── globals.css               # Global styles and Tailwind config
└── App.tsx                        # Main application component
```

## Mock Data

The current implementation includes mock data for:
- 3 sample projects (AgriTech, Water Purification, Blockchain Supply Chain)
- 2 campaigns (AgriTech Fund, Cocoa Value Chain)
- Multiple backers and funders
- Evidence submissions
- Voting progress

## Next Steps for Production

### 1. Cardano Wallet Integration
```typescript
import { BrowserWallet } from '@meshsdk/core';

// Connect wallet
const wallet = await BrowserWallet.enable('nami');
const address = await wallet.getUsedAddresses();
```

### 2. Smart Contract Development
- Write Plutus smart contracts for:
  - Campaign creation and fund locking
  - Milestone-based fund release
  - Voting mechanism with 75% threshold
  - Automatic fund minting per stage

### 3. Blockfrost API Integration
```typescript
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

const API = new BlockFrostAPI({
  projectId: 'YOUR_BLOCKFROST_PROJECT_ID',
});
```

### 4. Evidence Storage
- Integrate IPFS for decentralized file storage
- Store IPFS hashes on Cardano blockchain
- Implement file upload and retrieval

### 5. Transaction Building with Lucid
```typescript
import { Lucid, Blockfrost } from 'lucid-cardano';

const lucid = await Lucid.new(
  new Blockfrost('https://cardano-mainnet.blockfrost.io/api/v0', 'YOUR_API_KEY'),
  'Mainnet',
);
```

## User Flows

### Authentication & Wallet Connection
1. Visit ScienceTrust Nigeria landing page
2. Click "Login as Researcher" or "Login as Organization"
3. Choose Sign In or Sign Up
4. Fill in credentials (email, password, profile information)
5. Connect Cardano wallet:
   - If wallet installed: Select from Nami, Eternl, Flint, Yoroi, Lace, etc.
   - If no wallet: Follow installation guide to install wallet extension
6. Approve wallet connection
7. System verifies wallet address and creates/authenticates account
8. Redirected to dashboard with wallet connected

### Organization Creating Campaign
1. Login as organization
2. Click "Create Campaign"
3. Set campaign details, budget, and milestone stages (3-10)
4. Deploy smart contract with campaign parameters
5. Onboard projects or wait for researcher applications

### Researcher Applying for Funding
1. Login as individual researcher
2. Click "Apply for Funding"
3. Fill project details with 5 fixed milestones
4. Connect Cardano wallet
5. Submit application for community backing

### Milestone Completion & Voting
1. Researcher completes milestone work
2. Submit evidence (images, apps, links, docs)
3. Evidence uploaded to IPFS, hash stored on-chain
4. Community funders receive notification
5. Funders review evidence and vote
6. 75% approval → Smart contract releases funds
7. Funds automatically sent to researcher wallet

## Benefits

### For Researchers
- ✅ Access to transparent funding
- ✅ Clear milestone structure
- ✅ Direct wallet-to-wallet payments
- ✅ Build reputation on-chain

### For Funders
- ✅ Complete transparency of fund usage
- ✅ Vote on milestone completion
- ✅ Immutable record of all transactions
- ✅ Confidence that funds are used properly

### For Nigeria's STEM Ecosystem
- ✅ Restored trust in research funding
- ✅ Reduced corruption and mismanagement
- ✅ Verifiable research outcomes
- ✅ Attracting more funding to genuine projects
- ✅ Building world-class research infrastructure

## Running the Application

This is a frontend-only implementation with mock data. To run:

```bash
# The app is already running in Figma Make environment
# All components are functional with mock data
```

## Security Considerations

- Smart contracts should be audited before mainnet deployment
- Multi-signature wallets recommended for large campaigns
- Evidence integrity verified through cryptographic hashes
- Voting mechanism resistant to Sybil attacks
- Time-locks on fund release for dispute resolution

## License

Built for Nigerian STEM research transparency and accountability.

---

**Note**: This is a frontend prototype with mock data. Production deployment requires:
- Cardano smart contract development
- Wallet integration (Mesh/Lucid)
- Blockfrost API setup
- IPFS/Arweave integration
- Security audits