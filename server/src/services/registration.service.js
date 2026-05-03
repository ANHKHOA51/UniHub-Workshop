import { NotificationService } from './notification.service.js';
import { EmailNotificationMethod } from './email.service.js';
import { generateQrData } from '../utils/qr.helper.js';
import redisClient from '../utils/redis.client.js';
import CircuitBreaker from 'opossum';

const notificationService = new NotificationService();
notificationService.subscribe(new EmailNotificationMethod());

const mockMoMoCall = async (registrationId, amount, extraData = '') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (Math.random() < 0.2) {
        throw new Error('MoMo connection timeout or failure');
    }
    return { payUrl: `https://test-payment.momo.vn/v2/gateway/api/create?orderId=${registrationId}&amount=${amount}` };
};

const momoBreaker = new CircuitBreaker(mockMoMoCall, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

momoBreaker.on('open', () => console.warn('MoMo Circuit Breaker OPENED'));
momoBreaker.on('halfOpen', () => console.warn('MoMo Circuit Breaker HALF-OPEN'));
momoBreaker.on('close', () => console.warn('MoMo Circuit Breaker CLOSED'));

export const createRegistration = async (userId, workshopId) => {
    const seatKey = `workshop:${workshopId}:participants`;
    const maxSeats = 50; 

    const result = await redisClient.reserveSeat(seatKey, maxSeats.toString());

    if (result === 0) {
        const error = new Error('Workshop is fully booked');
        error.status = 400;
        throw error;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const id = `reg_${Math.random().toString(36).substring(2, 9)}`;
    const qrCodeData = generateQrData(id);

    notificationService.notifyAll({
        user: { userId },
        content: `Đăng ký thành công workshop: ${workshopId}`
    });

    return {
        id,
        userId,
        workshopId,
        status: 'registered',
        qrCodeData,
        createdAt: new Date().toISOString()
    };
};

export const createPaymentRegistration = async (userId, workshopId, idempotencyKey) => {
    const seatKey = `workshop:${workshopId}:participants`;
    const maxSeats = 50; 

    const result = await redisClient.reserveSeat(seatKey, maxSeats.toString());

    if (result === 0) {
        const error = new Error('Workshop is fully booked');
        error.status = 400;
        throw error;
    }

    const id = `reg_${Math.random().toString(36).substring(2, 9)}`;
    let payUrl;

    try {
        const extraData = Buffer.from(JSON.stringify({ userId, workshopId, idempotencyKey })).toString('base64');
        const response = await momoBreaker.fire(id, 100000, extraData);
        payUrl = response.payUrl;
    } catch (err) {
        await cancelRegistration(id, workshopId);
        const error = new Error('Payment gateway is currently unavailable');
        error.status = 503;
        throw error;
    }

    return {
        registrationId: id,
        status: 'processing',
        payUrl
    };
};

export const cancelRegistration = async (registrationId, workshopId) => {
    if (workshopId) {
        const seatKey = `workshop:${workshopId}:participants`;
        await redisClient.decr(seatKey);
    }
    return true;
};

export const handlePaymentWebhook = async (payload) => {
    const { orderId, resultCode, extraData } = payload;
    let mockWorkshopId = 'mock_workshop_id'; 
    let idempotencyKey = null;
    let userId = null;

    if (extraData) {
        try {
            const decoded = JSON.parse(Buffer.from(extraData, 'base64').toString('utf-8'));
            mockWorkshopId = decoded.workshopId || mockWorkshopId;
            idempotencyKey = decoded.idempotencyKey;
            userId = decoded.userId;
        } catch (e) {
            console.error('Failed to parse extraData', e.message);
        }
    }
    
    if (resultCode === 0) {
        const qrCodeData = generateQrData(orderId);

        if (idempotencyKey) {
            const redisKey = `idempotency:${idempotencyKey}`;
            await redisClient.expire(redisKey, 86400);
        }

        if (userId) {
            notificationService.notifyAll({
                user: { userId },
                content: `Thanh toán thành công cho workshop: ${mockWorkshopId}`
            });
        }

        return {
            id: orderId,
            status: 'success',
            qrCodeData,
            message: 'Payment completed successfully'
        };
    } else {
        await cancelRegistration(orderId, mockWorkshopId);
        return {
            id: orderId,
            status: 'canceled',
            message: 'Payment failed or canceled'
        };
    }
};

export const getRegistrationsByUser = async (userId) => {
    // In a real app, this would query the database
    // For now, returning mock registrations for the student
    return [
        {
            id: 'reg_abc123',
            userId: userId,
            workshopId: 'ws_001',
            status: 'registered',
            qrCodeData: generateQrData('reg_abc123'),
            createdAt: '2026-05-01T10:00:00Z'
        },
        {
            id: 'reg_def456',
            userId: userId,
            workshopId: 'ws_002',
            status: 'success',
            qrCodeData: generateQrData('reg_def456'),
            createdAt: '2026-05-02T11:00:00Z'
        }
    ];
};
