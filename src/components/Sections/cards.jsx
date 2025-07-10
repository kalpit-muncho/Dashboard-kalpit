import React, { useState, useEffect } from "react";

import BigBtn from "./Components/Common/BigBtn";
import TabHeading from "../Common/TabHeading";
import ImgUploader from "../Common/ImgUploader";
import { getUserId } from "../../utils/user";
import {
  fetchCard,
  postCard,
  updateCard,
  uploadImageToMuncho,
  generateSeoDescriptionAndTitle,
} from "../../services/websiteTemplate";
import Spinner from "../Common/Spinner";
import TextInput from "../Common/TextInput";

const Catering = () => {
  const [editData, setEditData] = useState({
    title: "Catering",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla natus laboriosam fuga dolores? Rerum corporis dolore quod non ratione vitae!",
    image: "/Images/Demo/hero.jpeg",
    button: "Arrange Your Fiesta!",
  });

  const [links, setLinks] = useState([
    { label: "Arrange Your Fiesta!", href: "", enabled: true },
  ]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editInput, setEditInput] = useState({ label: "", href: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [cardId, setCardId] = useState(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState(null);
  const [seoGenerated, setSeoGenerated] = useState(false);
  const [generatedSeo, setGeneratedSeo] = useState({
    heading: [],
    description: [],
  });

  useEffect(() => {
    const userId = getUserId();
    fetchCard(userId)
      .then((data) => {
        if (data) {
          setEditData({
            title: data.title || "Catering",
            description: data.description || "",
            image: data.image || "/Images/Demo/hero.jpeg",
            button: data.button || "Arrange Your Fiesta!",
          });
          setLinks(
            data.links || [
              { label: "Arrange Your Fiesta!", href: "", enabled: true },
            ]
          );
          setCardId(data._id || data.id || null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch card data:", err);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const path = "trial/kalpit/card";
      const imageUrl = await uploadImageToMuncho(file, path);
      setEditData((prev) => ({ ...prev, image: imageUrl }));
      setSuccess(true);
    } catch (err) {
      setError("Image upload failed");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const userId = getUserId();
    const payload = {
      userId,
      title: editData.title,
      description: editData.description,
      image: editData.image,
      button: editData.button,
      links,
    };
    try {
      if (cardId) {
        await updateCard(cardId, payload);
      } else {
        const res = await postCard(payload);
        setCardId(res._id || res.id || null);
      }
      setSuccess(true);
    } catch (err) {
      setError("Failed to save card data");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditInput({ label: links[index].label, href: links[index].href });
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditInput((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = (index) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], ...editInput };
    setLinks(updatedLinks);
    setEditingIndex(null);
  };
  const handleEditCancel = () => {
    setEditingIndex(null);
  };
  const handleLinksToggling = (index) => {
    setLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, enabled: !l.enabled } : l))
    );
  };
  const MAX_BUTTONS = 1;

  const handleAddLink = () => {
    if (links.length >= MAX_BUTTONS) return;
    setLinks((prev) => [
      ...prev,
      { label: "New Button", href: "", enabled: true },
    ]);
    setEditingIndex(links.length);
    setEditInput({ label: "New Button", href: "" });
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
  const cleanJSON = (str) => {
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
      <TabHeading
        title={"Cards"}
        description={"You can add descroption of your choice"}
      />
      <div className="w-full h-fit relative overflow-hidden">
        <div className="w-full h-[400px] relative rounded-[30px] overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={editData.image}
            alt="img"
          />
        </div>
        <div className="w-[40%] max-w-[400px] h-[90%] bg-white/80 backdrop-blur-md flex flex-col justify-center items-start absolute top-1/2 -translate-y-1/2 left-[5%] -translate-x-[5%] space-y-6 rounded-4xl px-10 py-10 overflow-hidden">
          <h1 className="inter_med text-5xl tracking-tight text-black">
            {editData.title}
          </h1>
          <p className="inter_reg w-full text-[14px] text-[#4D4D4D] tracking-tight leading-[17px]">
            {editData.description}
          </p>
          {links.find((l) => l.enabled) && (
            <BigBtn
              title={links.find((l) => l.enabled)?.label || editData.button}
            />
          )}
        </div>
      </div>

      <div className="w-full h-fit flex flex-col justify-center items-start gap-3 overflow-hidden relative mt-8">
        <div className="w-full h-fit flex justify-between items-center gap-3">
          <h3 className="poppins_med text-[#201F33] text-[14px]">Edit</h3>
          <button
            className="px-4 py-2 bg-[#201F33] text-white rounded disabled:opacity-50"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : success ? "Saved!" : "Save"}
          </button>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="w-full h-fit flex justify-between items-center gap-3">
          <div className="w-[50%] h-fit flex flex-col justify-center items-start gap-3">
            <TextInput
              name="title"
              placeholder="Title"
              value={editData.title}
              onChange={handleInputChange}
              disabled={seoLoading}
            />
            <TextInput
              name="description"
              placeholder="Description"
              value={editData.description}
              onChange={handleInputChange}
              disabled={seoLoading}
              isTextArea={true}
           
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

            <div className="w-full h-fit flex flex-col gap-10 mt-5">
              {links.map(({ label, enabled, href }, index) => (
                <div key={index} className="flex flex-col gap-1">
                  {editingIndex === index ? (
                    <div className="flex flex-col gap-1 bg-[#F5F5F7] p-2 rounded">
                      <input
                        className="border rounded px-2 py-1 text-sm mb-1"
                        name="label"
                        value={editInput.label}
                        onChange={handleEditInputChange}
                        placeholder="Name"
                      />
                      <input
                        className="border rounded px-2 py-1 text-sm mb-1"
                        name="href"
                        value={editInput.href}
                        onChange={handleEditInputChange}
                        placeholder="Link (optional)"
                      />
                      <div className="flex gap-2">
                        <button
                          className="bg-[#6C63FF] text-white rounded px-2 py-1 text-xs"
                          onClick={() => handleEditSave(index)}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-200 text-black rounded px-2 py-1 text-xs"
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span
                      className="cursor-pointer poppins_reg text-black text-[14px]"
                      onClick={() => handleEditClick(index)}
                      title={href}
                    >
                      {label}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">
                      {enabled ? "Enabled" : "Disabled"}
                    </span>
                    <button
                      className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                        enabled ? "bg-[#6C63FF]" : "bg-gray-300"
                      }`}
                      onClick={() => handleLinksToggling(index)}
                      type="button"
                    >
                      <span
                        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          enabled ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 w-[50%]">
            <ImgUploader
              title={"Background Image"}
              styles="bg-transparent"
              onChange={handleImageChange}
            />
          </div>
        </div>
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
            <Spinner />
          </div>
        )}
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
                    arr.map((item, idx) => (
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
          {generatedSeo.description && generatedSeo.description.length > 0 && (
            <div className="mb-2">
              <span className="block text-xs font-semibold mb-2 text-[#6C63FF] uppercase tracking-wider">
                Description Options
              </span>
              <ul className="list-disc pl-6 space-y-1">
                {generatedSeo.description.map((d, i) => {
                  const arr = cleanJSON(d) || [];
                  return arr.length > 0 ? (
                    arr.map((item, idx) => (
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
  );
};

export default Catering;
