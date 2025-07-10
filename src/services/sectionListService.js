import axios from "axios";
const API_BASE_URL = "https://backend-template-eight.vercel.app/api";
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const fetchSectionList = async (userId) => {
  const response = await axiosInstance.get("/sectionlist", {
    params: { userId },
  });
  return response.data.sections;
};

export const saveSectionList = async (userId, sections) => {
  const response = await axiosInstance.post("/sectionlist", {
    userId,
    sections,
  });
  return response.data.sections;
};
