import express from 'express';
import { registerWorkshop, registerPaidWorkshop, momoWebhook, syncCheckins } from '../controllers/registration.controller.js';
import { rateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { idempotency } from '../middlewares/idempotency.middleware.js';
import { isAuthenticated, isAuthorized } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post(
    '/',
    isAuthenticated,
    isAuthorized(['student']),
    rateLimiter,
    registerWorkshop
);

router.post(
    '/payment',
    isAuthenticated,
    isAuthorized(['student']),
    rateLimiter,
    idempotency,
    registerPaidWorkshop
);

router.post(
    '/webhook/momo',
    momoWebhook
);

router.post(
    '/checkins/sync',
    isAuthenticated,
    isAuthorized(['staff', 'admin']),
    syncCheckins
);

export default router;
