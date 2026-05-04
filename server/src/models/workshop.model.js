import db from './db.js';

export const WorkshopModel = {
    async findAll() {
        return db('workshops').select('*');
    },

    async findById(id) {
        return db('workshops').where({ id }).first();
    },

    async create(data) {
        const [workshop] = await db('workshops').insert(data).returning('*');
        return workshop;
    },

    async update(id, data) {
        const [workshop] = await db('workshops')
            .where({ id })
            .update(data)
            .returning('*');
        return workshop;
    },

    async delete(id) {
        return db('workshops').where({ id }).del();
    },

    async findByUserId(userId) {
        return db('workshops')
            .join('registrations', 'workshops.id', 'registrations.workshop_id')
            .where('registrations.user_id', userId)
            .select('workshops.*');
    }
};
