import express from 'express';
import { listWorkshops, getWorkshop, createWorkshop, updateWorkshop, deleteWorkshop, listStudentWorkshops } from '../controllers/workshop.controller.js';
import { isAuthorized } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get(
    '/',
    isAuthorized(['STUDENT', 'ADMIN', 'STAFF']),
    listWorkshops
);

router.post(
    '/',
    isAuthorized(['ADMIN']),
    createWorkshop
);

router.get(
    '/registered',
    isAuthorized(['STUDENT']),
    listStudentWorkshops
);

router.get(
    '/:id',
    isAuthorized(['STUDENT', 'ADMIN', 'STAFF']),
    getWorkshop
);

router.put(
    '/:id',
    isAuthorized(['ADMIN']),
    updateWorkshop
);

router.delete(
    '/:id',
    isAuthorized(['ADMIN']),
    deleteWorkshop
);

export default router;
