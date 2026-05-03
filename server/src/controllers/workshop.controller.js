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
