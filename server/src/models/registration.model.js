import db from './db.js';

export const RegistrationModel = {
    async findAll() {
        return db('registrations').select('*');
    },

    async findById(id) {
        return db('registrations').where({ id }).first();
    },

    async findByUserId(userId) {
        return db('registrations').where({ user_id: userId });
    },

    async findByWorkshopId(workshopId) {
        return db('registrations').where({ workshop_id: workshopId });
    },

    async findByUserAndWorkshop(userId, workshopId) {
        return db('registrations').where({ user_id: userId, workshop_id: workshopId }).first();
    },

    async create(data) {
        const [registration] = await db('registrations').insert(data).returning('*');
        return registration;
    },

    async update(id, data) {
        const [registration] = await db('registrations')
            .where({ id })
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*');
        return registration;
    },

    async updateStatus(id, status) {
        const [registration] = await db('registrations')
            .where({ id })
            .update({ status, updated_at: db.fn.now() })
            .returning('*');
        return registration;
    }
};
