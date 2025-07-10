import axios from "axios";
import { getDeviceInfo } from "./deviceInfo";
import { logError, logEvent } from "./logger";

const API_TIMEOUT = 20000;

const apiClient = axios.create({
  baseURL: "https://api.example.com",
  timeout: API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

// Connectivity checks
apiClient.interceptors.request.use(
  async (config) => {
    // Check if browser is online
    if (!navigator.onLine) {
      throw new Error("No Internet Connection");
    }

    config.headers["Device-Info"] = JSON.stringify(getDeviceInfo());
    return config;
  },
  (error) => {
    logError("Request Error", error);
    return Promise.reject(error);
  }
);

// Response Interceptor for Error Handling & Logging
apiClient.interceptors.response.use(
  (response) => {
    logEvent("API_SUCCESS", {
      url: response.config.url,
      status: response.status,
      data: response.data,
      // add any other fields you need
    });
    return response;
  },
  (error) => {
    logError("API_FAILURE", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      // add any other fields you need
    });

    if (error.code === "ECONNABORTED") {
      logError("API_TIMEOUT", error);
    }

    return Promise.reject(error);
  }
);

// Retry logic with exponential backoff
const fetchWithRetry = async (url, options, retries = 0) => {
  try {
    return await apiClient(url, options);
  } catch (error) {
    if (retries > 0) {
      // Add exponential backoff delay
      const delay = Math.pow(2, 3 - retries) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

export { apiClient, fetchWithRetry };