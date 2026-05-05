import express from 'express';
import { registerWorkshop, registerPaidWorkshop, momoWebhook } from '../controllers/registration.controller.js';
import { rateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { idempotency } from '../middlewares/idempotency.middleware.js';
import { isAuthenticated, isAuthorized } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post(
    '/',
    isAuthorized(['student']),
    rateLimiter,
    registerWorkshop
);

router.post(
    '/payment',
    isAuthorized(['student']),
    rateLimiter,
    idempotency,
    registerPaidWorkshop
);

router.post(
    '/webhook/momo',
    momoWebhook
);

export default router;
