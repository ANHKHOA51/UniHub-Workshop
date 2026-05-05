import { RegistrationModel } from '../models/registration.model.js';
import { WorkshopModel } from '../models/workshop.model.js';
import { PaymentModel } from '../models/payment.model.js';
import { NotificationService } from './notification.service.js';
import { EmailNotificationMethod } from './email.service.js';
import { generateQrData } from '../utils/qr.helper.js';
import redisClient from '../utils/redis.client.js';
import CircuitBreaker from 'opossum';
import crypto from 'crypto';
import axios from 'axios';

const notificationService = new NotificationService();
notificationService.subscribe(new EmailNotificationMethod());

const createMoMoRequest = async (registrationId, amount, extraData = '', workshopId) => {
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';

    const timestamp = Date.now();
    const orderId = `${registrationId}-${timestamp}`;
    const requestId = `${partnerCode}-${timestamp}`;

    const ipnUrl = `${process.env.APP_URL}/api/registrations/webhook/momo`;
    const redirectUrl = `${process.env.MOMO_REDIRECT_URL}`;

    const requestType = 'captureWallet';
    const lang = 'vi';
    const amountStr = String(Math.round(Number(amount)));
    const orderInfo = `Payment for workshop registration ${registrationId}`;

    const rawSignature = `accessKey=${accessKey}&amount=${amountStr}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = {
        partnerCode,
        partnerName: 'UniHub Workshop',
        partnerUserId: registrationId,
        accessKey,
        requestId,
        amount: amountStr,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        requestType,
        extraData,
        signature,
        lang
    };

    try {
        const response = await axios.post(endpoint, requestBody, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 3000
        });

        if (response.data.resultCode === 0) {
            return {
                payUrl: response.data.payUrl,
                orderId,
                timestamp
            };
        } else {
            const resultCode = response.data.resultCode ?? response.data.errorCode ?? 'unknown';
            throw new Error(`MoMo error (${resultCode}): ${response.data.message}`);
        }
    } catch (error) {
        if (error.code === 'ECONNABORTED') throw new Error('MoMo connection timeout');
        throw error;
    }
};

const momoBreaker = new CircuitBreaker(createMoMoRequest, {
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
        const response = await momoBreaker.fire(id, workshop.price, extraData, workshopId);
        payUrl = response.payUrl;

        await PaymentModel.create({
            registration_id: id,
            amount: workshop.price,
            status: 'pending'
        });
    } catch (err) {
        console.log(err);
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
        await RegistrationModel.delete(registrationId);

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

    const registrationId = orderId.split('-')[0];

    if (resultCode === 0) {
        const qrCodeData = generateQrData(registrationId.toString());

        await RegistrationModel.update(registrationId, {
            qr_code: qrCodeData,
            status: 'success'
        });

        const payments = await PaymentModel.findByRegistrationId(registrationId);
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
                    registrationId: registrationId,
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
            id: registrationId,
            status: 'success',
            qrCodeData,
            message: 'Payment completed successfully'
        };
    } else {
        await cancelRegistration(registrationId, workshopId);
        return {
            id: registrationId,
            status: 'canceled',
            message: 'Payment failed or canceled'
        };
    }
};

