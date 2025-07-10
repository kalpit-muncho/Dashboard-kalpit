import React, { useState } from "react";
import TabHeading from "../Common/TabHeading";
import FeatureOption from "./Components/FeatureOption";
// Import all Lucide icons as an object
import * as LucideIcons from "lucide-react";
import { fetchFeatures, updateFeatures } from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";
import Spinner from "../Common/Spinner";

const DEFAULT_ICONS = [
  "ShoppingCart",
  "WheatOff",
  "Heart",
  "CircleParking",
  "Carrot",
  "Handshake",
];

function Features() {
  // Feature state for editing
  const [features, setFeatures] = useState([
    {
      Icon: LucideIcons["ShoppingCart"],
      label: "Catering",
      iconName: "ShoppingCart",
    },
    {
      Icon: LucideIcons["WheatOff"],
      label: "Gluten-Free Options",
      iconName: "WheatOff",
    },
    { Icon: LucideIcons["Heart"], label: "Heart Option", iconName: "Heart" },
    {
      Icon: LucideIcons["CircleParking"],
      label: "Easy Parking",
      iconName: "CircleParking",
    },
    { Icon: LucideIcons["Carrot"], label: "Veg Options", iconName: "Carrot" },
    {
      Icon: LucideIcons["Handshake"],
      label: "Family Friendly",
      iconName: "Handshake",
    },
  ]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editInput, setEditInput] = useState({
    label: "",
    iconName: DEFAULT_ICONS[0],
  });
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dbId, setDbId] = useState(null); // for future use if needed

  // Fetch features from API on mount
  React.useEffect(() => {
    const loadFeatures = async () => {
      setLoading(true);
      try {
        const userId = getUserId && getUserId();
        if (!userId) throw new Error("No userId");
        const data = await fetchFeatures(userId);
        if (data && data.features) {
          setFeatures(
            data.features.map((f) => ({
              Icon: LucideIcons[f.iconName] || LucideIcons[DEFAULT_ICONS[0]],
              label: f.label,
              iconName: f.iconName,
            }))
          );
          setDbId(data._id);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    loadFeatures();
    // eslint-disable-next-line
  }, []);

  // Handlers
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditInput({
      label: features[index].label,
      iconName: features[index].iconName || DEFAULT_ICONS[0],
    });
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditInput((prev) => ({ ...prev, [name]: value }));
  };
  const handleIconDropdownToggle = () => setIconDropdownOpen((prev) => !prev);
  const handleIconSelect = (iconName) => {
    setEditInput((prev) => ({ ...prev, iconName }));
    setIconDropdownOpen(false);
    setIconSearch("");
  };
  const handleEditSave = (index) => {
    const updated = [...features];
    updated[index] = {
      Icon: LucideIcons[editInput.iconName],
      label: editInput.label,
      iconName: editInput.iconName,
    };
    setFeatures(updated);
    setEditingIndex(null);
  };
  const handleEditCancel = () => {
    setEditingIndex(null);
    setIconSearch("");
  };
  const handleAddFeature = () => {
    setFeatures((prev) => [
      ...prev,
      {
        Icon: LucideIcons[DEFAULT_ICONS[0]],
        label: `Feature ${prev.length + 1}`,
        iconName: DEFAULT_ICONS[0],
      },
    ]);
  };
  const handleSave = async () => {
    try {
      const userId = getUserId && getUserId();
      if (!userId) throw new Error("No userId");
      const featuresToSave = features.map((f) => ({
        iconName: f.iconName,
        label: f.label,
      }));
      await updateFeatures(userId, featuresToSave);
      // Optionally show success
    } catch (err) {
      // Optionally show error
    }
  };
  const handleDeleteFeature = (index) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  // Filter Lucide icons by search
  const iconNames = Object.keys(LucideIcons).filter((name) =>
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );

  return (
    <div className="w-full h-full min-h-fit flex flex-col justify-start items-center gap-10 overflow-hidden relative pb-20">
      <TabHeading
        title={"Features"}
        description={"You can add description of your choice"}
      />
      <div className="w-full flex flex-col justify-center items-center gap-10 relative overflow-hidden">
        <h1 className="inter_med text-black text-[32px] tracking-[-2px]">
          Featuring
        </h1>
        <div className="w-full h-fit grid grid-cols-3 gap-y-12">
          {features.map(({ Icon, label }, idx) => (
            <FeatureOption Icon={Icon} label={label} key={idx} />
          ))}
        </div>
      </div>
      {/* Editing Section */}
      <div className="w-full h-full flex flex-col justify-center items-start gap-3 overflow-hidden relative mt-10">
        <div className="w-full h-fit flex justify-between items-center gap-3">
          <h3 className="poppins_med text-[#201F33] text-[14px]">Edit</h3>
          <button
            className="bg-[#6C63FF] text-white rounded px-3 py-1.5 text-xs"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
        <div className="w-full h-fit grid grid-cols-3 gap-2">
          {features.map(({ Icon, label }, index) => (
            <div key={index} className="flex flex-col gap-1">
              {editingIndex === index ? (
                <div className="flex flex-col gap-1 bg-[#F5F5F7] p-2 rounded">
                  <input
                    className="border rounded px-2 py-1 text-sm mb-1"
                    name="label"
                    value={editInput.label}
                    onChange={handleEditInputChange}
                    placeholder="Label"
                  />
                  {/* Searchable Custom Icon Dropdown */}
                  <div className="relative mb-1">
                    <button
                      type="button"
                      className="border rounded px-2 py-1 text-sm flex items-center gap-2 w-full bg-white"
                      onClick={handleIconDropdownToggle}
                    >
                      {LucideIcons[editInput.iconName] && (
                        <span className="inline-flex items-center">
                          {React.createElement(
                            LucideIcons[editInput.iconName],
                            { size: 16 }
                          )}
                        </span>
                      )}
                      <span>{editInput.iconName}</span>
                      <svg
                        width="12"
                        height="12"
                        className="ml-auto"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"
                          fill="#888"
                        />
                      </svg>
                    </button>
                    {iconDropdownOpen && (
                      <div className="absolute z-50 bg-white border rounded shadow w-full mt-1 max-h-60 overflow-y-auto">
                        <input
                          className="w-full border-b px-2 py-1 text-sm mb-1 outline-none"
                          placeholder="Search icon..."
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          autoFocus
                        />
                        {iconNames.length === 0 && (
                          <div className="px-2 py-2 text-gray-400 text-xs">
                            No icons found
                          </div>
                        )}
                        {iconNames.slice(0, 50).map((name) => (
                          <div
                            key={name}
                            className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 ${
                              editInput.iconName === name ? "bg-gray-200" : ""
                            }`}
                            onClick={() => handleIconSelect(name)}
                          >
                            <span>
                              {React.createElement(LucideIcons[name], {
                                size: 16,
                              })}
                            </span>
                            <span>{name}</span>
                          </div>
                        ))}
                        {iconNames.length > 50 && (
                          <div className="px-2 py-1 text-xs text-gray-400">
                            Showing first 50 results...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* End Custom Icon Dropdown */}
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
                    <button
                      className="bg-red-500 text-white rounded px-2 py-1 text-xs"
                      onClick={() => handleDeleteFeature(index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <span
                  className="cursor-pointer poppins_reg text-black text-[14px]"
                  onClick={() => handleEditClick(index)}
                  title={label}
                >
                  {label}
                </span>
              )}
            </div>
          ))}
          {/* Add Feature Button */}
          <button
            onClick={handleAddFeature}
            className="w-fit flex items-center gap-2 p-2 rounded-[8px] hover:bg-[#EEEBFA] cursor-pointer border border-[#D6D6D6] self-end"
          >
            <span className="poppins_reg text-black text-[14px]">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Features;
