import { apiService } from '../services/apiService';
import { uploadFiles } from '../utils/fileUploader';
import { v4 as uuidv4 } from 'uuid';

export const fetchAppearance = async () => {
    try {
        const restaurantId = localStorage.getItem('restaurantId');
        const response = await apiService.fetchAppearance(restaurantId);
        const data = response.data;
        const links = data.custom_buttons === null ? [] : data.custom_buttons;
        const formatedData = {
            primaryColor: data.primary_color,
            theme: data.theme,
            color: {
                color: data.primary_color,
                colorType: 'hex',
            },
            fonts: {
                heading: data.heading_font,
                body: data.base_font,
            },
            homeScreenImageUrl: data.homescreen_image,
            links: links,
        };
        console.log('Formatted appearance data:', formatedData);
        return formatedData;
    } catch (error) {
        console.error('Error fetching appearance:', error);
        throw new Error(error);
    }
}

export const updateAppearance = async (appearance) => {
    try {
        console.log("Updating appearance data:", appearance);
        if (!appearance) {
            throw new Error('Appearance data is required');
        }
        const restaurantId = localStorage.getItem('restaurantId');
        console.log("Updating appearance data:", appearance);
        const response = await apiService.updateAppearance(appearance, restaurantId);
        return response;
    } catch (error) {
        console.error('Error updating appearance data:', error);
        // just throw the original error
        throw error;
    }
}