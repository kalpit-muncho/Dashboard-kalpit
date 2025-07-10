import axios from "axios";

const API_BASE_URL = "https://backend-template-eight.vercel.app/api";
// const API_BASE_URL = "http://localhost:5001/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Hero Section
export const fetchHero = async (userId) => {
  try {
    const response = await axiosInstance.get("/hero", { params: { userId } });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const postHero = async (data, userId) => {
  try {
    const response = await axiosInstance.post("/hero", { ...data, userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateHero = async (id, data, userId) => {
  try {
    const response = await axiosInstance.put(`/hero/${id}`, {
      ...data,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteHero = async (id, userId) => {
  try {
    const response = await axiosInstance.delete(`/hero/${id}`, {
      data: { userId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Gallery Section
export const fetchGallery = async (userId, sectionId) => {
  try {
    const response = await axiosInstance.get("/gallery", {
      params: { userId, sectionId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const postGallery = async (data, userId) => {
  try {
    const response = await axiosInstance.post("/gallery", {
      ...data,
      userId,
      sectionId: data.sectionId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateGallery = async (id, data, userId) => {
  try {
    const response = await axiosInstance.put(`/gallery/${id}`, {
      ...data,
      userId,
      sectionId: data.sectionId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteGallery = async (id, userId, sectionId) => {
  try {
    const response = await axiosInstance.delete(`/gallery/${id}`, {
      data: { userId, sectionId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Location Section
export const fetchLocations = async (userId) => {
  try {
    const response = await axiosInstance.get("/location", {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const postLocation = async (data, userId) => {
  try {
    const response = await axiosInstance.post("/location", { ...data, userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateLocation = async (id, data, userId) => {
  try {
    const response = await axiosInstance.put(`/location/${id}`, {
      ...data,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteLocation = async (id, userId) => {
  try {
    const response = await axiosInstance.delete(`/location/${id}`, {
      data: { userId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// FAQ Section
export const fetchFAQ = async (userId) => {
  try {
    const response = await axiosInstance.get("/faq", { params: { userId } });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const postFAQ = async (data, userId) => {
  try {
    const response = await axiosInstance.post("/faq", { ...data, userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateFAQ = async (id, data, userId) => {
  try {
    const response = await axiosInstance.put(`/faq/${id}`, { ...data, userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteFAQ = async (id, userId) => {
  try {
    const response = await axiosInstance.delete(`/faq/${id}`, {
      data: { userId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Add question to existing FAQ
export const addQuestionToFAQ = async (faqId, userId, question) => {
  try {
    const response = await axiosInstance.patch(`/faq/${faqId}/add-question`, {
      userId,
      question,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Nav Section
export const fetchNav = async (userId) => {
  try {
    const response = await axiosInstance.get(`/nav/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const postNav = async (data, userId) => {
  if (!userId) throw new Error("userId is required for postNav");
  try {
    const response = await axiosInstance.post("/nav", { ...data, userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateNav = async (id, data, userId) => {
  if (!userId) throw new Error("userId is required for updateNav");
  try {
    const response = await axiosInstance.put(`/nav/${id}`, { ...data, userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Footer Section
export const fetchFooter = async (userId) => {
  try {
    const response = await axiosInstance.get("/footer", { params: { userId } });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const postFooter = async (data, userId) => {
  try {
    const response = await axiosInstance.post("/footer", { ...data, userId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateFooter = async (id, data, userId) => {
  try {
    const response = await axiosInstance.put(`/footer/${id}`, {
      ...data,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteFooter = async (id, userId) => {
  try {
    const response = await axiosInstance.delete(`/footer/${id}`, {
      data: { userId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};



// Export or send sectionTabs array
export const sendSectionTabs = async (sectionTabs, userId) => {
  try {
    const response = await axiosInstance.post("/sections", {
      sectionTabs,
      userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload image to external API and return fileUrl
export const uploadImageToMuncho = async (file, path) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);
  console.log(localStorage.getItem("authToken"));
  const response = await fetch("https://api.muncho.in/api/file/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: formData,
  });
  const data = await response.json();
  if (data.status && data.fileUrl) {
    return data.fileUrl;
  } else {
    throw new Error(data.message || "Image upload failed");
  }
};

// Feature Section
export const fetchFeatures = async (userId) => {
  try {
    const response = await axiosInstance.get(`/feature-section/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateFeatures = async (userId, features) => {
  try {
    const response = await axiosInstance.post(`/feature-section/${userId}`, {
      features,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Dishes Section
export const fetchUserDishes = async (userId) => {
  try {
    const response = await axiosInstance.get(`/dish/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addUserDish = async (dish, userId) => {
  try {
    const response = await axiosInstance.post(`/dish/add`, {
      userId,
      dishId: dish.id,
      name: dish.name,
      description: dish.description,
      imageUrl: dish.imageUrl,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUserDish = async (userId, dishId) => {
  try {
    const response = await axiosInstance.delete(
      `/dish/user/${userId}/${dishId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reviews Section
export const fetchReviews = async (userId) => {
  try {
    const response = await axiosInstance.get(`/review/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) return null;
    throw error;
  }
};
export const postReviews = async (userId, reviews) => {
  try {
    const response = await axiosInstance.post(`/review/${userId}`, { reviews });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateReview = async (userId, index, review) => {
  try {
    const response = await axiosInstance.put(
      `/review/${userId}/${index}`,
      review
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteReview = async (userId, index) => {
  try {
    const response = await axiosInstance.delete(`/review/${userId}/${index}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Gift Card Section
export const fetchGiftCard = async (userId) => {
  try {
    const response = await axiosInstance.get(`/giftcard/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const postGiftCard = async (data, userId) => {
  try {
    const response = await axiosInstance.post(`/giftcard/${userId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Appearance Section
export const fetchAppearance = async (userId) => {
  try {
    const response = await axiosInstance.get("/appearance", {
      params: { userId: String(userId) },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postAppearance = async (logoUrl, userId) => {
  try {
    const response = await axiosInstance.post("/appearance", {
      logo: logoUrl,
      userId: String(userId),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAppearance = async (id, logoUrl, userId) => {
  try {
    const response = await axiosInstance.put(`/appearance/logo`, {
      logo: logoUrl,
      userId: String(userId),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAppearance = async (id, userId) => {
  try {
    const response = await axiosInstance.delete(`/appearance/logo`, {
      data: { userId: String(userId) },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Card Section
export const fetchCard = async (userId) => {
  try {
    const response = await axiosInstance.get("/card", { params: { userId } });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const postCard = async (data) => {
  try {
    const response = await axiosInstance.post("/card", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateCard = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/card`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteCard = async (id, userId) => {
  try {
    const response = await axiosInstance.delete(`/card`, {
      data: { userId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchGooglePlaces = async (query) => {
  try {
    const response = await axiosInstance.post("/google-places", { query });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generateSeoDescriptionAndTitle = async (content) => {
  try {
   
    const response = await axiosInstance.post('/generate-seo', { content });
    return response.data; 
  } catch (error) {
    throw error;
  }
};

export { axiosInstance };
