import healthRouter from './health.route.js';
import express from 'express';
const router = express.Router();

router.use('/health', healthRouter);

export default router;
