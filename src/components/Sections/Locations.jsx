import React, { useState, useEffect } from "react";
import TabHeading from "../Common/TabHeading";
import {
  fetchLocations,
  postLocation,
  updateLocation,
  deleteLocation,
} from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";

// Icons
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";

// Components
import TextInput from "../Common/TextInput";
import SmButton from "../Common/SmButton";
import Spinner from "../Common/Spinner";

function Locations() {
  const [locations, setLocations] = useState([]);
  const [activeLocation, setactiveLocation] = useState(0);
  const [location, setLocation] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    mapQuery: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Add show property to each location for toggling visibility
  useEffect(() => {
    const getLocations = async () => {
      setLoading(true);
      try {
        const userId = getUserId();
        const data = await fetchLocations(userId);
        if (data) setLocations(data);
      } catch (err) {
        setError("Failed to fetch locations");
      } finally {
        setLoading(false);
      }
    };
    getLocations();
  }, []);

  // Sync form state with selected location
  useEffect(() => {
    if (locations[activeLocation]) {
      setLocation(locations[activeLocation]);
    } else {
      setLocation({
        name: "",
        city: "",
        address: "",
        phone: "",
        email: "",
        mapQuery: "",
      });
    }
  }, [activeLocation, locations]);

  const handleSetActiveLocation = (index) => {
    setactiveLocation(index);
    setLocation(locations[index]);
  };

  const handleNextLocation = () => {
    if (activeLocation === locations.length - 1) return;
    handleSetActiveLocation(activeLocation + 1);
  };

  const handlePreviousLocation = () => {
    if (activeLocation === 0) return;
    handleSetActiveLocation(activeLocation - 1);
  };

  // Add location handler: add empty location locally
  const handleAddLocation = () => {
    const newLoc = {
      name: "",
      city: "",
      address: "",
      phone: "",
      email: "",
      mapQuery: "",
    };
    setLocations((prev) => {
      const updated = [...prev, newLoc];
      setactiveLocation(updated.length - 1);
      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocation((prev) => {
      return { ...prev, [name]: value };
    });
  };

  // Save button: update or create location
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const userId = getUserId();
      if (location._id) {
        await updateLocation(location._id, location, userId);
      } else {
        await postLocation(location, userId);
      }
      setSuccess(true);
    } catch (err) {
      setError("Failed to save location");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const resetLocation = () => {
    setLocation({
      name: "",
      city: "",
      phone: "",
      email: "",
      mapQuery: "",
    });
  };

  const loc = locations[activeLocation];

  // Defensive: ensure loc is defined
  const safeLoc = loc || { name: "", city: "", mapQuery: "" };

  // Filter out locations that are not enabled for preview and tabs
  const enabledLocations = locations.filter((loc) => loc.enabled !== false);
  // Adjust activeLocation index to refer to enabled locations
  const currentEnabledIndex = enabledLocations.findIndex(
    (loc) =>
      loc._id === locations[activeLocation]?._id &&
      activeLocation < locations.length
  );
  // For preview, use the form state if this is the active location
  const previewLoc =
    currentEnabledIndex === -1 && activeLocation === locations.length - 1
      ? location
      : enabledLocations[currentEnabledIndex] &&
        activeLocation ===
          locations.findIndex(
            (l) => l._id === enabledLocations[currentEnabledIndex]?._id
          )
      ? location
      : enabledLocations[currentEnabledIndex] || {
          name: "",
          city: "",
          address: "",
          phone: "",
          email: "",
          mapQuery: "",
        };

  // Defensive: ensure previewLoc is defined
  const safePreviewLoc = previewLoc || { name: "", city: "", mapQuery: "" };

  // Toggle show property for a location
  const handleToggleShow = (index) => {
    setLocations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], show: !updated[index].show };
      // Optionally, update backend here with postLocation(updated[index])
      return updated;
    });
  };

  // Add delete handler
  const handleDeleteLocation = async (id, index) => {
    if (!window.confirm("Are you sure you want to delete this location?"))
      return;
    setLoading(true);
    setError(null);
    try {
      await deleteLocation(id);
      setLocations((prev) => prev.filter((_, i) => i !== index));
      // Adjust activeLocation if needed
      setactiveLocation((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      setError("Failed to delete location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-fit flex flex-col justify-between items-center gap-10 overflow-hidden relative">
      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
          <Spinner />
        </div>
      )}
      {/* Headings  */}
      <TabHeading
        title={"Locations"}
        description={
          "The Location section comes before the footer usually. You can list location of your outlets here."
        }
      />

      {/* Location Preview Section */}
      <div className="w-full h-fit flex flex-col justify-start items-center gap-4">
        <div className="w-full h-fit flex justify-between items-center gap-4">
          <h1 className="w-full inter_med text-black text-[32px] tracking-[-2px]">
            Our locations
          </h1>
          <div className="w-fit h-fit flex justify-center items-center gap-2">
            <button
              onClick={handlePreviousLocation}
              disabled={activeLocation === 0}
              className={`w-fix h-fit aspect-square bg-[#EBEBEC] rounded-full shadow-2xl p-2 ${
                activeLocation === 0
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <ChevronLeft size={24} color="#323232" />
            </button>
            <button
              onClick={handleNextLocation}
              disabled={activeLocation === locations.length - 1}
              className={`w-fix h-fit aspect-square bg-[#EBEBEC] rounded-full shadow-2xl p-2 ${
                activeLocation === locations.length - 1
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <ChevronRight size={24} color="#323232" />
            </button>
          </div>
        </div>

        {/* Location Preview Tabs */}
        <div className="w-full h-fit flex justify-start items-center gap-2 -mt-2">
          {enabledLocations.map((location, index) => (
            <button
              key={index}
              onClick={() =>
                handleSetActiveLocation(
                  locations.findIndex((l) => l._id === location._id)
                )
              }
              className={`w-fit h-fit flex justify-center items-center gap-2 border-2 px-4 py-2.5 rounded-full cursor-pointer transition-all duration-200 ${
                currentEnabledIndex === index
                  ? "bg-[#EFEBFF] border-[#4B21E2]"
                  : "bg-white border-[#EBEBEC] hover:bg-[#F3F0FF]"
              }`}
            >
              <span className="inter_med text-[14px] text-[#4D4D4D]">
                {location.city}
              </span>
            </button>
          ))}
        </div>

        {/* Location Card */}
        {enabledLocations.length > 0 && (
          <div className="w-full h-[380px] bg-[#EBEBEC] flex flex-row gap-6 rounded-[24px] p-5">
            <iframe
              title="Map"
              src={
                previewLoc.mapQuery
                  ? `https://www.google.com/maps?q=${encodeURIComponent(
                      previewLoc.mapQuery
                    )}&output=embed`
                  : ""
              }
              className="w-full aspect-square rounded-[14px] shadow-lg"
            ></iframe>

            <div className="w-full h-full flex flex-col justify-between px-4 py-2">
              <div className="w-full h-fit flex justify-between items-center">
                <div className="w-fit h-fit leading-5">
                  <span className="block inter_reg text-[15px] text-[#4D4D4D]">
                    {previewLoc.name}
                  </span>
                  <span className="block inter_med text-[15px] text-[#0D0D0D]">
                    {previewLoc.city}
                  </span>
                </div>
                <a
                  href={
                    previewLoc.mapQuery
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          previewLoc.mapQuery
                        )}`
                      : undefined
                  }
                  target="_blank"
                  className="w-fit h-fit flex justify-center items-center gap-1.5 border-2 border-[#D6D6D6] px-2.5 py-2 rounded-lg"
                >
                  <span className="inter_reg text-[14px] text-[#0D0D0D]">
                    Get Directions
                  </span>
                  <ChevronRight size={24} color="#323232" />
                </a>
              </div>

              <div className="w-full h-fit">
                <hr className="w-full border border-[#D6D6D6]" />
                <div className="w-full h-fit flex justify-between items-center">
                  <div className="w-full h-fit flex flex-col gap-2 mt-4">
                    <h6 className="inter_reg text-[12px] text-[#4D4D4D]">
                      Address
                    </h6>
                    <span className="block inter_reg text-[12px] text-[#0D0D0D]">
                      {previewLoc.address || "Address not set"}
                    </span>
                  </div>
                  <div className="w-full h-fit flex flex-col gap-2 mt-4">
                    <h6 className="inter_reg text-[12px] text-[#4D4D4D]">
                      Contacts
                    </h6>
                    <span className="block inter_reg text-[12px] text-[#0D0D0D]">
                      {previewLoc.phone || "No phone set"}
                    </span>
                    <span className="block inter_reg text-[12px] text-[#0D0D0D]">
                      {previewLoc.email || "No email set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Section */}
      <div className="w-full h-fit flex flex-col gap-3">
        <h3 className="w-full poppins_med text-[#201F33] text-[14px] px-4">
          Edit
        </h3>

        {/* Two-column layout */}
        <div className="w-full h-fit flex flex-row gap-0 ] overflow-hidden">
          {/* Left Column */}
          <div className="w-[50%]  p-4 flex flex-col gap-4">
            <div className="w-full flex flex-col gap-2">
              {locations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleSetActiveLocation(index)}
                  className={`w-full text-left px-4 py-2.5 rounded-[8px] border-2 transition-all duration-200 ${
                    activeLocation === index
                      ? "border-[#4B21E2] "
                      : "border-[#EBEBEC] "
                  }`}
                >
                  <span className="inter_med text-[14px] text-[#4D4D4D]">
                    {location.city || "City name"}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={handleAddLocation}
              className="w-full h-fit flex justify-center items-center gap-2 border-2 border-[#4B21E2] rounded-[8px] px-4 py-3 cursor-pointer"
            >
              <span className="poppins_reg text-[#4B21E2] text-[15px]">
                Add more
              </span>
              <Plus size={16} color="#4B21E2" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-[1px] bg-[#E8E6ED]" />

          {/* Right Column: Form */}
          <div className="w-[65%] px-6 py-4 flex flex-col gap-4">
            <div className="w-full flex justify-between items-center">
              <h3 className="poppins_reg text-[#0D0D0D] text-[18px]">
                {safeLoc.city || "City name"}
              </h3>
              <SmButton onClick={handleSave} title={"Save"} />
            </div>

            <form className="w-full h-fit flex flex-col gap-4 mt-2">
              {/* Form fields remain the same */}
              <div>
                <label className="poppins_med text-[14px] text-black">
                  Outlet name
                </label>
                <TextInput
                  name={"name"}
                  placeholder={"Enter Outlet name"}
                  value={location.name}
                  onChange={handleChange}
                  styles="text-[#201F33] placeholder:text-[#201F33]"
                />
              </div>
              <div>
                <label className="poppins_med text-[14px] text-black">
                  City
                </label>
                <TextInput
                  name={"city"}
                  placeholder={"Enter City"}
                  value={location.city}
                  onChange={handleChange}
                  styles="text-[#201F33] placeholder:text-[#201F33]"
                />
              </div>
              <div>
                <label className="poppins_med text-[14px] text-black">
                  Location
                </label>
                <TextInput
                  name={"mapQuery"}
                  placeholder={"Enter location"}
                  value={location.mapQuery}
                  onChange={handleChange}
                  styles="text-[#201F33] placeholder:text-[#201F33]"
                />
              </div>
              <div>
                <label className="poppins_med text-[14px] text-black">
                  Contact number
                </label>
                <TextInput
                  name={"phone"}
                  placeholder={"Enter Mobile no"}
                  value={location.phone}
                  onChange={handleChange}
                  styles="text-[#201F33] placeholder:text-[#201F33]"
                />
              </div>
              <div>
                <label className="poppins_med text-[14px] text-black">
                  E-mail
                </label>
                <TextInput
                  name={"email"}
                  placeholder={"Enter email here "}
                  value={location.email}
                  onChange={handleChange}
                  styles="text-[#201F33] placeholder:text-[#201F33]"
                />
              </div>
              <div>
                <label className="poppins_med text-[14px] text-black">
                  Address <span className="text-red-500">*</span>
                </label>
                <TextInput
                  name={"address"}
                  placeholder={"Enter address"}
                  value={location.address}
                  onChange={handleChange}
                  styles="text-[#201F33] placeholder:text-[#201F33]"
                  required
                />
              </div>

              {/* Delete Button */}
              {loc && loc._id && (
                <div className="w-full flex justify-end mt-4">
                  <SmButton
                    title="Delete"
                    onClick={() =>
                      handleDeleteLocation(loc._id, activeLocation)
                    }
                    styles="bg-red-500 text-white px-4 py-2 rounded"
                  />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Locations;
