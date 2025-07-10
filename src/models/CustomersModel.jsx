import { apiService } from "../services/apiService";

export const fetchCustomers = async (fromDate, toDate) => {
    try {
        const restId = localStorage.getItem('restaurantId');
        const payload = {
            restaurantId: restId,
            fromDate: fromDate,
            toDate: toDate
        }
        const response = await apiService.getCustomers(payload);
        if (!response.status) {
            throw new Error('Failed to fetch customers: ' + response.message);
        }
        return response
    } catch (error) {
        console.error('Failed to fetch customers:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}