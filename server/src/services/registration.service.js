import { RegistrationModel } from '../models/registration.model.js';
import { WorkshopModel } from '../models/workshop.model.js';
import { PaymentModel } from '../models/payment.model.js';
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
    const workshop = await WorkshopModel.findById(workshopId);
    if (!workshop) {
        const error = new Error('Workshop not found');
        error.status = 404;
        throw error;
    }

    const existing = await RegistrationModel.findByUserAndWorkshop(userId, workshopId);
    if (existing && existing.status !== 'canceled') {
        const error = new Error('You have already registered for this workshop');
        error.status = 400;
        throw error;
    }

    const seatKey = `unihub:workshop:${workshopId}:participants`;
    const maxSeats = workshop.capacity;

    const result = await redisClient.reserveSeat(seatKey, maxSeats.toString());

    if (result === 0) {
        const error = new Error('Workshop is fully booked');
        error.status = 400;
        throw error;
    }

    let registration = await RegistrationModel.create({
        user_id: userId,
        workshop_id: workshopId,
        status: 'pending'
    });

    const qrCodeData = generateQrData(registration.id.toString());

    registration = await RegistrationModel.update(registration.id, {
        qr_code: qrCodeData,
        status: 'success'
    });

    notificationService.notifyAll({
        user: { userId },
        content: `Đăng ký thành công workshop: ${workshop.title}`
    });

    return registration;
};

export const createPaymentRegistration = async (userId, workshopId, idempotencyKey) => {
    const workshop = await WorkshopModel.findById(workshopId);
    if (!workshop) {
        const error = new Error('Workshop not found');
        error.status = 404;
        throw error;
    }

    const existing = await RegistrationModel.findByUserAndWorkshop(userId, workshopId);
    if (existing && existing.status !== 'canceled') {
        const error = new Error('You have already registered for this workshop');
        error.status = 400;
        throw error;
    }

    const seatKey = `unihub:workshop:${workshopId}:participants`;
    const maxSeats = workshop.capacity;

    const result = await redisClient.reserveSeat(seatKey, maxSeats.toString());

    if (result === 0) {
        const error = new Error('Workshop is fully booked');
        error.status = 400;
        throw error;
    }

    const registration = await RegistrationModel.create({
        user_id: userId,
        workshop_id: workshopId,
        status: 'processing'
    });

    const id = registration.id.toString();
    let payUrl;

    try {
        const extraData = Buffer.from(JSON.stringify({ userId, workshopId, idempotencyKey })).toString('base64');
        const response = await momoBreaker.fire(id, workshop.price, extraData);
        payUrl = response.payUrl;

        await PaymentModel.create({
            registration_id: id,
            amount: workshop.price,
            status: 'pending'
        });
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
        const seatKey = `unihub:workshop:${workshopId}:participants`;
        await redisClient.decr(seatKey);
    }
    if (registrationId) {
        await RegistrationModel.updateStatus(registrationId, 'canceled');

        const payments = await PaymentModel.findByRegistrationId(registrationId);
        for (const payment of payments) {
            if (payment.status === 'pending') {
                await PaymentModel.updateStatus(payment.id, 'failed');
            }
        }
    }
    return true;
};

export const handlePaymentWebhook = async (payload) => {
    const { orderId, resultCode, extraData } = payload;
    let workshopId = 'mock_workshop_id';
    let idempotencyKey = null;
    let userId = null;

    if (extraData) {
        try {
            const decoded = JSON.parse(Buffer.from(extraData, 'base64').toString('utf-8'));
            workshopId = decoded.workshopId || workshopId;
            idempotencyKey = decoded.idempotencyKey;
            userId = decoded.userId;
        } catch (e) {
            console.error('Failed to parse extraData', e.message);
        }
    }

    if (resultCode === 0) {
        const qrCodeData = generateQrData(orderId.toString());

        await RegistrationModel.update(orderId, {
            qr_code: qrCodeData,
            status: 'success'
        });

        const payments = await PaymentModel.findByRegistrationId(orderId);
        for (const payment of payments) {
            if (payment.status === 'pending') {
                await PaymentModel.updateStatus(payment.id, 'finished');
            }
        }

        if (idempotencyKey) {
            const redisKey = `unihub:idempotency:payment:${idempotencyKey}`;
            const finalResponse = {
                message: 'Registration and payment successful',
                data: {
                    registrationId: orderId,
                    status: 'success',
                    qrCodeData
                }
            };
            const successData = {
                status: 'success',
                statusCode: 200,
                response: finalResponse
            };
            await redisClient.set(redisKey, JSON.stringify(successData), {
                EX: 86400
            });
        }

        if (userId) {
            notificationService.notifyAll({
                user: { userId },
                content: `Thanh toán thành công cho workshop: ${workshopId}`
            });
        }

        return {
            id: orderId,
            status: 'success',
            qrCodeData,
            message: 'Payment completed successfully'
        };
    } else {
        await cancelRegistration(orderId, workshopId);
        return {
            id: orderId,
            status: 'canceled',
            message: 'Payment failed or canceled'
        };
    }
};

