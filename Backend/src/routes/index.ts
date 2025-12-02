import { Router } from 'express';
import authRoutes from './auth';
import organizationRoutes from './organization';
import researcherRoutes from './researcher';
import projectRoutes from './projects';
import votingRoutes from './voting';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/researchers', researcherRoutes);
router.use('/projects', projectRoutes);
router.use('/votes', votingRoutes);
// Note: Some endpoints in the docs are like /api/milestones/:id, which might not fit neatly into resource-based routing if strictly following REST.
// However, the docs group them by module.
// For example, /api/milestones/:id is listed under Projects module in the docs table, but has its own section in Endpoints.
// I will add a milestones route if needed, or handle it within projects.
// Looking at the docs:
// GET /api/milestones/:id
// PATCH /api/milestones/:id/start
// ...
// These seem to be top-level resources in the URL structure.
import milestoneRoutes from './milestones';
import memberRoutes from './members';

router.use('/milestones', milestoneRoutes);
router.use('/members', memberRoutes);
