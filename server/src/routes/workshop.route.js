import express from 'express';
import { listWorkshops, getWorkshop, createWorkshop, updateWorkshop, deleteWorkshop, listStudentWorkshops, listWorkshopRegistrations } from '../controllers/workshop.controller.js';
import { isAuthorized } from '../middlewares/auth.middleware.js';
import { validateWorkshopFiles } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get(
    '/',
    isAuthorized(['student', 'admin', 'staff']),
    listWorkshops
);

router.post(
    '/',
    isAuthorized(['admin']),
    validateWorkshopFiles,
    createWorkshop
);

router.get(
    '/registered',
    isAuthorized(['student']),
    listStudentWorkshops
);

router.get(
    '/:id',
    isAuthorized(['student', 'admin', 'staff']),
    getWorkshop
);

router.get(
    '/:id/registrations',
    isAuthorized(['admin', 'staff']),
    listWorkshopRegistrations
);

router.put(
    '/:id',
    isAuthorized(['admin']),
    updateWorkshop
);

router.delete(
    '/:id',
    isAuthorized(['admin']),
    deleteWorkshop
);

export default router;
