import imageCompression from "browser-image-compression";
import { apiService } from "../services/apiService";

// Compress image using browser-image-compression
const compressImage = async (file) => {
  const options = {
  maxSizeMB: 0.5,
  useWebWorker: true,
  initialQuality: 0.7, // range 0 (worst) to 1 (best), use ~0.7–0.8 for a good balance
};

  return await imageCompression(file, options);
};

const isImageFile = (file) => file.type.startsWith("image/");

export const uploadFiles = async (data, path) => {
  try {
    const restId = localStorage.getItem("restaurantId");
    const newPath = `${restId}/${path}`;

    const uploadSingleFile = async (file) => {
      // Compress if it's an image
      const fileToUpload = isImageFile(file) ? await compressImage(file) : file;

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("path", newPath);

      const response = await apiService.uploadFile(formData);
      return response.fileUrl;
    };

    if (Array.isArray(data)) {
      const imageUrls = await Promise.all(data.map(uploadSingleFile));
      return imageUrls;
    }

    if (data instanceof File) {
      return await uploadSingleFile(data);
    }

    return null;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};
