import { apiService } from "../services/apiService";

export const createSection = async (data) => {
    try {
        const { outletId, sectionName, tablesList } = data;
        const restId = localStorage.getItem("restaurantId");
        const payload = {
            restaurant_id: restId,
            outletId,
            sectionName,
            tablesList,
        };
        const response = await apiService.assignSection(payload);
        if (response.status) {
            return response.data;
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error("Error creating section: ", error.message);
        throw error;
    }
}

export const deleteSection = async (data) => {
    try {
        const restaurant_id = localStorage.getItem("restaurantId");
        const { outletId, sectionName } = data;
        const payload = {
            restaurant_id,
            outletId,
            sectionName,
        };
        const response = await apiService.deleteSection(payload);
        if (response.status) {
            return response;
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        console.error("Error deleting section: ", error.message);
        throw error;
    }
}