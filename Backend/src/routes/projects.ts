import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../services/email';
import {
  Project,
  OnboardProjectRequest,
  OnboardProjectResponse,
  ProjectTeamMember,
  Milestone,
  ProjectStatus
} from '../types/api';
import { lockFunds, releaseFunds, getScript, buildDatum, getBackendWalletAddress, getBackendWalletPubKeyHash, getBackendWalletBalance } from '../services/smartContract';
import { deserializeAddress } from '@meshsdk/core';

const router = Router();

// Helper to format project
const formatProject = (p: any): Project => ({
  id: p.id,
  title: p.title,
  description: p.description || '',
  category: p.category || '',
  organizationId: p.organizationId || '',
  organizationName: p.organization?.name || '',
  researcherId: p.researcherId || '',
  researcherName: p.researcher?.name || '',
  researcherEmail: p.researcher?.user?.email || '',
  institution: p.researcher?.institution || '',
  researcherWalletAddress: p.researcher?.walletAddress || '',
  totalFunding: Number(p.totalFunding),
  fundingReleased: Number(p.fundingReleased),
  status: p.status as ProjectStatus,
  createdAt: p.createdAt.toISOString(),
  updatedAt: p.updatedAt.toISOString(),
  milestones: p.milestones?.map((m: any) => ({
    id: m.id,
    stageNumber: m.stageNumber,
    title: m.title,
    description: m.description || '',
    status: m.status as any,
    fundingAmount: Number(m.fundingAmount),
    fundingPercentage: m.fundingPercentage,
    evidence: m.evidence?.map((e: any) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      description: e.description,
      url: e.url,
      fileName: e.fileName,
      fileData: e.fileData,
      mimeType: e.mimeType,
      uploadedAt: e.uploadedAt?.toISOString() || new Date().toISOString()
    })) || []
  })) || [],
  teamMembers: p.teamMembers?.map((tm: any) => ({
    id: tm.member.id,
    name: tm.member.name,
    role: tm.member.role,
    email: tm.member.email
  })) || [],
  backers: p.organization ? [{
    id: p.organization.id,
    name: p.organization.name,
    walletAddress: p.organization.walletAddress || '',
    amount: Number(p.totalFunding)
  }] : [],
  currentMilestone: (p.milestones?.filter((m: any) => m.status === 'approved').length || 0) + 1
});

// GET /api/projects/deposit-address - Returns backend wallet address for organizations to send funds to
router.get('/deposit-address', async (req, res) => {
  try {
    const walletAddress = await getBackendWalletAddress();
    const balance = await getBackendWalletBalance();

    res.json({
      success: true,
      data: {
        depositAddress: walletAddress,
        network: 'preprod',
        currentBalance: balance,
        instructions: 'Send the funding amount to this address. Once confirmed, proceed with project onboarding.'
      }
    });
  } catch (error: any) {
    console.error('Error getting deposit address:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'WALLET_ERROR',
        message: error.message || 'Failed to get deposit address'
      }
    });
  }
});

