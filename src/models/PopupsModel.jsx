import { apiService } from '../services/apiService';

export const getPopupAds = async () => {
    try {
        const restId = localStorage.getItem("restaurantId");
        const response = await apiService.fetchPopupAds(restId);

        if (!response.status) {
            throw new Error("Error fetching popup ads");
        }

        const popupAds = response.data
        console.log("Popup Ads:", popupAds);

        return popupAds.map((ad) => ({
            id: ad.id,
            title: ad.title,
            cta_text: ad.cta,
            image_url: ad.imageUrl,
            type: ad.type,
            type_data: ad.typeData,
        }));
    } catch (error) {
        console.error("Error fetching popup ads:", error);
        return []; // Return an empty array to prevent crashes
    }
};

export const getPopupAdById = async (id) => {
    try {
        const restId = localStorage.getItem("restaurantId");
        const response = await apiService.fetchPopupAds(restId);
        const popupAds = response.data;

        const ad = popupAds.find((ad) => ad.id == id);
        if (!ad) return null;

        return {
            id: ad.id,
            title: ad.title,
            cta_text: ad.cta,
            image_url: ad.imageUrl,
            type: ad.type,
            type_data: ad.typeData,
            duration: {
                from: ad.durationFrom,
                to: ad.durationTo,
            },
            ad_url: "https://default-ad-url.com",
        };
    } catch (error) {
        console.error("Error fetching popup ad by ID:", error);
        return null;        
    }
}

export const createPopupAd = async (banner) => {
    try {
        const restId = localStorage.getItem("restaurantId");
        const payload = {
            restaurant_id: restId,
            ...banner,
        }
        const response = await apiService.createPopupAd(payload);

        if (!response.status) {
            throw new Error("Error creating popup ad");
        }

        return response;
    } catch (error) {
        console.error("Error creating popup ad:", error);
        throw error;
    }
}

export const updatePopupAd = async (banner) => {
    try {
        if (!banner || !banner.id) {
            throw new Error("Valid banner data with an ID is required");
        }
        const restId = localStorage.getItem("restaurantId");
        const payload = {
            restaurant_id: restId,
            id: banner.id,
            ...banner,
        }
        const response = await apiService.updatePopupAd(payload);

        if (!response.status) {
            throw new Error("Error updating popup ad");
        }

        return response;
    } catch (error) {
        console.error("Error updating popup ad:", error);
        throw error;
    }
}

export const deletePopupAd = async (bannerId) => {
    try {
        const restId = localStorage.getItem("restaurantId");
        const payload = {
            restaurant_id: restId,
            id: bannerId,
        }
        const response = await apiService.deletePopupAd(payload);
        if (!response.status) {
            throw new Error("Error deleting popup ad");
        }
        return response;
    } catch (error) {
        console.error("Error deleting popup ad:", error);
        throw error;
    }
}