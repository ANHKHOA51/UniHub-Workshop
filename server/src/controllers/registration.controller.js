import * as registrationService from '../services/registration.service.js';
import crypto from 'crypto';

export const registerWorkshop = async (req, res) => {
    try {
        const { workshopId } = req.body;
        const userId = req.user?.userId || req.user?.id || 'anonymous';

        if (!workshopId) {
            return res.status(400).json({ message: 'workshopId is required' });
        }

        const registration = await registrationService.createRegistration(userId, workshopId);

        return res.status(201).json({
            message: 'Successfully registered for the workshop',
            data: registration
        });
    } catch (error) {
        console.error('Registration Controller Error:', error.message);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Internal server error' });
    }
};

export const registerPaidWorkshop = async (req, res) => {
    const { workshopId } = req.body;
    const userId = req.user?.userId || req.user?.id || 'anonymous';
    const idempotencyKey = req.headers['idempotency-key'];

    if (!workshopId) {
        return res.status(400).json({ message: 'workshopId is required' });
    }
    if (!idempotencyKey) {
        return res.status(400).json({ message: 'Idempotency-Key header is required' });
    }

    try {
        const registration = await registrationService.createPaymentRegistration(userId, workshopId, idempotencyKey);

        return res.status(201).json({
            message: 'Registration initiated, please complete the payment',
            data: registration
        });
    } catch (error) {
        console.error('Paid Registration Error:', error.message);
        const status = error.status || 500;
        return res.status(status).json({ message: error.message || 'Internal server error' });
    }
};

export const momoWebhook = async (req, res) => {
    const payload = req.body;
    try {
        const momoSignature = payload.signature;

        const isValid = await verifyMoMoSignature(payload, momoSignature);

        if (!isValid) {
            await handleWebhookFailure(payload);
            return res.status(400).json({
                message: 'Invalid signature'
            });
        }

        const result = await registrationService.handlePaymentWebhook(payload);

        return res.status(200).json({
            message: 'Webhook processed successfully',
            data: result
        });
    } catch (error) {
        console.error('Webhook processing error:', error.message);
        await handleWebhookFailure(payload);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

async function handleWebhookFailure(payload) {
    if (!payload) return;

    const { orderId, extraData } = payload;
    if (orderId) {
        const registrationId = orderId.split('-')[0];
        let workshopId = null;
        if (extraData) {
            try {
                const decoded = JSON.parse(Buffer.from(extraData, 'base64').toString('utf-8'));
                workshopId = decoded.workshopId;
            } catch (e) {
                console.error('Failed to parse extraData during failure handling:', e.message);
            }
        }
        await registrationService.cancelRegistration(registrationId, workshopId);
    }
}

async function verifyMoMoSignature(payload, momoSignature) {
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;

    if (!accessKey || !secretKey) {
        console.error('MOMO_ACCESS_KEY or MOMO_SECRET_KEY is not set');
        return false;
    }

    const {
        amount,
        extraData,
        message,
        orderId,
        orderInfo,
        orderType,
        partnerCode,
        payType,
        requestId,
        responseTime,
        resultCode,
        transId
    } = payload || {};

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData || ''}&message=${message || ''}&orderId=${orderId}&orderInfo=${orderInfo || ''}&orderType=${orderType || ''}&partnerCode=${partnerCode}&payType=${payType || ''}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    if (computedSignature !== momoSignature) {
        console.warn('MoMo Signature Mismatch!');
        console.warn('Computed:', computedSignature);
        console.warn('Received:', momoSignature);
    }

    return computedSignature === momoSignature;
}

export const syncCheckins = async (req, res) => {
    try {
        const { records } = req.body;

        if (!records || !Array.isArray(records)) {
            return res.status(400).json({ message: 'Records array is required' });
        }

        const results = await registrationService.syncCheckins(records);

        return res.status(200).json({
            message: 'Sync completed',
            results
        });
    } catch (error) {
        console.error('Sync Controller Error:', error.message);
        return res.status(500).json({ message: 'Internal server error during sync' });
    }
};