// GET /api/projects/lock-tx-params - Returns parameters needed for frontend to build lock transaction
// IMPORTANT: This route must be defined BEFORE /:id route to prevent Express treating 'lock-tx-params' as an ID
router.get('/lock-tx-params', async (req, res) => {
  try {
    const { scriptAddr, scriptCbor } = getScript();

    res.json({
      success: true,
      data: {
        scriptAddress: scriptAddr,
        scriptCbor: scriptCbor,
        // Frontend will use buildDatum() equivalent with these params
        datumStructure: {
          fields: ['organizationHash', 'researcherHash', 'memberHashes', 'totalFunds', 'milestonePercentages', 'currentMilestone']
        }
      }
    });
  } catch (error: any) {
    console.error('Error getting lock params:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SMART_CONTRACT_ERROR',
        message: error.message || 'Failed to get script parameters'
      }
    });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        organization: true,
        researcher: {
          include: { user: true }
        },
        milestones: {
          orderBy: { stageNumber: 'asc' },
          include: { evidence: true }
        },
        teamMembers: {
          include: {
            member: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    res.json({ success: true, data: formatProject(project) });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/projects/:projectId/milestones/:milestoneId/unlock-tx-params
// Returns parameters needed for frontend to build unlock transaction
router.get('/:projectId/milestones/:milestoneId/unlock-tx-params', async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;

    // Fetch project with all required data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: { include: { members: true } },
        researcher: true,
        milestones: { orderBy: { stageNumber: 'asc' } }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    if (milestone.status !== 'approved') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Milestone not yet approved for release' } });
    }

    const { scriptAddr, scriptCbor } = getScript();
    const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);

    // Helper to safely convert wallet address to pubkey hash
    const addressToPubKeyHash = (address: string | null | undefined): string => {
      if (!address) return '';
      try {
        return deserializeAddress(address).pubKeyHash;
      } catch (e) {
        console.warn('Could not deserialize address:', address);
        return '';
      }
    };

    // Convert wallet addresses to pubkey hashes (what the smart contract expects)
    const orgPubKeyHash = addressToPubKeyHash(project.organization?.walletAddress);
    const researcherPubKeyHash = addressToPubKeyHash(project.researcher?.walletAddress);
    const memberPubKeyHashes = (project.organization?.members || [])
      .filter(m => m.walletAddress)
      .map(m => addressToPubKeyHash(m.walletAddress))
      .filter(h => h !== '');

    // Fetch script UTXOs from Blockfrost (server-side to avoid CORS issues)
    let scriptUtxos: any[] = [];
    const blockfrostKey = process.env.BLOCKFROST;
    if (blockfrostKey) {
      try {
        const { BlockfrostProvider } = await import('@meshsdk/core');
        const provider = new BlockfrostProvider(blockfrostKey);
        scriptUtxos = await provider.fetchAddressUTxOs(scriptAddr);
        console.log('[unlock-tx-params] Found', scriptUtxos.length, 'UTXOs at script address');
      } catch (e) {
        console.error('[unlock-tx-params] Error fetching script UTXOs:', e);
      }
    }

    console.log('[unlock-tx-params] Debug info:');
    console.log('  Script Address:', scriptAddr);
    console.log('  Project TxHash:', project.transactionHash);
    console.log('  Org PubKeyHash:', orgPubKeyHash);
    console.log('  Researcher PubKeyHash:', researcherPubKeyHash);
    console.log('  Member PubKeyHashes:', memberPubKeyHashes);
    console.log('  Script UTXOs count:', scriptUtxos.length);

    res.json({
      success: true,
      data: {
        scriptAddress: scriptAddr,
        scriptCbor: scriptCbor,
        projectTxHash: project.transactionHash,
        milestoneIndex,
        releaseAmount: Number(milestone.fundingAmount),
        researcherWallet: project.researcher?.walletAddress,
        datumParams: {
          organization: orgPubKeyHash,
          researcher: researcherPubKeyHash,
          members: memberPubKeyHashes,
          totalFunds: Number(project.totalFunding) * 1_000_000,
          milestones: project.milestones.map(m => m.fundingPercentage || 0),
          currentMilestone: milestoneIndex
        },
        isLastMilestone: milestoneIndex >= project.milestones.length - 1,
        // Include script UTXOs fetched by backend
        scriptUtxos: scriptUtxos.map(u => ({
          txHash: u.input.txHash,
          outputIndex: u.input.outputIndex,
          amount: u.output.amount,
          address: u.output.address
        }))
      }
    });
  } catch (error: any) {
    console.error('Error getting unlock params:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to get unlock parameters' }
    });
  }
});

