import { Router } from 'express';
import authRoutes from './auth';
import organizationRoutes from './organization';
import researcherRoutes from './researcher';
import projectRoutes from './projects';
import votingRoutes from './voting';
import memberRoutes from './members';
import milestoneRoutes from './milestones';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/researchers', researcherRoutes);
router.use('/projects', projectRoutes);
router.use('/votes', votingRoutes);
router.use('/members', memberRoutes);
router.use('/milestones', milestoneRoutes);
