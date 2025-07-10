import React, { useState, useEffect } from "react";
import {
  fetchHero,
  postHero,
  uploadImageToMuncho,
  updateHero,
} from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";

// components
import BigBtn from "./Components/Common/BigBtn";
import TabHeading from "../Common/TabHeading";
import SmButton from "../Common/SmButton";
import ImgUploader from "../Common/ImgUploader";
import TextInput from "../Common/TextInput";
import Spinner from "../Common/Spinner";

function Hero() {
  const [heroSectionData, setHeroSectionData] = useState({
    type: "Hero",
    data: {
      text: {
        title: "",
        heroText: "",
      },
      bg_image: {
        src: "",
        alt: "", // optional
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getHero = async () => {
      setLoading(true);
      try {
        const userId = getUserId();
        const data = await fetchHero(userId);
        if (data) {
          setHeroSectionData((prev) => ({ ...prev, data: data }));
        }
      } catch (err) {
        setError("Failed to fetch hero data");
      } finally {
        setLoading(false);
      }
    };
    getHero();
  }, []);

  const handleTextInputChange = (e) => {
    const { type, name, value } = e.target;
    setHeroSectionData((prev) => {
      if (type === "text") {
        return {
          ...prev,
          data: { ...prev.data, text: { ...prev.data.text, [name]: value } },
        };
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const userId = getUserId();
      if (heroSectionData.data._id) {
        // Update existing hero section
        await updateHero(
          heroSectionData.data._id,
          heroSectionData.data,
          userId
        );
      } else {
        // Create new hero section
        await postHero(heroSectionData.data, userId);
      }
      setSuccess(true);
    } catch (err) {
      setError("Failed to save hero data");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const path = `trial/kalpit/hero/`;
      const fileUrl = await uploadImageToMuncho(file, path);
      setHeroSectionData((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          bg_image: {
            ...prev.data.bg_image,
            src: fileUrl,
            alt: path,
          },
        },
      }));
    } catch (err) {
      setError("Image upload failed");
    } finally {
      setLoading(false);
    }
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
        <TabHeading
          title={"Hero Section"}
          description={
            "The Hero Section introduces your brand to your customer. Change your tagline, title content, and background images."
          }
        />

        <div className="w-full h-[450px] min-h-[450px] overflow-hidden relative">
          <div className="w-full h-full rounded-[32px] overflow-hidden relative">
            <img
              className="absolute top-0 left-0 object-cover overflow-hidden z-0"
              src={
                heroSectionData.data.bg_image.src || "/Images/Demo/hero.jpeg"
              }
              alt={heroSectionData.data.bg_image.alt || "hero_image"}
            />

            {/* Overlay  */}
            <div className="w-full h-full bg-black/20 absolute top-0 left-0 z-10"></div>

            {/* Texts  */}
            <div className="w-full h-full flex flex-col justify-between items-start gap-3 relative z-20 p-20">
              <div className="w-fit h-fit">
                <div className="w-fit flex justify-center items-center gap-2">
                  <div className="h-[30px] border-[3.5px] border-white"></div>
                  <h4 className="inter_reg text-white text-[16px]">
                    {heroSectionData.data.text.title || "Sub Title Text"}
                  </h4>
                </div>
                <h1 className="inter_med w-full max-w-[350px] text-white text-[36px] leading-9 tracking-[-1.1px] mt-3">
                  {heroSectionData.data.text.heroText || "Title Text"}
                </h1>
              </div>
              <BigBtn title={"Order Online"} />
            </div>
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
            <div className="w-full h-fit flex flex-col justify-center items-start gap-3">
              <TextInput
                name={"title"}
                placeholder={"Write Title here"}
                onChange={handleTextInputChange}
                value={heroSectionData.data.text.title}
              />
              <TextInput
                name={"heroText"}
                placeholder={"Write Hero_Text here"}
                onChange={handleTextInputChange}
                value={heroSectionData.data.text.heroText}
              />
            </div>

            {/* Image Uploader */}
            <ImgUploader
              title={"Background Image"}
              styles="bg-transparent"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