// POST /api/projects/:projectId/milestones/:milestoneId/build-unlock-tx
// Builds the complete unsigned transaction on backend (avoids CORS issues)
router.post('/:projectId/milestones/:milestoneId/build-unlock-tx', async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const { walletAddress, walletUtxos } = req.body;

    if (!walletAddress || !walletUtxos) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'walletAddress and walletUtxos are required' }
      });
    }

    // Fetch project with all required data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: { include: { members: true } },
        researcher: true,
        milestones: { orderBy: { stageNumber: 'asc' } }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    if (milestone.status !== 'approved') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Milestone not yet approved' } });
    }

    const { scriptAddr, scriptCbor } = getScript();
    const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);

    // Get pubkey hashes
    const addressToPubKeyHash = (address: string | null | undefined): string => {
      if (!address) return '';
      try {
        return deserializeAddress(address).pubKeyHash;
      } catch (e) {
        console.warn('[build-unlock-tx] Failed to deserialize address:', address);
        return '';
      }
    };

    // Try org wallet first, fallback to connected wallet
    let orgPubKeyHash = addressToPubKeyHash(project.organization?.walletAddress);
    if (!orgPubKeyHash || orgPubKeyHash.length !== 56) {
      console.log('[build-unlock-tx] Org wallet not set, using connected wallet:', walletAddress);
      orgPubKeyHash = addressToPubKeyHash(walletAddress);
    }

    const researcherPubKeyHash = addressToPubKeyHash(project.researcher?.walletAddress);

    // Get member pubkey hashes, filter out empty ones
    let memberPubKeyHashes = (project.organization?.members || [])
      .filter((m: any) => m.walletAddress)
      .map((m: any) => addressToPubKeyHash(m.walletAddress))
      .filter((h: string) => h !== '' && h.length === 56);

    console.log('[build-unlock-tx] Org pubkey hash:', orgPubKeyHash);
    console.log('[build-unlock-tx] Researcher pubkey hash:', researcherPubKeyHash);
    console.log('[build-unlock-tx] Member pubkey hashes:', memberPubKeyHashes);

    // CRITICAL: If no valid member hashes, use the org pubkey hash
    // The smart contract requires at least one valid signer
    if (memberPubKeyHashes.length === 0 && orgPubKeyHash) {
      console.log('[build-unlock-tx] No member hashes found, using org pubkey hash');
      memberPubKeyHashes = [orgPubKeyHash];
    }

    // Validate we have the required pubkey hashes
    if (!orgPubKeyHash || orgPubKeyHash.length !== 56) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Could not determine organization pubkey hash from wallet' }
      });
    }

    // Fetch script UTXOs
    const blockfrostKey = process.env.BLOCKFROST;
    if (!blockfrostKey) {
      return res.status(500).json({ success: false, error: { code: 'CONFIG_ERROR', message: 'Blockfrost not configured' } });
    }

    const { BlockfrostProvider, MeshTxBuilder } = await import('@meshsdk/core');
    const provider = new BlockfrostProvider(blockfrostKey);
    const scriptUtxos = await provider.fetchAddressUTxOs(scriptAddr);

    if (!scriptUtxos || scriptUtxos.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_UTXOS', message: 'No UTXOs at script address' } });
    }

    // Find matching UTXO or use first
    let scriptUtxo = scriptUtxos.find((u: any) => u.input.txHash === project.transactionHash);
    if (!scriptUtxo) {
      scriptUtxo = scriptUtxos[0];
    }

    // Calculate amounts
    const releaseLovelace = Number(milestone.fundingAmount) * 1_000_000;
    const currentValue = parseInt(
      scriptUtxo.output.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0'
    );
    const remainingValue = currentValue - releaseLovelace;
    const isLastMilestone = milestoneIndex >= project.milestones.length - 1;

    console.log('[build-unlock-tx] Release:', releaseLovelace, 'Current:', currentValue, 'Remaining:', remainingValue);

    // Get the researcher's wallet address - must be bech32 format (addr_test1...)
    const researcherWalletAddress = project.researcher?.walletAddress;
    console.log('[build-unlock-tx] Researcher wallet from DB:', researcherWalletAddress);

    // Validate the researcher address is a proper bech32 address
    let payToAddress = researcherWalletAddress;
    if (!payToAddress || !payToAddress.startsWith('addr_')) {
      console.log('[build-unlock-tx] Researcher has no valid wallet, using org wallet:', walletAddress);
      // If researcher hasn't set their wallet yet, pay to the org wallet for now
      payToAddress = walletAddress;
    }
    console.log('[build-unlock-tx] Paying to address:', payToAddress);

    // Build redeemer
    const redeemer: any = {
      alternative: 0,
      fields: [milestoneIndex, memberPubKeyHashes]
    };

    // Build next datum
    const nextDatum: any = {
      alternative: 0,
      fields: [
        orgPubKeyHash,
        researcherPubKeyHash,
        memberPubKeyHashes,
        Number(project.totalFunding) * 1_000_000,
        project.milestones.map(m => m.fundingPercentage || 0),
        milestoneIndex + 1
      ]
    };

    // Build transaction
    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      submitter: provider,
    });

    // Spend script UTXO
    await txBuilder
      .spendingPlutusScriptV3()
      .txIn(scriptUtxo.input.txHash, scriptUtxo.input.outputIndex)
      .txInInlineDatumPresent()
      .txInRedeemerValue(redeemer)
      .txInScript(scriptCbor);

    // Pay the researcher (must be valid bech32 address)
    txBuilder.txOut(payToAddress as string, [
      { unit: 'lovelace', quantity: releaseLovelace.toString() }
    ]);

    // Continuing output if not last milestone
    if (!isLastMilestone && remainingValue > 2_000_000) {
      txBuilder
        .txOut(scriptAddr, [
          { unit: 'lovelace', quantity: remainingValue.toString() }
        ])
        .txOutInlineDatumValue(nextDatum);
    }

    // Required signers
    txBuilder.requiredSignerHash(orgPubKeyHash);
    for (const memberHash of memberPubKeyHashes.slice(0, 3)) {
      if (memberHash) txBuilder.requiredSignerHash(memberHash);
    }

    // Find collateral from wallet UTXOs
    const collateralUtxo = walletUtxos.find((u: any) => {
      const lovelace = u.output?.amount?.find((a: any) => a.unit === 'lovelace');
      return lovelace && parseInt(lovelace.quantity) >= 5_000_000;
    });

    if (collateralUtxo) {
      txBuilder.txInCollateral(
        collateralUtxo.input.txHash,
        collateralUtxo.input.outputIndex,
        collateralUtxo.output.amount,
        collateralUtxo.output.address
      );
    }

    txBuilder.changeAddress(walletAddress);
    txBuilder.selectUtxosFrom(walletUtxos);

    await txBuilder.complete();

    console.log('[build-unlock-tx] Transaction built successfully!');

    res.json({
      success: true,
      data: {
        unsignedTx: txBuilder.txHex,
        txHash: '', // Will be set after signing
      }
    });
  } catch (error: any) {
    console.error('Error building unlock tx:', error);
    res.status(500).json({
      success: false,
      error: { code: 'BUILD_ERROR', message: error.message || 'Failed to build transaction' }
    });
  }
});

