import express from 'express';
import * as workshopController from '../controllers/workshop.controller.js';
import { isAuthorized } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get(
    '/',
    isAuthorized(['STUDENT', 'ADMIN', 'STAFF']),
    workshopController.listWorkshops
);

router.get(
    '/:id',
    isAuthorized(['STUDENT', 'ADMIN', 'STAFF']),
    workshopController.getWorkshop
);

export default router;
