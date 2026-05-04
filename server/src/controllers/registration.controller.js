import * as registrationService from '../services/registration.service.js';

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
    try {
        const payload = req.body;
        
        // Optionally verify signature here...

        const result = await registrationService.handlePaymentWebhook(payload);
        
        // Acknowledge webhook success to MoMo
        return res.status(200).json({ 
            message: 'Webhook processed successfully',
            data: result
        });
    } catch (error) {
        console.error('Webhook processing error:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