// POST /api/projects/:projectId/milestones/:milestoneId/confirm-release
// Called by frontend after successfully submitting the unlock transaction
router.post('/:projectId/milestones/:milestoneId/confirm-release', async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Transaction hash is required' } });
    }

    // Verify milestone exists and is approved
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { project: true }
    });

    if (!milestone || milestone.projectId !== projectId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    if (milestone.status !== 'approved') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Milestone is not in approved status' } });
    }

    // Update milestone status to 'released'
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'released',
        releaseDate: new Date(),
        transactionHash: transactionHash
      }
    });

    // Update project funding released
    await prisma.project.update({
      where: { id: projectId },
      data: {
        fundingReleased: {
          increment: Number(milestone.fundingAmount)
        }
      }
    });

    console.log(`[Fund Release] Milestone ${milestoneId} released! Tx: ${transactionHash}`);

    res.json({
      success: true,
      data: {
        milestoneId,
        status: 'released',
        transactionHash,
        amountReleased: Number(milestone.fundingAmount),
        message: 'Funds confirmed as released'
      }
    });
  } catch (error: any) {
    console.error('Error confirming release:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message || 'Failed to confirm release' }
    });
  }
});

// POST /api/projects/:projectId/milestones/:milestoneId/release-funds
// BACKEND-ONLY: Releases funds using the backend wallet (no frontend wallet signing needed)
router.post('/:projectId/milestones/:milestoneId/release-funds', async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;

    // Fetch project with all required data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: { include: { members: true } },
        researcher: true,
        milestones: { orderBy: { stageNumber: 'asc' } }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    const milestone = project.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    if (milestone.status !== 'approved') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Milestone not yet approved for release' } });
    }

    const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
    const releaseAmount = Number(milestone.fundingAmount);

    // Get researcher's wallet address
    let recipientAddress = project.researcher?.walletAddress;
    if (!recipientAddress) {
      return res.status(400).json({ success: false, error: { code: 'NO_WALLET', message: 'Researcher has not set their wallet address' } });
    }

    // Validate address format - must be bech32 (addr_test1... or addr1...)
    if (!recipientAddress.startsWith('addr')) {
      console.error(`[release-funds] Invalid wallet address format: ${recipientAddress.substring(0, 40)}...`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ADDRESS',
          message: 'Researcher wallet address is not in valid bech32 format (should start with addr_test1 or addr1). Please ask researcher to re-submit evidence with a valid Cardano wallet address.'
        }
      });
    }

    // Get backend wallet pubkey hash (used as organization)
    const backendPubKeyHash = await getBackendWalletPubKeyHash();

    // Build datum params (backend wallet is org, researcher, and members)
    const datumParams = {
      organization: backendPubKeyHash,
      researcher: backendPubKeyHash, // For now, same as org
      members: [backendPubKeyHash],
      totalFunds: Number(project.totalFunding) * 1_000_000,
      milestones: project.milestones.map(m => m.fundingPercentage || 0),
      currentMilestone: milestoneIndex
    };

    console.log(`[release-funds] Releasing ${releaseAmount} ADA for milestone ${milestoneIndex + 1} to ${recipientAddress}`);

    // Call the smart contract release function
    const txHash = await releaseFunds(
      milestoneIndex,
      releaseAmount,
      recipientAddress,
      project.transactionHash || '',
      datumParams
    );

    // Update milestone status
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'released',
        transactionHash: txHash
      }
    });

    // Update project funding released
    await prisma.project.update({
      where: { id: projectId },
      data: {
        fundingReleased: {
          increment: releaseAmount
        }
      }
    });

    console.log(`[release-funds] SUCCESS! Tx: ${txHash}`);

    res.json({
      success: true,
      data: {
        milestoneId,
        status: 'released',
        transactionHash: txHash,
        amountReleased: releaseAmount,
        recipientAddress,
        message: 'Funds released successfully'
      }
    });
  } catch (error: any) {
    console.error('[release-funds] ERROR:', error);
    res.status(500).json({
      success: false,
      error: { code: 'RELEASE_ERROR', message: error.message || 'Failed to release funds' }
    });
  }
});

