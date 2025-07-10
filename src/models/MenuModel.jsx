import { apiService } from "../services/apiService";

export const syncRestaurant = async () => {
    try {
        const restaurant_id = await localStorage.getItem('restaurantId');
        const type = localStorage.getItem('menuType');
        const payload ={
            restaurant_id: restaurant_id,
            type: type,
        }
        const response = await apiService.syncRestaurant(payload);
        if (!response.status) {
            throw new Error(response.message);
        }
        return true;
    } catch (error) {
        console.error("Error syncing restaurant:", error);
        throw error;
    }
}

export const getMenu = async () => {
    try {
        const restId = localStorage.getItem('restaurantId');
        const response = await apiService.fetchMenu(restId);
        if (!response.status) {
            throw new Error(response.message);
        }
        const menuData = response.data;
        return menuData;
    } catch (error) {
        console.error("Error fetching menu:", error);
        throw error;
    }
}

export const getAddons = async () => {
    try {
        const restId = localStorage.getItem('restaurantId');
        const response = await apiService.fetchAddons(restId);
        if (!response.status) {
            throw new Error(response.message);
        }
        const addons = response.data;
        return addons
    } catch (error) {
        console.error("Error fetching addons:", error.message);
        throw error;
    }
}

export const getAddonGroups = async () => {
    try {
        const restId = localStorage.getItem('restaurantId');
        const response = await apiService.fetchAddonGroups(restId);
        if (!response.status) {
            throw new Error(response.message);
        }
        const addonGroups = response.data;
        return addonGroups;
    } catch (error) {
        console.error("Error fetching addon groups:", error);
        throw error;
    }
}

export const createAddonGroup = async (data) => {
    try {
        const restId = localStorage.getItem('restaurantId');
        const response = await apiService.createAddonGroup(data, restId);
        if (!response.status) {
            console.log("response: ", response);
            throw new Error(response.data.message || response.message);
        }
        return response;
    } catch (error) {
        // If it's our custom error from the response check above, re-throw it
        if (error.message && !error.response) {
            throw error;
        }
        // Otherwise, handle axios errors
        throw new Error(error.response?.data?.message || error.message || "unexpected error occurred while creating addon group");
    }
}

export const updateAddonGroup = async (groupId, data) => {
    try {
        const response = await apiService.updateAddonGroup(data, groupId);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error updating addon group:", error);
        throw error;
    }
}

export const deleteAddonGroup = async (groupId) => {
    try {
        const response = await apiService.deleteAddonGroup(groupId);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error deleting addon group:", error);
        throw error;
    }
}

