import { isAuthenticated } from '../middlewares/auth.middleware.js';
import authRouter from './auth.route.js';
import healthRouter from './health.route.js';
import registrationRouter from './registration.route.js';
import workshopRouter from './workshop.route.js';
import express from 'express';
const router = express.Router();

router.use('/auth', authRouter);
router.use('/health', healthRouter);
router.use('/registrations', isAuthenticated, registrationRouter);
router.use('/workshops', isAuthenticated, workshopRouter);

export default router;
