import { apiService } from '../services/apiService';

export const getSettings = async () => {
    try {
        const restId = localStorage.getItem('restaurantId');
        const res = await apiService.getRestaurant(restId);
        if (!res.status) {
            throw new Error('Error fetching settings: ' + (res.message || 'Unknown error'));
        }
        const data = res.data;
        const settings = {
            id : data.id,
            name : data.name,
            logo : data.logo,
            type: data.type,
            tags: data.tagsList,
            outlets: data.outletList,
            stewardList: data.stewardList,
        }
        return settings;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
}

export const createSection = async (section) => {
    try {
        if (!section) {
            throw new Error('Section object is empty');
        }
        //simulate API call
        const res = await new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, message: 'Section created successfully', data: section }), 1000);
        });
        if (!res.status) {
            throw new Error('Error creating section: ' + (res.message || 'Unknown error'));
        }
        return res;
    } catch (error) {
        console.error('Error creating section:', error);
        throw error;
    }
}


export const updateSettings = async (settings) => {
    try {
        const restId = localStorage.getItem('restaurantId');
        const response = await apiService.updateOutlet(restId, settings);
        if (!response.status) {
            throw new Error('Error updating settings: ' + (response.message || 'Internal server error'));
        }
        return response.data;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
}