// POST /api/projects/onboard
router.post('/onboard', async (req, res) => {
  const body: OnboardProjectRequest = req.body;

  try {
    // 1. Find Researcher by email or create if not exists (simplified for now, assuming researcher exists or we link by ID)
    // In a real flow, we might invite them. Here we assume the ID is passed or we look up by email.
    // The request body has researcherEmail.

    let researcherId = body.researcherId;

    // If no ID provided, try to find by email
    if (!researcherId && body.researcherEmail) {
      const user = await prisma.user.findUnique({ where: { email: body.researcherEmail } });

      if (user) {
        // User exists, get their researcher profile
        const researcher = await prisma.researcher.findUnique({ where: { userId: user.id } });
        if (researcher) {
          researcherId = researcher.id;
        } else if (user.role === 'researcher') {
          // User is researcher but no profile? Should not happen, but let's create one
          const newResearcher = await prisma.researcher.create({
            data: { userId: user.id, name: body.researcherName || 'Researcher' }
          });
          researcherId = newResearcher.id;
        }
      } else {
        // User does NOT exist. We need to create a placeholder/shadow user so the project is linked.
        // This ensures when they sign up with this email, they get access.
        // We'll create a user with a default password so they can sign in immediately.

        const tempPassword = 'StemTrust2025!'; // Default password for auto-onboarded users

        // Dynamic import for bcrypt to avoid top-level issues if any
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const newUser = await prisma.user.create({
          data: {
            email: body.researcherEmail,
            passwordHash: hashedPassword,
            role: 'researcher',
            researcher: {
              create: {
                name: body.researcherName || 'Invited Researcher',
                institution: body.institution || 'Pending Institution'
              }
            }
          },
          include: { researcher: true }
        });

        if (newUser.researcher) {
          researcherId = newUser.researcher.id;
        }
      }
    }

    // 2. Create Project in DB
    const project = await prisma.project.create({
      data: {
        title: body.projectTitle, // Mapped from projectTitle
        description: body.projectDescription, // Mapped from projectDescription
        category: body.category,
        organizationId: body.organizationId, // Assuming this comes from auth context or body
        researcherId: researcherId,
        totalFunding: body.totalFunding,
        status: 'pending_onboarding',
        milestones: {
          create: body.milestones.map((m, index) => ({
            stageNumber: index + 1,
            title: m.title,
            description: m.description,
            fundingAmount: (Number(body.totalFunding) * (m.fundingPercentage / 100)),
            fundingPercentage: m.fundingPercentage,
            durationWeeks: m.durationWeeks,
            status: 'pending'
          }))
        }
      },
      include: {
        milestones: true
      }
    });

    // 3. Lock Funds on Blockchain using BACKEND wallet
    // The organization has already sent funds to our deposit address
    let txHash = 'pending';
    let scriptAddress = 'pending';

    try {
      // Get backend wallet pubkey hash (used for all datum fields)
      const backendPubKeyHash = await getBackendWalletPubKeyHash();
      const { scriptAddr } = getScript();
      scriptAddress = scriptAddr;

      console.log('[Onboard] Locking funds with backend wallet...');
      console.log('[Onboard] Backend PubKeyHash:', backendPubKeyHash);
      console.log('[Onboard] Amount:', body.totalFunding, 'ADA');

      // DEBUG: Show the milestones being locked
      const milestonePercentages = body.milestones.map(m => m.fundingPercentage);
      console.log('[Onboard] Milestone percentages:', milestonePercentages);

      // Lock funds using backend wallet
      txHash = await lockFunds(
        Number(body.totalFunding),
        body.milestones.map(m => ({ percentage: m.fundingPercentage })),
        backendPubKeyHash, // Organization (backend wallet)
        backendPubKeyHash, // Researcher (placeholder, same as org for now)
        [backendPubKeyHash] // Members (backend wallet is the only member)
      );

      console.log('[Onboard] Funds locked! TxHash:', txHash);
    } catch (e: any) {
      console.error('[Onboard] Smart contract error:', e);
      // Delete project and milestones since locking failed
      await prisma.$transaction([
        prisma.milestone.deleteMany({ where: { projectId: project.id } }),
        prisma.project.delete({ where: { id: project.id } })
      ]);

      return res.status(500).json({
        success: false,
        error: {
          code: 'SMART_CONTRACT_ERROR',
          message: e.message || 'Failed to lock funds on blockchain'
        }
      });
    }

    // 4. Update Project with Smart Contract Info
    await prisma.project.update({
      where: { id: project.id },
      data: {
        smartContractAddress: scriptAddress,
        transactionHash: txHash,
        status: 'active' // Activate project after locking funds
      }
    });

    // 4b. Auto-activate the first milestone so researcher can immediately submit evidence
    const firstMilestone = await prisma.milestone.findFirst({
      where: { projectId: project.id },
      orderBy: { stageNumber: 'asc' }
    });

    if (firstMilestone) {
      await prisma.milestone.update({
        where: { id: firstMilestone.id },
        data: {
          status: 'in_progress',
          startDate: new Date()
        }
      });
    }

    // 5. Send Email to Researcher
    const loginUrl = 'http://localhost:3000/auth';
    const emailSubject = `Project Onboarding: ${body.projectTitle}`;
    const emailBody = `
      Hello ${body.researcherName || 'Researcher'},

      An organization has onboarded a new project titled "${body.projectTitle}" and assigned you as the lead researcher.

      Project Details:
      - Title: ${body.projectTitle}
      - Total Funding: ${body.totalFunding} ADA
      - Milestones: ${body.milestones.length}

      To access your project dashboard and submit evidence for milestones:
      1. Go to ${loginUrl}
      2. Select "Sign In" (Your account has been automatically created)
      3. Email: ${body.researcherEmail}
      4. Password: StemTrust2025!

      Please change your password after your first login.

      Best regards,
      StemTrust Team
    `;

    try {
      await sendEmail(body.researcherEmail, emailSubject, emailBody);
    } catch (emailError) {
      console.error('Failed to send researcher email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    const response: OnboardProjectResponse = {
      projectId: project.id,
      status: 'success',
      message: 'Project onboarded successfully',
      emailSent: true,
      researcherEmail: body.researcherEmail,
      smartContractAddress: scriptAddress,
      transactionHash: txHash
    };

    res.json({ success: true, data: response });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// PATCH /api/projects/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: updates.title,
        description: updates.description,
        status: updates.status
      },
      include: {
        organization: true,
        researcher: { include: { user: true } },
        milestones: true,
        teamMembers: { include: { member: true } }
      }
    });

    res.json({ success: true, data: formatProject(project) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// PATCH /api/projects/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: { status },
      include: {
        organization: true,
        researcher: { include: { user: true } },
        milestones: true,
        teamMembers: { include: { member: true } }
      }
    });

    res.json({ success: true, data: formatProject(project) });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/projects/:id/team
router.get('/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    const teamMembers = await prisma.projectTeamMember.findMany({
      where: { projectId: id },
      include: { member: true }
    });

    const formattedTeam = teamMembers.map(tm => ({
      id: tm.member.id,
      name: tm.member.name,
      role: tm.member.role,
      email: tm.member.email
    }));

    res.json({ success: true, data: formattedTeam });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// POST /api/projects/:id/team
