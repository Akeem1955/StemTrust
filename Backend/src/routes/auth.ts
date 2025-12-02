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
const formatUser = (user: any): AuthUser => ({
  id: user.id,
  email: user.email,
  role: user.role as any,
  walletAddress: user.walletAddress || undefined,
  walletProvider: user.walletProvider as any || undefined,
  createdAt: user.createdAt.toISOString(),
  lastLoginAt: user.lastLoginAt?.toISOString(),
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const body: SignUpRequest = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user and related profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: body.email,
          passwordHash: hashedPassword,
          role: body.role,
        },
      });

      // Create profile based on role
      if (body.role === 'organization') {
        await tx.organization.create({
          data: {
            userId: user.id,
            name: body.organizationName || 'New Organization',
          },
        });
      } else if (body.role === 'researcher') {
        await tx.researcher.create({
          data: {
            userId: user.id,
            name: body.email.split('@')[0], // Default name
            institution: body.researchInstitution,
          },
        });
      }

      return user;
    });

    // Generate Token
    const token = jwt.sign(
      { id: result.id, role: result.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response: SignUpResponse = {
      user: formatUser(result),
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

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
  try {
    const body: SignInRequest = req.body;

    const user = await prisma.user.findUnique({
      where: { email: body.email },
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

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response: SignInResponse = {
      user: formatUser(user),
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
router.get('/me', authenticateToken, async (req, res) => {
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