export const getCategories = async (data) => {
    try {
      const categories = data.categories;
      return categories.map((category, index) => ({
        ...category,
        priority: category.priority === 0 ? index : category.priority, // Use 'index' as the fallback value
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  };
  

export const getAllDishes = async () => {
    try {
        const restId = localStorage.getItem('restaurantId');
        const response = await apiService.fetchMenu(restId);
        if (!response.status) {
            throw new Error(response.message);
        }
        const dishes = response.data.dishes;
        const updatedDishes = dishes.map((dish, index) => ({
            ...dish,
            priority: dish.priority === 0 ? index : dish.priority, // Use 'index' as the fallback value
        }));
        console.log("Updated Dishes: ", updatedDishes);
        //add status to dishes by checking if any outlet is active
        return updatedDishes;
    } catch (error) {
        console.error("Error fetching all dishes:", error);
        throw error;   
    }
}

export const getDishesByCategory = async (dishes, categoryId) => {
    try {
        const data = dishes.filter(dish => dish.categoryId === categoryId);
        return data;
    } catch (error) {
        console.error("Error fetching dishes by category:", error);
        throw error;
    }
}

export const getDishById = async (dishes, dishId, outlets) => {
    try {
        const dish = dishes.find(dish => dish.id === dishId);
        
        // Map outlet name from outlets to existing dish outlets
        const outletsWithName = dish.outlets.map(dishOutlet => {
            const outletInfo = outlets.find(outlet => outlet.code === dishOutlet.outletCode);
            return {
                ...dishOutlet,
                name: outletInfo ? outletInfo.name : 'Unknown Outlet'
            };
        });
        
        return { 
            ...dish, 
            outlets: outletsWithName
        };
    } catch (error) {
        console.error("Error fetching dish by ID:", error);
        throw error;
    }
}

export const uploadImages = async (images) => {
    try {
        // Simulate an API call to upload images
        const response = await new Promise((resolve) => {
            setTimeout(() => {
                resolve({ status: true, message:"Images uploaded succesfully", data: images });
            }, 1000);
        });
        if (!response.status) {
            throw new Error(response.message);
        }
        const imageUrls = response.data.map((image) => (URL.createObjectURL(image)));
        return imageUrls;
    } catch (error) {
        console.error("Error uploading images:", error);
        throw error;
    }
}

export const updateDish = async (updatedDish, dishId) => {
    try {
        // Simulate an API call to update the dish
        const response = await apiService.updateDish(updatedDish, dishId);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error updating dish:", error);
        throw error;
    }
}

export const createMenuGroup = async (data) => {
    try {
        const restId = localStorage.getItem('restaurantId');
        const response = await apiService.createMenuGroup(data, restId);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response.data;
    } catch (error) {
        console.error("Error creating menu group:", error);
        throw error;
    }
}

export const updateMenuGroup = async (data) => {
    try {
        const menuGroupId = data.id;
        const response = await apiService.updateMenuGroup(data, menuGroupId);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error updating menu groups:", error);
        throw error;
    }
}

export const deleteMenuGroup = async (groupId) => {
    try {
        // Simulate an API call to delete the menu group
        const response = await apiService.deleteMenuGroup(groupId);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error deleting menu group:", error);
        throw error;
    }
}

export const fetchUniversalUpsells = async () => {
    try {
        //handle fetching universal upsells
        const restId = localStorage.getItem('restaurantId');
        const response = await apiService.fetchUpsells(restId);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error fetching universal upsells:", error);
        throw error;
    }
}

export const setUniversalUpsells = async (upsells) => {
    try {
        const restId = localStorage.getItem("restaurantId");
        const payload = {
            upsells: upsells,
        }
        const response = await apiService.setUpsells(payload, restId);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error setting universal upsells:", error);
        throw error;
    }
}

export const reorderCategories = async (data) => {
    try {
        const response = await await apiService.reorderCategories(data);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error reordering categories:", error);
        throw error;
    }
}

export const reorderDishes = async (data) => {
    try {
        const response = await apiService.reorderDishes(data);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error reordering categories:", error);
        throw error;
    }
}

export const reorderMenuGroups = async (data) => {
    try {
        // Simulate an API call to reorder menu groups
        console.log("reorder: " + data)
        const response = await apiService.reorderMenuGroups(data);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error reordering menu groups:", error);
        throw error;
    }
}

export const setCategoryStatus = async (categoryId, status) => {
    try {
        // Simulate an API call to set category status
        const payload = {
            category_id: categoryId,
            in_stock: status,
        };
        const response = await apiService.updateCategoryStatus(payload);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error setting category status:", error);
        throw error;
    }
}

export const setDishStatus = async (dishId, status) => {
    try {
        const payload = {
            dish_id: dishId,
            in_stock: status,
        };
        const response = await apiService.updateDishStatus(payload);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error setting dish status:", error);
        throw error;
    }
}

export const updateDishesType = async (type, dishes) => {
    try {
        const payload = {
            type: type,
            dishes: dishes,
        };
        const response = await apiService.updateType(payload);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error updating dishes type:", error);
        throw error;
    }
}

export const updateMenuStock = async (menuId, inStock) => {
    try {
        const payload = {
            menuId,
            inStock
        };
        const response = await apiService.updateMenuStock(payload);
        if (!response.status) {
            throw new Error(response.message);
        }
        return response;
    } catch (error) {
        console.error("Error updating menu stock:", error);
        throw error;
    }
}