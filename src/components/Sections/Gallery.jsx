import React, { useState, useEffect } from "react";
import {
  fetchGallery,
  postGallery,
  updateGallery,
  uploadImageToMuncho,
  deleteGallery,
} from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";
import Spinner from "../Common/Spinner";

const CrossIcon = (props) => (
  <svg
    width={props.width || 16}
    height={props.height || 16}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5 5L15 15M15 5L5 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Components
import TabHeading from "../Common/TabHeading";
import ImgUploader from "../Common/ImgUploader";
import SmButton from "../Common/SmButton";

function Gallery({ sectionId, sectionObj, uniqueKey }) {
  const [galleryData, setGalleryData] = useState({
    title: sectionObj?.name || "",
    subtitle: "",
    images: [],
    sectionId: sectionId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    console.log("Gallery Rendered:", { sectionId, uniqueKey });
  }, [sectionId, uniqueKey]);

  useEffect(() => {
    const getGallery = async () => {
      setLoading(true);
      try {
        const userId = getUserId();
        const data = await fetchGallery(userId, sectionId);
        if (data && data.sectionId === sectionId) {
          setGalleryData({
            ...data,
            sectionId: sectionId, // Always ensure sectionId is correct
          });
        } else {
          // If no data or wrong sectionId, reset to default for this sectionId
          setGalleryData({
            title: sectionObj?.name || "",
            subtitle: "",
            images: [],
            sectionId: sectionId,
          });
        }
      } catch (err) {
        setError("Failed to fetch gallery data");
      } finally {
        setLoading(false);
      }
    };
    if (sectionId) getGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, uniqueKey]);

  // Ensure galleryData.sectionId is always correct before saving
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const userId = getUserId();
      let response;
      if (galleryData._id && galleryData.sectionId === sectionId) {
        // Update existing gallery for this sectionId
        response = await updateGallery(
          galleryData._id,
          { ...galleryData, sectionId },
          userId
        );
      } else {
        // Create new gallery for this sectionId
        response = await postGallery({ ...galleryData, sectionId }, userId);
      }
      // Update local state with backend response to ensure correct _id and data
      setGalleryData({ ...response, sectionId });
      setSuccess(true);
    } catch (err) {
      setError("Failed to save gallery data");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  // Defensive: ensure image upload and delete always use correct sectionId
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const path = `trial/kalpit/gallery/${sectionId}`;
      const fileUrl = await uploadImageToMuncho(file, path);
      setGalleryData((prev) => ({
        ...prev,
        images: [...(prev.images || []), { src: fileUrl, alt: path }],
        sectionId: sectionId,
      }));
    } catch (err) {
      setError("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (idx) => {
    if (!galleryData._id || galleryData.sectionId !== sectionId) return;
    setLoading(true);
    setError(null);
    try {
      const userId = getUserId();
      // Defensive: only delete image for this gallery's sectionId
      const updatedGallery = await deleteGallery(
        galleryData._id,
        userId,
        sectionId
      );
      setGalleryData({ ...updatedGallery, sectionId: sectionId });
    } catch (err) {
      setError("Failed to delete image");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGalleryData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
          <Spinner />
        </div>
      )}
      <div className="w-full h-full min-h-fit flex flex-col justify-start items-center gap-10 overflow-hidden relative pb-20">
        {/* Headings  */}
        <TabHeading title={"Gallery"} />
        {/* Gallery Section */}
        <div className="w-full flex flex-col justify-center items-center gap-3">
          <div className="w-full flex flex-col justify-center items-center leading-7">
            <h1 className="inter_med text-black text-[32px] tracking-[-2px]">
              {galleryData.title || "Title will be here"}
            </h1>
            <h4 className="inter_reg text-[#4D4D4D] text-[12px]">
              {galleryData.subtitle || "Sub heading will be here"}
            </h4>
          </div>
          <div className="w-[500px] grid grid-cols-3 gap-2">
            {/* Render images if available */}
            {galleryData.images && galleryData.images.length > 0
              ? [
                  ...galleryData.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img.src}
                        alt={img.alt || `gallery-img-${idx}`}
                        className="bg-[#F8F7FA] aspect-square object-cover"
                      />
                      <button
                        className="absolute top-1 right-1 bg-red-500 rounded-full p-1 shadow hover:bg-red-600 text-white transition-colors"
                        style={{ zIndex: 2 }}
                        onClick={() => handleDeleteImage(idx)}
                        aria-label="Delete image"
                        disabled={loading}
                      >
                        <CrossIcon width={16} height={16} />
                      </button>
                    </div>
                  )),
                  galleryData.images.length < 9 && (
                    <ImgUploader
                      key="uploader"
                      styles="bg-[#F8F7FA] aspect-square"
                      onChange={handleImageUpload}
                    />
                  ),
                ]
              : Array.from({ length: 9 }).map((_, idx) => (
                  <ImgUploader
                    key={idx}
                    styles="bg-[#F8F7FA] aspect-square"
                    onChange={handleImageUpload}
                  />
                ))}
          </div>
        </div>
        {/* Editing Part  */}
        <div className="w-full h-fit flex flex-col justify-center items-start gap-3 overflow-hidden relative">
          <div className="w-full h-fit flex justify-between items-center gap-3">
            <h3 className="poppins_med text-[#201F33] text-[14px]">Edit</h3>
            <SmButton
              title={loading ? "Saving..." : success ? "Saved!" : "Save"}
              onClick={handleSave}
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {/* Inputs  */}
          <div className="w-full h-fit flex justify-between items-center gap-3">
            {/* Text Inputs */}
            <input
              className="poppins_reg w-full text-[14px] text-[#5C5C7A] placeholder:text-[#5C5C7A] focus:outline-none px-2 py-3"
              type="text"
              name="title"
              placeholder="Write Title here"
              value={galleryData.title}
              onChange={handleInputChange}
            />
            <input
              className="poppins_reg w-full text-[14px] text-[#5C5C7A] placeholder:text-[#5C5C7A] focus:outline-none px-2 py-3"
              type="text"
              name="subtitle"
              placeholder="Write Sub heading here"
              value={galleryData.subtitle}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
