import express from 'express';
import * as jwtHelper from '../utils/jwt.helper.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import { addSyncCSVJob } from '../queues/sync_csv.queue.js';

const router = express.Router();

router.get('/', (req, res) => {
    return res.json({
        message: 'OK'
    })
});

router.post('/auth', (req, res) => {
    const payload = {
        id: '1',
        name: 'test'
    };

    const token = jwtHelper.generateToken(payload, process.env.JWT_SECRET, "1h");

    return res.json({
        token: token
    });
})

router.get('/auth', authMiddleware.isAuthenticated, (req, res) => {
    res.json({
        susscess: true
    });
})

router.get('/sync', async (req, res) => {
    const job = await addSyncCSVJob('data/export.csv');
    return res.json({
        job_id: job.id
    })
})

export default router;