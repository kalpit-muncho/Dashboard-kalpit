import { apiClient, fetchWithRetry } from "../muncho_core/apiService";
import { apiBase } from "../utils/constants";

// Initialize base URL
apiClient.defaults.baseURL = apiBase;

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const apiService = {
  login: (email, password) =>
    fetchWithRetry(`/auth/staff-login`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: { email, password },
    }).then((response) => response.data),

  sendPasswordResetEmail: (email) =>
    fetchWithRetry(`/auth/forgot-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: { email },
    }).then((response) => response.data),

  validatePasswordResetToken: (token) =>
    fetchWithRetry(`/auth/reset-password/validate`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: { token },
    }).then((response) => response.data),

  resetPassword: (token, newPassword) =>
    fetchWithRetry(`/auth/reset-password`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: { token, newPassword },
    }).then((response) => response.data),

  //staff
  getStaffData: () =>
    fetchWithRetry(`/staff`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((response) => response.data),

  getStaffList: (restaurantId) =>
    fetchWithRetry(`/staff?restaurant_id=${restaurantId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((response) => response.data),

  updateStaffStatus: (id, status) =>
    fetchWithRetry(`/staff/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      data: { status },
    }).then((response) => response.data),

  deleteStaff: (id) =>
    fetchWithRetry(`/staff/delete-staff/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((response) => response.data),

  updateStaff: (staff) =>
    fetchWithRetry(`/staff/${staff.id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      data: {
        name: staff.name,
        stwCode: staff.stwCode,
        phone: staff.mobile,
        role: staff.role,
        password: staff.password,
        permissions: staff.permissions,
        assignedTables: staff.assignedTables,
        status: staff.status,
      },
    }).then((response) => response.data),

  createStaff: (staff) =>
    fetchWithRetry(`/staff/create-staff`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: {
        restaurant_id: staff.restaurant_id,
        name: staff.name,
        stw_code: staff.stwCode,
        phone: staff.mobile,
        role: staff.role,
        password: staff.password,
        permissions: staff.permissions,
        assigned_tables: staff.assignedTables,
        status: false,
      },
    }).then((response) => response.data),

  //restaurant
  getRestaurant: (restaurant_id) =>
    fetchWithRetry(`/restaurant/${restaurant_id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((response) => response.data),

  syncRestaurant: (payload) =>
    fetchWithRetry(`/admin/sync-restaurant`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  updateMenu: (outlet_id) =>
    fetchWithRetry(`/outlet/updateMenu/${outlet_id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((response) => response.data),

  //menu
  fetchMenu: (restaurantId) =>
    fetchWithRetry(`/restaurant/menu/${restaurantId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((response) => response.data),
  
  //addons
  fetchAddons: (restaurantId) =>
    fetchWithRetry(`/restaurant/addons/${restaurantId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((response) => response.data),
  
  fetchAddonGroups: (restaurantId) =>
    fetchWithRetry(`/menu/addon-groups?restaurantId=${restaurantId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((response) => response.data),

  createAddonGroup: (payload, restaurantId) =>
    fetchWithRetry(`menu/addon-groups?restaurantId=${restaurantId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),
  
  updateAddonGroup: (payload, groupId) =>
    fetchWithRetry(`/menu/addon-groups/${groupId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  deleteAddonGroup: (groupId) =>
    fetchWithRetry(`/menu/addon-groups/${groupId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((response) => response.data),
  
  //menu groups
  createMenuGroup: (payload, restaurantId) =>
    fetchWithRetry(
      `/menu/menu-groups/?restaurantId=${restaurantId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        data: payload,
      }
    ).then((response) => response.data),

  deleteMenuGroup: (groupId) =>
    fetchWithRetry(`/menu/menu-groups/${groupId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    }).then((response) => response.data),

  updateMenuGroup: (payload, menuGroupId) =>
    fetchWithRetry(`/menu/menu-groups/${menuGroupId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  updateMenuStock: (payload) =>
    fetchWithRetry(`/menu/menu-groups/update-stock`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  reorderMenuGroups: (groups) =>
    fetchWithRetry(`/menu/menu-groups`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      data: groups,
    }).then((response) => response.data),

  //dishes
  updateDish: (payload, dishId) =>
    fetchWithRetry(`/menu/dish/${dishId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  updateDishStatus: (payload) =>
    fetchWithRetry(`/menu/dish/status`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  updateType: (payload) =>
    fetchWithRetry(`/menu/dish/type`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  reorderDishes: (payload) =>
    fetchWithRetry(`/menu/dish/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  //category
  reorderCategories: (payload) =>
    fetchWithRetry(`/menu/category/reorder`, {
      method: "PUT",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  updateCategoryStatus: (payload) =>
    fetchWithRetry(`/menu/category/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  fetchAppearance: (restaurantId) =>
    fetchWithRetry(`/appearance?restaurantId=${restaurantId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((response) => response.data),

  updateAppearance: (payload, restaurantId) =>
    fetchWithRetry(`/appearance?restaurantId=${restaurantId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  //Upsells
  fetchUpsells: (restaurantId) =>
    fetchWithRetry(`/upsells/${restaurantId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((response) => response.data),

  setUpsells: (payload, restaurantId) =>
    fetchWithRetry(`/upsells/${restaurantId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  //banners
  fetchBanners: (restaurantId) =>
    fetchWithRetry(
      `/banner/getBanners?restaurant_id=${restaurantId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    ).then((response) => response.data),

  createBanner: (payload) =>
    fetchWithRetry(`/banner/createBanners`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  updateBanner: (payload) =>
    fetchWithRetry(`/banner/createBanners`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  deleteBanner: (payload) =>
    fetchWithRetry(`/banner/deleteBanners`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  //popup ads
  fetchPopupAds: (restaurantId) =>
    fetchWithRetry(
      `/popAds/listPopAds?restaurant_id=${restaurantId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    ).then((response) => response.data),

  createPopupAd: (payload) =>
    fetchWithRetry(`/popAds/createPopAds`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  updatePopupAd: (payload) =>
    fetchWithRetry(`/popAds/createPopAds`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  deletePopupAd: (payload) =>
    fetchWithRetry(`/popAds/deletePopAds`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  //reviews
  fetchReviews: (restaurantId) =>
    fetchWithRetry(`/reviews?restaurantId=${restaurantId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    }).then((response) => response.data),

  //Upload
  uploadFile: async (file) => {
    try {
      const response = await apiClient.post(`/file/upload`, file, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  },

  //update outlet
  updateOutlet: (restId, payload) =>
    fetchWithRetry(`/outlet/update?restaurant_id=${restId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  //tables
  assignSection: (payload) =>
    fetchWithRetry(`/tables/assignSection`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  deleteSection: (payload) =>
    fetchWithRetry(`/tables/deleteSection`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),

  //customers
  getCustomers: (payload) =>
    fetchWithRetry(`/orders/get-customers`, {
      method: "POST",
      headers: getAuthHeaders(),
      data: payload,
    }).then((response) => response.data),
};

export default apiService;