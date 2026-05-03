import express from 'express';
import { registerWorkshop, registerPaidWorkshop, momoWebhook, getStudentRegistrations } from '../controllers/registration.controller.js';
import { rateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { idempotency } from '../middlewares/idempotency.middleware.js';
import { isAuthenticated, isAuthorized } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post(
    '/',
    isAuthorized(['STUDENT']),
    rateLimiter,
    registerWorkshop
);

router.post(
    '/payment',
    isAuthorized(['STUDENT']),
    rateLimiter,
    idempotency,
    registerPaidWorkshop
);

router.get(
    '/',
    isAuthorized(['STUDENT']),
    getStudentRegistrations
);

router.post(
    '/webhook/momo',
    momoWebhook
);

export default router;
