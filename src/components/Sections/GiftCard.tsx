import React, { useState, useEffect } from "react";
import {
  fetchGiftCard,
  postGiftCard,
  uploadImageToMuncho,
  generateSeoDescriptionAndTitle,
} from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";

import BigBtn from "./Components/Common/BigBtn";
import TabHeading from "../Common/TabHeading";
import SmButton from "../Common/SmButton";
import ImgUploader from "../Common/ImgUploader";
import TextInput from "../Common/TextInput";

const GiftCard = () => {
  // State for editing
  const [editData, setEditData] = useState({
    title: "Gift cards",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla natus laboriosam fuga dolores? Rerum corporis dolore quod non ratione vitae!",
    img: "/Images/Demo/hero.jpeg",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // State for SEO generation
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState<string | null>(null);
  const [seoGenerated, setSeoGenerated] = useState(false);
  const [generatedSeo, setGeneratedSeo] = useState({
    heading: [],
    description: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = getUserId();
        if (!userId) throw new Error("User ID not found");
        const data = await fetchGiftCard(userId);
        if (data) {
          setEditData({
            title: data.title || "Gift cards",
            description: data.description || "",
            img: data.img || "/Images/Demo/hero.jpeg",
          });
        }
      } catch (err) {
        setError("Failed to fetch gift card data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTextInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const path = `trial/kalpit/giftcard`;
      const fileUrl = await uploadImageToMuncho(file, path);
      setEditData((prev) => ({ ...prev, img: fileUrl }));
    } catch (err) {
      setError("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const userId = getUserId();
      if (!userId) throw new Error("User ID not found");
      await postGiftCard(editData, userId);
      setSuccess(true);
    } catch (err) {
      console.error("GiftCard Save Error:", err);
      setError("Failed to save gift card data");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const handleGenerateSeo = async () => {
    setSeoLoading(true);
    setSeoError(null);
    try {
      const res = await generateSeoDescriptionAndTitle(editData.description);
      setGeneratedSeo({
        heading: res.headings || [],
        description: res.descriptions || [],
      });
      setSeoGenerated(true);
    } catch (err) {
      setSeoError("Failed to generate SEO description and title");
    } finally {
      setSeoLoading(false);
    }
  };

  const cleanJSON = (str: string) => {
    try {
      const jsonStr = str
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="w-full h-full min-h-fit flex flex-col justify-start items-center gap-10 overflow-hidden relative pb-20">
      <TabHeading title={"Catering Card"} />
      <div className="w-full h-[300px] flex justify-between items-center gap-30 relative overflow-hidden">
        {/* Text Section */}
        <div className="w-[300px] h-full flex flex-col justify-end items-start gap-10 overflow-hidden">
          <h1 className="inter_med text-5xl tracking-tight text-black">
            {editData.title}
          </h1>
          <p className="inter_reg w-full text-[14px] text-[#4D4D4D] tracking-tight leading-[17px]">
            {editData.description}
          </p>
          <BigBtn title={"Gift someone!"} styles={undefined} />
        </div>

        {/* Image Section */}
        <div className="flex-1 h-[300px] relative overflow-hidden rounded-[14px]">
          <img
            className="w-full h-full object-cover"
            src={editData.img}
            alt="img"
          />
        </div>
      </div>

      {/* Editing Part */}
      <div className="w-full h-fit flex flex-col justify-center items-start gap-3 overflow-hidden relative mt-8">
        <div className="w-full h-fit flex justify-between items-center gap-3">
          <h3 className="poppins_med text-[#201F33] text-[14px]">Edit</h3>
          <SmButton
            title={loading ? "Saving..." : success ? "Saved!" : "Save"}
            onClick={handleSave}
            iconSize={20}
            iconColor={"#000"}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {/* Inputs  */}
        <div className="w-full h-fit flex justify-between items-center gap-3">
          {/* Text Inputs */}
          <div className="w-full h-fit flex flex-col justify-center items-start gap-3">
            <TextInput
              name={"title"}
              placeholder={"Write Title here"}
              onChange={handleTextInputChange}
              value={editData.title}
              disabled={seoLoading}
            />
            <TextInput
              name={"description"}
              placeholder={"Write Description here"}
              onChange={handleTextInputChange}
              value={editData.description}
              isTextArea={true}
              disabled={seoLoading}
            />
            <button
              className="px-4 py-2 bg-[#6C63FF] text-white rounded disabled:opacity-50 w-fit"
              onClick={handleGenerateSeo}
              disabled={seoLoading || !editData.description}
              type="button"
            >
              {seoLoading
                ? "Generating..."
                : seoGenerated
                ? "Regenerate SEO"
                : "Generate SEO Title & Description"}
            </button>
            {seoError && <div className="text-red-500 text-sm">{seoError}</div>}
          </div>
          {/* Image Uploader */}
          <ImgUploader styles="bg-transparent" onChange={handleImageUpload} />
        </div>
        {seoGenerated && (
          <div className="bg-[#F5F5F7] border border-[#D6D6D6] rounded-xl shadow-md p-6 mt-6 w-full max-w-2xl mx-auto">
            <h4 className="font-semibold text-lg mb-4 text-[#201F33] flex items-center gap-2">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" fill="#6C63FF" />
                <path
                  d="M8 12l2 2 4-4"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              SEO Friendly Suggestions
            </h4>
            {/* Headings */}
            {generatedSeo.heading && generatedSeo.heading.length > 0 && (
              <div className="mb-6">
                <span className="block text-xs font-semibold mb-2 text-[#6C63FF] uppercase tracking-wider">
                  Heading Options
                </span>
                <ul className="list-disc pl-6 space-y-1">
                  {generatedSeo.heading.map((h, i) => {
                    const arr = cleanJSON(h) || [];
                    return arr.length > 0 ? (
                      arr.map((item: string, idx: number) => (
                        <li
                          key={i + "-" + idx}
                          className="text-base text-[#201F33] font-medium bg-white rounded px-3 py-1 shadow-sm hover:bg-[#f0eeff] transition"
                        >
                          {item}
                        </li>
                      ))
                    ) : (
                      <li
                        key={i}
                        className="text-base text-[#201F33] font-medium bg-white rounded px-3 py-1 shadow-sm hover:bg-[#f0eeff] transition"
                      >
                        {h}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {/* Descriptions */}
            {generatedSeo.description &&
              generatedSeo.description.length > 0 && (
                <div className="mb-2">
                  <span className="block text-xs font-semibold mb-2 text-[#6C63FF] uppercase tracking-wider">
                    Description Options
                  </span>
                  <ul className="list-disc pl-6 space-y-1">
                    {generatedSeo.description.map((d, i) => {
                      const arr = cleanJSON(d) || [];
                      return arr.length > 0 ? (
                        arr.map((item: string, idx: number) => (
                          <li
                            key={i + "-" + idx}
                            className="text-sm text-[#4D4D4D] bg-white rounded px-3 py-1 shadow-sm hover:bg-[#f0eeff] transition"
                          >
                            {item}
                          </li>
                        ))
                      ) : (
                        <li
                          key={i}
                          className="text-sm text-[#4D4D4D] bg-white rounded px-3 py-1 shadow-sm hover:bg-[#f0eeff] transition"
                        >
                          {d}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftCard;
