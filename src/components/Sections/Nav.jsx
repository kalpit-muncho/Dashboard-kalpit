import React, { useState, useEffect } from "react";

// Icons
import { ChevronDown, Plus } from "lucide-react";

// Components
import BigBtn from "./Components/Common/BigBtn";
import ToggleButton from "../Common/ToggleButton";
import TabHeading from "../Common/TabHeading";
import SmButton from "../Common/SmButton";
import Spinner from "../Common/Spinner";

// API
import {
  fetchNav,
  updateNav,
  postNav,
  fetchAppearance,
} from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";

function Nav() {
  // State
  const [navData, setNavData] = useState(null);
  const [navId, setNavId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editInput, setEditInput] = useState({ title: "", link: "" });
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const getNav = async () => {
      setLoading(true);
      try {
        const userId = getUserId();
        const data = await fetchNav(userId);
        if (data) {
          setNavData(data);
          setNavId(data._id);
        } else {
          setNavData({ links: [] });
        }
        // Fetch logo
        const appearance = await fetchAppearance(userId);
        setLogoUrl(appearance.logo || "");
      } catch (err) {
        setNavData({ links: [] });
        setLogoUrl("/Images/Demo/logo.png");
      } finally {
        setLoading(false);
      }
    };
    getNav();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );
  if (!navData)
    return (
      <div style={{ color: "red" }}>
        Navigation data missing or error occurred.
      </div>
    );

  const links = Array.isArray(navData.links) ? navData.links : [];

  // Handlers
  const handleLinksToggling = (index) => {
    const linksCopy = [...links];
    linksCopy[index] = {
      ...linksCopy[index],
      enabled: !linksCopy[index].enabled,
    };
    setNavData((prev) => ({ ...prev, links: linksCopy }));
  };

  const handleAddLink = () => {
    setNavData((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        {
          title: `Link ${prev.links.length + 1}`,
          link: "https://example.com",
          enabled: true,
        },
      ],
    }));
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditInput({ title: links[index].title, link: links[index].link });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = (index) => {
    const linksCopy = [...links];
    linksCopy[index] = {
      ...linksCopy[index],
      title: editInput.title,
      link: editInput.link,
    };
    setNavData((prev) => ({ ...prev, links: linksCopy }));
    setEditingIndex(null);
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
  };

  const handleSaveNav = async () => {
    try {
      const userId = getUserId();
      const payload = { ...navData, userId };
      if (navId) {
        await updateNav(navId, payload, userId);
      } else {
        const created = await postNav(payload, userId);
        setNavId(created._id);
      }
      // Optionally show a success message
    } catch (err) {
      // Optionally show an error message
    }
  };

  return (
    <div className="w-full h-full min-h-fit flex flex-col items-center gap-10">
      {/* Heading */}
      <TabHeading
        title="Navigation Bar"
        description="The Navigation Bar comes on the top of the website. Your customers can navigate to different sections and go to the ordering platform directly."
      />

      {/* Navigation Bar Preview */}
      <nav className="w-full flex justify-between items-center relative">
        {/* Left Side - Logo + Displayed Links */}
        <div className="flex items-center gap-5">
          <img
            src={logoUrl || "/Images/Demo/logo.png"}
            alt="logo"
            className="h-[50px] object-cover"
          />

          {links
            .filter((l) => l.enabled)
            .map(({ title }, index) => (
              <span
                key={index}
                className={`inter_reg text-[0.8rem] ${
                  title === "Home"
                    ? "text-black bg-[#EBEBEC] rounded-[0.5rem] px-2 py-1.5"
                    : "text-[#4D4D4D]"
                }`}
              >
                {title}
              </span>
            ))}

          <button
            className="flex items-center gap-1 cursor-pointer"
            style={{ pointerEvents: "none", opacity: 0.5 }}
            disabled
          >
            <span className="text-[#4D4D4D] inter_reg text-[0.8rem]">More</span>
            <ChevronDown size={15} color="#4D4D4D" />
          </button>
        </div>

        {/* Right Side - Sign In + CTA */}
        <div className="flex items-center gap-2">
          <BigBtn title="Order Online" />
        </div>
      </nav>

      {/* Editing Section */}
      <div className="w-full h-fit flex flex-col justify-center items-start gap-3 overflow-hidden relative mt-10">
        <div className="w-full h-fit flex justify-between items-center gap-3">
          <h3 className="poppins_med text-[#201F33] text-[14px]">Edit</h3>
          <SmButton title={"Save"} onClick={handleSaveNav} />
        </div>
        {/* Link Toggles  */}
        <div className="w-full h-fit grid grid-cols-3 gap-2">
          {links.map(({ title, enabled, link }, index) => (
            <div key={index} className="flex flex-col gap-1">
              {editingIndex === index ? (
                <div className="flex flex-col gap-1 bg-[#F5F5F7] p-2 rounded">
                  <input
                    className="border rounded px-2 py-1 text-sm mb-1"
                    name="title"
                    value={editInput.title}
                    onChange={handleEditInputChange}
                    placeholder="Name"
                  />
                  <input
                    className="border rounded px-2 py-1 text-sm mb-1"
                    name="link"
                    value={editInput.link}
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
                  title={link}
                >
                  {title}
                </span>
              )}
              <ToggleButton
                label="Enabled"
                isEnabled={enabled}
                onToggle={() => handleLinksToggling(index)}
              />
            </div>
          ))}
          {/* Add Link Button */}
          <button
            onClick={handleAddLink}
            className="w-fit flex items-center gap-2 p-2 rounded-[8px] hover:bg-[#EEEBFA] cursor-pointer border border-[#D6D6D6] self-end"
          >
            <Plus color="black" size={17} />
            <span className="poppins_reg text-black text-[14px]">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Nav;
