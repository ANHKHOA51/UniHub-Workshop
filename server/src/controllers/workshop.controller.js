import * as workshopService from '../services/workshop.service.js';

export const listWorkshops = async (req, res) => {
    try {
        const workshops = await workshopService.getAllWorkshops();
        res.status(200).json(workshops);
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message || 'Failed to fetch workshops'
        });
    }
};

export const getWorkshop = async (req, res) => {
    try {
        const { id } = req.params;
        const workshop = await workshopService.getWorkshopById(id);
        res.status(200).json(workshop);
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message || 'Failed to fetch workshop details'
        });
    }
};

export const updateWorkshop = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedWorkshop = await workshopService.updateWorkshop(id, req.body);
        res.status(200).json({
            message: 'Workshop updated successfully',
            workshop: updatedWorkshop
        });
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message || 'Failed to update workshop'
        });
    }
};

export const createWorkshop = async (req, res) => {
    try {
        const workshopData = req.body;
        const pdfFile = req.files?.pdf?.[0];
        const floorPlanFile = req.files?.floor_plan?.[0];

        const newWorkshop = await workshopService.createWorkshop(workshopData, pdfFile, floorPlanFile);

        res.status(201).json({
            message: 'Workshop created successfully',
            workshop: newWorkshop
        });
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message || 'Failed to create workshop'
        });
    }
};

export const deleteWorkshop = async (req, res) => {
    try {
        const { id } = req.params;
        await workshopService.deleteWorkshop(id);
        res.status(200).json({
            message: 'Workshop deleted successfully'
        });
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message || 'Failed to delete workshop'
        });
    }
};

export const listStudentWorkshops = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const workshops = await workshopService.getWorkshopsByUser(userId);
        res.status(200).json(workshops);
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message || 'Failed to fetch your workshops'
        });
    }
};

export const listWorkshopRegistrations = async (req, res) => {
    try {
        const { id } = req.params;
        const registrations = await workshopService.getWorkshopRegistrations(id);
        res.status(200).json(registrations);
    } catch (error) {
        res.status(error.status || 500).json({
            message: error.message || 'Failed to fetch registrations'
        });
    }
};
