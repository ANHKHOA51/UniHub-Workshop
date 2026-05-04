import db from './db.js';

export const PaymentModel = {
    async findById(id) {
        return db('payments').where({ id }).first();
    },

    async findByRegistrationId(registrationId) {
        return db('payments').where({ registration_id: registrationId });
    },

    async create(data) {
        const [payment] = await db('payments').insert(data).returning('*');
        return payment;
    },

    async update(id, data) {
        const [payment] = await db('payments')
            .where({ id })
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*');
        return payment;
    },

    async updateStatus(id, status) {
        const [payment] = await db('payments')
            .where({ id })
            .update({ status, updated_at: db.fn.now() })
            .returning('*');
        return payment;
    }
};
