import React, { useState, useEffect } from "react";

// Icons
import { Facebook, Instagram } from "lucide-react";

// Components
import TabHeading from "../Common/TabHeading";
import SmButton from "../Common/SmButton";
import BigBtn from "./Components/Common/BigBtn";
import ToggleButton from "../Common/ToggleButton";
import Spinner from "../Common/Spinner";

// API
import {
  fetchFooter,
  updateFooter,
  postFooter,
  fetchAppearance,
} from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";

function Footer() {
  const [footerData, setFooterData] = useState(null);
  const [footerId, setFooterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editInput, setEditInput] = useState({ label: "", href: "" });
  const [editingLegalIndex, setEditingLegalIndex] = useState(null);
  const [editLegalInput, setEditLegalInput] = useState({ label: "", href: "" });
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const getFooter = async () => {
      setLoading(true);
      try {
        const userId = getUserId();
        const data = await fetchFooter(userId);
        if (data && typeof data === "object") {
          setFooterData({
            links: Array.isArray(data.links) ? data.links : [],
            legalLinks: Array.isArray(data.legalLinks) ? data.legalLinks : [],
            ...data,
          });
          setFooterId(data._id);
        } else {
          setFooterData({ links: [], legalLinks: [] });
        }
        // Fetch logo
        const appearance = await fetchAppearance(userId);
        setLogoUrl(appearance.logo || "/Images/Demo/logo.png");
      } catch (err) {
        setFooterData({ links: [], legalLinks: [] });
        setLogoUrl("/Images/Demo/logo.png");
      } finally {
        setLoading(false);
      }
    };
    getFooter();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );
  if (!footerData || typeof footerData !== "object")
    return (
      <div style={{ color: "red" }}>Footer data missing or error occurred.</div>
    );

  // Ensure links and legalLinks are always arrays and legalLinks always have enabled property
  const links = Array.isArray(footerData.links) ? footerData.links : [];
  const legalLinks = Array.isArray(footerData.legalLinks)
    ? footerData.legalLinks.map((link) => ({
        ...link,
        enabled: typeof link.enabled === "boolean" ? link.enabled : true,
      }))
    : [];

  // Restore handleSaveFooter function
  const handleSaveFooter = async () => {
    try {
      const userId = getUserId();
      if (footerId) {
        await updateFooter(footerId, footerData, userId);
      } else {
        const created = await postFooter(footerData, userId);
        setFooterId(created._id);
      }
      // Optionally show a success message
    } catch (err) {
      // Optionally show an error message
    }
  };

  // Restore handleAddLink and handleAddLegalLink functions
  const handleAddLink = () => {
    setFooterData((prev) => ({
      ...(prev || { links: [], legalLinks: [] }),
      links: [
        ...(Array.isArray(prev?.links) ? prev.links : []),
        {
          label: `Link ${(prev?.links?.length || 0) + 1}`,
          href: "#",
          enabled: true,
        },
      ],
    }));
  };

  const handleAddLegalLink = () => {
    setFooterData((prev) => ({
      ...(prev || { links: [], legalLinks: [] }),
      legalLinks: [
        ...(Array.isArray(prev?.legalLinks) ? prev.legalLinks : []),
        {
          label: `Legal Link ${(prev?.legalLinks?.length || 0) + 1}`,
          href: "#",
          enabled: true,
        },
      ],
    }));
  };

  // Restore handleLinksToggling
  const handleLinksToggling = (index) => {
    const linksCopy = [...links];
    linksCopy[index] = {
      ...linksCopy[index],
      enabled: !linksCopy[index].enabled,
    };
    setFooterData((prev) => ({
      ...prev,
      links: linksCopy,
    }));
  };

  // Restore handleEditClick
  const handleEditClick = (index) => {
    if (!links[index]) return;
    setEditingIndex(index);
    setEditInput({
      label: links[index].label || "",
      href: links[index].href || "",
    });
  };

  // Restore handleEditInputChange
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditInput((prev) => ({ ...prev, [name]: value }));
  };

  // Restore handleEditSave
  const handleEditSave = (index) => {
    const linksCopy = [...links];
    linksCopy[index] = {
      ...linksCopy[index],
      label: editInput.label,
      href: editInput.href,
    };
    setFooterData((prev) => ({ ...prev, links: linksCopy }));
    setEditingIndex(null);
  };

  // Restore handleEditCancel
  const handleEditCancel = () => {
    setEditingIndex(null);
  };

  // Restore handleLegalLinksToggling
  const handleLegalLinksToggling = (index) => {
    const legalLinksCopy = [...legalLinks];
    legalLinksCopy[index] = {
      ...legalLinksCopy[index],
      enabled: !legalLinksCopy[index].enabled,
    };
    setFooterData((prev) => ({
      ...prev,
      legalLinks: legalLinksCopy,
    }));
  };

  // Restore handleLegalEditClick
  const handleLegalEditClick = (index) => {
    if (!legalLinks[index]) return;
    setEditingLegalIndex(index);
    setEditLegalInput({
      label: legalLinks[index].label || "",
      href: legalLinks[index].href || "",
    });
  };

  // Restore handleLegalEditInputChange
  const handleLegalEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditLegalInput((prev) => ({ ...prev, [name]: value }));
  };

  // Restore handleLegalEditSave
  const handleLegalEditSave = (index) => {
    const legalLinksCopy = [...legalLinks];
    legalLinksCopy[index] = {
      ...legalLinksCopy[index],
      label: editLegalInput.label,
      href: editLegalInput.href,
    };
    setFooterData((prev) => ({ ...prev, legalLinks: legalLinksCopy }));
    setEditingLegalIndex(null);
  };

  // Restore handleLegalEditCancel
  const handleLegalEditCancel = () => {
    setEditingLegalIndex(null);
  };

  return (
    <div className="w-full h-full min-h-fit flex flex-col justify-start items-center gap-10 overflow-hidden relative pb-20">
      {/* Headings  */}
      <TabHeading
        title={"Footer"}
        description={
          "The Footer comes at the very last of the website, this section has links to every section on the website. You can enable and disable the links."
        }
      />

      {/* Footer  */}
      <footer className="w-full h-fit overflow-hidden relative">
        <div className="w-full h-fit flex flex-col justify-between items-center bg-[#EBEBEC] rounded-[24px] px-12 pt-12 pb-6">
          <div className="w-full h-fit flex justify-between items-start">
            {/* Logo */}
            <div className="w-fit h-fit overflow-hidden relative">
              <img
                className="w-fit h-[60px] object-cover"
                src={logoUrl || "/Images/Demo/logo.png"}
                alt="logo"
              />
            </div>

            {/* Page Links */}
            <div className="w-fit h-fit grid grid-cols-3 gap-x-16 gap-y-4">
              {links
                .filter(({ enabled }, _) => enabled)
                .map(({ label }, index) => (
                  <span
                    key={index}
                    className="inter_reg text-[13px] text-[#0D0D0D]"
                  >
                    {label}
                  </span>
                ))}
            </div>
            <BigBtn title={"Order Now"} />
          </div>

          <div className="w-full h-fit flex flex-col justify-center items-end gap-6 mt-8">
            {/* Divider */}
            <hr className="w-[78%] border border-gray-300" />

            {/* Legal Links */}
            <div className="w-[78%] h-fit flex justify-start gap-8 text-gray-600 text-xs md:text-sm mb-4">
              {legalLinks
                .filter(({ enabled }) => enabled)
                .map(({ label }, index) => (
                  <span
                    key={index}
                    className="inter_reg text-[10px] text-[#4D4D4D]"
                  >
                    {label}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="w-full h-fit flex justify-between items-center p-4">
          <div className="w-fit h-fit flex justify-center items-center gap-2">
            <Facebook size={24} color="#4D4D4D" />
            <Instagram size={24} color="#4D4D4D" />
          </div>

          <span className="inter_reg text-[12px] text-[#4D4D4D]">
            Batata Group, LLC 2025 All Rights Reserved
          </span>

          <button className="flex justify-center items-center border border-[#E5E7EB] rounded-full px-3 py-2">
            <span className="inter_reg text-[12px] text-[#4D4D4D]">
              Mande with Muncho
            </span>
          </button>
        </div>
      </footer>

      {/* Editing Part  */}
      <div className="w-full h-fit flex flex-col justify-center items-start gap-3 overflow-hidden relative">
        <div className="w-full h-fit flex justify-between items-center gap-3">
          <h3 className="poppins_med text-[#201F33] text-[14px]">Edit</h3>
          <SmButton title={"Save"} onClick={handleSaveFooter} />
        </div>

        {/* Link Toggles  */}
        <div className="w-full h-fit grid grid-cols-3 gap-2">
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
            <span className="poppins_reg text-black text-[14px]">Add</span>
          </button>
        </div>

        {/* Legal Links */}
        <div className="w-full h-fit flex flex-col justify-center items-start gap-3 overflow-hidden relative mt-6">
          <h3 className="poppins_med text-[#201F33] text-[14px]">
            Legal Links
          </h3>
          <div className="w-full h-fit grid grid-cols-3 gap-2">
            {legalLinks.map(({ label, enabled, href }, index) => (
              <div key={index} className="flex flex-col gap-1">
                {editingLegalIndex === index ? (
                  <div className="flex flex-col gap-1 bg-[#F5F5F7] p-2 rounded">
                    <input
                      className="border rounded px-2 py-1 text-sm mb-1"
                      name="label"
                      value={editLegalInput.label}
                      onChange={handleLegalEditInputChange}
                      placeholder="Name"
                    />
                    <input
                      className="border rounded px-2 py-1 text-sm mb-1"
                      name="href"
                      value={editLegalInput.href}
                      onChange={handleLegalEditInputChange}
                      placeholder="Link (optional)"
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-[#6C63FF] text-white rounded px-2 py-1 text-xs"
                        onClick={() => handleLegalEditSave(index)}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-200 text-black rounded px-2 py-1 text-xs"
                        onClick={handleLegalEditCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <span
                    className="cursor-pointer poppins_reg text-black text-[14px]"
                    onClick={() => handleLegalEditClick(index)}
                    title={href}
                  >
                    {label}
                  </span>
                )}
                <ToggleButton
                  label="Enabled"
                  isEnabled={enabled}
                  onToggle={() => handleLegalLinksToggling(index)}
                />
              </div>
            ))}
            {/* Add Legal Link Button */}
            <button
              onClick={handleAddLegalLink}
              className="w-fit flex items-center gap-2 p-2 rounded-[8px] hover:bg-[#EEEBFA] cursor-pointer border border-[#D6D6D6] self-end"
            >
              <span className="poppins_reg text-black text-[14px]">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
