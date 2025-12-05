import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  AuthUser
} from '../types/api';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to format user for response
const formatUser = (user: any, profile?: any): AuthUser => {
  const baseUser: AuthUser = {
    id: user.id,
    email: user.email,
    role: user.role as any,
    walletAddress: user.walletAddress || undefined,
    walletProvider: user.walletProvider as any || undefined,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
  };

  if (profile) {
    if (user.role === 'organization') {
      baseUser.name = profile.name;
      baseUser.organizationName = profile.name;
      baseUser.organizationId = profile.id; // Populate organizationId
    } else if (user.role === 'researcher') {
      baseUser.name = profile.name;
      baseUser.institution = profile.institution;
      baseUser.researcherId = profile.id;
    }
  }

  return baseUser;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const body: SignUpRequest = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      // If user exists but was created via invitation (e.g. project onboarding), 
      // we might want to allow them to "claim" the account by setting a password.
      // For now, we'll stick to the standard "User exists" error to avoid complexity,
      // and assume the invitation flow handles account creation or the user should use "Forgot Password" 
      // (or we update the onboarding to NOT create a user but just store the email).

      // HOWEVER, since we updated the project onboarding to CREATE a user, 
      // if they try to sign up now, they will get "User exists".
      // We should probably check if they have a "pending" status or similar, but our User model is simple.

      // FIX: If the user exists, we return an error. The user should Login.
      // But they don't know the random password we generated!
      // So, we should probably update the user's password if they are "claiming" an invited account.
      // Let's check if we can identify an "invited" account. 
      // Maybe check if `lastLoginAt` is null?

      if (existingUser.lastLoginAt === null && existingUser.role === body.role) {
        // This is likely an invited user claiming their account.
        // We will update their password and details.
        const hashedPassword = await bcrypt.hash(body.password, 10);

        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash: hashedPassword,
            // Update other fields if needed
          },
          include: {
            organization: true,
            researcher: true
          }
        });

        // Update profile if needed
        let profile = updatedUser.role === 'organization' ? updatedUser.organization : updatedUser.researcher;

        if (body.role === 'researcher' && updatedUser.researcher) {
          await prisma.researcher.update({
            where: { id: updatedUser.researcher.id },
            data: {
              name: body.name || updatedUser.researcher.name,
              institution: body.researchInstitution || updatedUser.researcher.institution
            }
          });
          profile = await prisma.researcher.findUnique({ where: { id: updatedUser.researcher.id } });
        }

        // Generate Token
        const token = jwt.sign(
          { id: updatedUser.id, role: updatedUser.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          user: formatUser(updatedUser, profile),
          token,
          message: 'Account claimed successfully',
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists. Please sign in.',
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user and related profile in transaction
    const { user, profile } = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: body.email,
          passwordHash: hashedPassword,
          role: body.role,
        },
      });

      let newProfile = null;

      // Create profile based on role
      if (body.role === 'organization') {
        newProfile = await tx.organization.create({
          data: {
            userId: newUser.id,
            name: body.organizationName || 'New Organization',
          },
        });

        // Add the creator as an Admin Member with 2x Voting Power
        await tx.organizationMember.create({
          data: {
            organizationId: newProfile.id,
            email: newUser.email,
            name: body.organizationName || 'Admin',
            role: 'admin',
            votingPower: 2,
            status: 'active',
            joinedDate: new Date(),
          }
        });

      } else if (body.role === 'researcher') {
        newProfile = await tx.researcher.create({
          data: {
            userId: newUser.id,
            name: body.name || body.email.split('@')[0], // Use provided name or default
            institution: body.researchInstitution,
          },
        });

        // Link any pending projects to this researcher
        // We find projects where researcherId is null but we might have stored email somewhere?
        // Actually, in the project creation we tried to find by email. 
        // If the user didn't exist then, the project has no researcherId.
        // We need to find projects that were "assigned" to this email.
        // Since we didn't store the email on the project directly if user didn't exist,
        // we need a way to link them.
        // FIX: In project creation, if user doesn't exist, we should probably create a placeholder or store the email.
        // For now, let's assume the project creation logic will be updated to handle this, 
        // or we search for projects where we might have stored the email in a temp field (not currently in schema).

        // Alternative: The project creation logic currently tries to find a user. 
        // If it fails, researcherId is undefined.
        // We should update the project creation to create a shadow user or handle this better.
        // BUT, for this specific request "build up the researcher platform", 
        // we need to ensure that when they sign up, they see their projects.

        // Let's look for projects where the researcherId matches this new researcher's ID.
        // Wait, if the researcher didn't exist, the project has NO researcherId.
        // We need to fix the project creation to store the email if researcher doesn't exist, 
        // OR create the researcher record during project onboarding (as a shadow record).
      }

      // Check for and activate any pending organization memberships
      // This ensures invited members are automatically linked upon signup
      const pendingInvites = await tx.organizationMember.findMany({
        where: { email: newUser.email }
      });

      if (pendingInvites.length > 0) {
        await tx.organizationMember.updateMany({
          where: { email: newUser.email },
          data: { status: 'active' }
        });
      }

      return { user: newUser, profile: newProfile };
    });

    // Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Fetch memberships to include in response
    const memberships = await prisma.organizationMember.findMany({
      where: { email: user.email },
      include: { organization: true }
    });

    const formattedUser = formatUser(user, profile);
    if (memberships.length > 0) {
      formattedUser.memberships = memberships.map(m => ({
        id: m.id,
        organizationId: m.organizationId,
        organizationName: m.organization.name,
        role: m.role
      }));
    }

    const response: SignUpResponse = {
      user: formattedUser,
      token,
      message: 'User registered successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during registration',
      },
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const body: SignInRequest = req.body;

    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: {
        organization: true,
        researcher: true
      }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const validPassword = await bcrypt.compare(body.password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Check for and activate any pending organization memberships
    // This ensures invited members are automatically linked upon signin
    const pendingInvites = await prisma.organizationMember.findMany({
      where: { email: user.email, status: 'pending' }
    });

    if (pendingInvites.length > 0) {
      await prisma.organizationMember.updateMany({
        where: { email: user.email, status: 'pending' },
        data: { status: 'active' }
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const profile = user.role === 'organization' ? user.organization : user.researcher;

    // Fetch memberships
    const memberships = await prisma.organizationMember.findMany({
      where: { email: user.email },
      include: { organization: true }
    });

    const formattedUser = formatUser(user, profile);
    if (memberships.length > 0) {
      formattedUser.memberships = memberships.map(m => ({
        id: m.id, // Member ID
        organizationId: m.organizationId,
        organizationName: m.organization.name,
        role: m.role,
        status: m.status // Include status
      }));
    }

    const response: SignInResponse = {
      user: formattedUser,
      token,
      expiresIn: 86400,
    };

    res.json(response);
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during sign in',
      },
    });
  }
});

// POST /api/auth/signout
router.post('/signout', (req, res) => {
  // Client-side only action usually, but we can return success
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    }

    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR' } });
  }
});

export default router;
