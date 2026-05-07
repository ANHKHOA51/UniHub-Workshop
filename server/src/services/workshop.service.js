import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { WorkshopModel } from '../models/workshop.model.js';
import { RegistrationModel } from '../models/registration.model.js';
import { addAISummaryJob } from '../queues/ai_summary.queue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT_DIR = path.join(__dirname, '..', '..');
const STATIC_DOCS_DIR = path.join(SERVER_ROOT_DIR, 'static', 'docs');
const STATIC_IMAGES_DIR = path.join(SERVER_ROOT_DIR, 'static', 'images');

export const getAllWorkshops = async () => {
    return await WorkshopModel.findAll();
};

export const getWorkshopById = async (id) => {
    const workshop = await WorkshopModel.findById(id);
    if (!workshop) {
        const error = new Error('Workshop not found');
        error.status = 404;
        throw error;
    }
    return workshop;
};

export const updateWorkshop = async (id, data) => {
    const updatedWorkshop = await WorkshopModel.update(id, data);
    if (!updatedWorkshop) {
        const error = new Error('Workshop not found');
        error.status = 404;
        throw error;
    }
    return updatedWorkshop;
};

export const createWorkshop = async (workshopData, pdfFile, floorPlanFile) => {
    const createdWorkshop = await WorkshopModel.create(workshopData);
    const workshopId = createdWorkshop.id;

    try {
        await fs.mkdir(STATIC_DOCS_DIR, { recursive: true });
        await fs.mkdir(STATIC_IMAGES_DIR, { recursive: true });

        if (floorPlanFile) {
            const ext = path.extname(floorPlanFile.originalname);
            const timestamp = Date.now();
            const floorPlanFileName = `${workshopId}_${timestamp}_floorplan${ext}`;
            const floorPlanPath = path.join(STATIC_IMAGES_DIR, floorPlanFileName);

            await fs.writeFile(floorPlanPath, floorPlanFile.buffer);

            const floorPlanUrl = `/images/${floorPlanFileName}`;
            await WorkshopModel.update(workshopId, { floor_plan: floorPlanUrl });
            createdWorkshop.floor_plan = floorPlanUrl;
        }

        if (pdfFile) {
            const timestamp = Date.now();
            const pdfFileName = `${workshopId}_${timestamp}.pdf`;
            const pdfPath = path.join(STATIC_DOCS_DIR, pdfFileName);

            await fs.writeFile(pdfPath, pdfFile.buffer);

            await addAISummaryJob(workshopId, {
                originalname: pdfFile.originalname,
                mimetype: pdfFile.mimetype,
                size: pdfFile.size,
                path: pdfPath
            });
        }
    } catch (fileError) {
        console.error('Error handling files for workshop creation:', fileError);
        await WorkshopModel.delete(workshopId);
        throw new Error('Failed to process files for workshop creation');
    }

    return createdWorkshop;
};

export const deleteWorkshop = async (id) => {
    const deletedCount = await WorkshopModel.delete(id);
    if (deletedCount === 0) {
        const error = new Error('Workshop not found');
        error.status = 404;
        throw error;
    }
    return deletedCount;
};

export const getWorkshopsByUser = async (userId) => {
    return await WorkshopModel.findByUserId(userId);
};

export const getWorkshopRegistrations = async (workshopId) => {
    const workshop = await WorkshopModel.findById(workshopId);
    if (!workshop) {
        throw { status: 404, message: 'Workshop not found' };
    }
    return await WorkshopModel.findRegistrationsByWorkshopId(workshopId);
};

