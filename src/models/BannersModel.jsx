import { apiService } from '../services/apiService';

const fetchBanners = async () => {
    try {
        const restId = localStorage.getItem("restaurantId");
        const resp = await apiService.fetchBanners(restId);
        const data = resp.data;
        return data.map((banner) => ({
            id: banner.id,
            title: banner.title,
            cta_text: banner.cta,
            image_url: banner.imageUrl,
            type: banner.type,
            type_data: banner.typeData,
            ad_url: "http/:ahdshfoae/ahhgaeffh/adgga%ag%hsg%",
        }));
    } catch (error) {
        console.error("Error fetching banners:", error);
        return []; // Return empty array to prevent crashes
    }
};

// Export a stable reference to the function
export const getBanners = fetchBanners;

export const getBannerById = async (id) => {
    try {
        const restId = localStorage.getItem("restaurantId");
        const resp = await apiService.fetchBanners(restId);
        const banners = resp.data;
        console.log("Banners", banners);
        const banner = banners.find((b) => b.id == id);
        if (!banner) return null;

        return {
            id: banner.id,
            title: banner.title,
            cta_text: banner.cta,
            image_url: banner.imageUrl,
            type: banner.type,
            type_data: banner.typeData,
            duration: {
                from: banner.durationFrom,
                to: banner.durationTo,
            },
            ad_url: "http://ahdshfoae/ahhgaeffh/adgga%ag%hsg%", // Replace with dynamic value if needed
        };
    } catch (error) {
        console.error("Error fetching banner by ID:", error);
        return null;
    }
};


export const createBanner = async (banner) => {
    try {
        if (!banner) {
            throw new Error("Banner data is required");
        }
        const restId = localStorage.getItem("restaurantId");
        const payload = {
            restaurant_id: restId,
            ...banner,
        }
        const resp = await apiService.createBanner(payload);
        return resp;
    } catch (error) {
        console.error("Error creating banner:", error);
        return null; // Return null to indicate failure
    }
};

export const updateBanner = async (banner) => {
    try {
        if (!banner || !banner.id) {
            throw new Error("Valid banner data with an ID is required");
        }
        const restId = localStorage.getItem("restaurantId");
        const payload = {
            restaurant_id: restId,
            ...banner,
        }
        console.log("Payload", payload);
        const resp = await apiService.updateBanner(payload);
        if (!resp.status){
            throw new Error("Failed to update banner");
        }
        return resp;
    } catch (error) {
        console.error("Error updating banner:", error);
        throw error;
    }
}

export const deleteBanner = async (bannerId) => {
    try {
        if (!bannerId) {
            throw new Error("Banner ID is required");
        }
        const restId = localStorage.getItem("restaurantId");
        const payload = {
            restaurant_id: restId,
            id: bannerId,
        }
        const resp = await apiService.deleteBanner(payload);
        return resp;
    } catch (error) {
        console.error("Error deleting banner:", error);
        throw error;
    }
}