router.post('/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    // Check if already exists
    const existing = await prisma.projectTeamMember.findFirst({
      where: { projectId: id, memberId }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE_ENTRY', message: 'Member already in team' } });
    }

    const teamMember = await prisma.projectTeamMember.create({
      data: {
        projectId: id,
        memberId
      },
      include: { member: true }
    });

    res.json({
      success: true, data: {
        id: teamMember.member.id,
        name: teamMember.member.name,
        role: teamMember.member.role,
        email: teamMember.member.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// DELETE /api/projects/:id/team/:memberId
router.delete('/:id/team/:memberId', async (req, res) => {
  try {
    const { id, memberId } = req.params;

    // We need to find the ProjectTeamMember record first because we are deleting by memberId, not the join table ID
    const teamMember = await prisma.projectTeamMember.findFirst({
      where: { projectId: id, memberId }
    });

    if (teamMember) {
      await prisma.projectTeamMember.delete({
        where: { id: teamMember.id }
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/projects/:id/milestones
router.get('/:id/milestones', async (req, res) => {
  try {
    const { id } = req.params;
    const milestones = await prisma.milestone.findMany({
      where: { projectId: id },
      orderBy: { stageNumber: 'asc' }
    });

    const formattedMilestones = milestones.map(m => ({
      id: m.id,
      stageNumber: m.stageNumber,
      title: m.title,
      description: m.description || '',
      fundingAmount: Number(m.fundingAmount),
      fundingPercentage: m.fundingPercentage || 0,
      durationWeeks: m.durationWeeks || 0,
      status: m.status as any,
      startDate: m.startDate?.toISOString(),
      evidence: [], // Not fetching evidence here for list view
      votes: []
    }));

    res.json({ success: true, data: formattedMilestones });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// GET /api/projects/:id/voting-status
router.get('/:id/voting-status', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any milestone is in voting status
    const votingMilestone = await prisma.milestone.findFirst({
      where: {
        projectId: id,
        status: 'voting'
      }
    });

    res.json({ success: true, data: { status: votingMilestone ? 'active' : 'inactive' } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// MILESTONES & EVIDENCE

// POST /api/projects/milestones/:milestoneId/submit
router.post('/milestones/:milestoneId/submit', async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { evidence } = req.body; // Array of evidence objects

    // 1. Create Evidence records
    await prisma.evidence.createMany({
      data: evidence.map((e: any) => ({
        milestoneId,
        type: e.type,
        title: e.title,
        description: e.description,
        url: e.url,
        uploadedAt: new Date()
      }))
    });

    // 2. Update Milestone Status to 'voting'
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'voting',
        submittedDate: new Date()
      }
    });

    res.json({ success: true, message: 'Evidence submitted and voting started' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// GET /api/projects/milestones/:milestoneId/evidence
router.get('/milestones/:milestoneId/evidence', async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const evidence = await prisma.evidence.findMany({
      where: { milestoneId },
      orderBy: { uploadedAt: 'desc' }
    });
    res.json({ success: true, data: evidence });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

// VOTING

// POST /api/projects/votes
router.post('/votes', async (req, res) => {
  try {
    const { milestoneId, projectId, memberId, voteType, votingPower, signature, walletAddress } = req.body;

    // 1. Check if already voted
    const existingVote = await prisma.vote.findFirst({
      where: { milestoneId, memberId }
    });

    if (existingVote) {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_VOTED', message: 'You have already voted on this milestone' } });
    }

    // 2. Create Vote
    await prisma.vote.create({
      data: {
        milestoneId,
        projectId,
        memberId,
        voteType,
        votingPower,
        transactionHash: signature // Storing signature as tx hash for now or separate field
      }
    });

    // 3. Check Threshold
    const votes = await prisma.vote.findMany({ where: { milestoneId } });
    const totalVotes = votes.length; // Simplified: 1 vote per member for now, or sum votingPower
    const approveVotes = votes.filter(v => v.voteType === 'approve').length;
    const percentageApproved = totalVotes > 0 ? (approveVotes / totalVotes) * 100 : 0;

    let releaseData = null;

    if (percentageApproved >= 75) {
      // Threshold reached!
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          status: 'approved',
          approvedDate: new Date()
        }
      });

      // Mock release data for smart contract
      releaseData = {
        paymentAmount: 10000000, // Mock amount
        scriptAddr: 'addr_test1_mock',
        researcherAddress: 'addr_test1_researcher',
        datumParams: {
          currentMilestone: 1
        },
        redeemerParams: {
          milestoneIndex: 0
        },
        scriptUtxo: {
          input: { txHash: 'mock', outputIndex: 0 },
          output: { amount: [{ unit: 'lovelace', quantity: '20000000' }] }
        },
        scriptCbor: 'mock_cbor'
      };
    }

    res.json({
      success: true,
      message: 'Vote recorded',
      votingSummary: {
        totalVotingPower: totalVotes,
        approveVotes,
        rejectVotes: totalVotes - approveVotes,
        percentageApproved,
        hasReachedThreshold: percentageApproved >= 75
      },
      releaseData
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// GET /api/projects/milestones/:milestoneId/voting-summary
router.get('/milestones/:milestoneId/voting-summary', async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const votes = await prisma.vote.findMany({ where: { milestoneId } });

    const totalVotes = votes.length;
    const approveVotes = votes.filter(v => v.voteType === 'approve').length;
    const rejectVotes = votes.filter(v => v.voteType === 'reject').length;
    const percentageApproved = totalVotes > 0 ? (approveVotes / totalVotes) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalVotingPower: totalVotes,
        approveVotes,
        rejectVotes,
        percentageApproved,
        hasReachedThreshold: percentageApproved >= 75
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

export default router;
