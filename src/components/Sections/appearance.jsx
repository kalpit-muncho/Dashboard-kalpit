import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../utils/cropImage";
import {
  uploadImageToMuncho,
  fetchAppearance,
  postAppearance,
  updateAppearance,
  deleteAppearance,
} from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";

function Appearance() {
  const [logo, setLogo] = useState(null);
  const [logoId, setLogoId] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const userId = String(getUserId());
        const data = await fetchAppearance(userId);
        if (data && data.logo) {
          setLogo(data.logo);
          setLogoId(data._id || data.id);
        }
      } catch (e) {}
    };
    fetchLogo();
  }, []);

  return (
    <div className=" mx-auto bg-white p-8 rounded-lg shadow">
      <button
        className="mb-6 flex items-center gap-2 text-[#4B21E2] hover:underline"
        onClick={() => window.history.back()}
      >
        ← Back to Sections
      </button>
      <h2 className="text-xl font-semibold mb-4">Upload Logo</h2>
      <input
        type="file"
        accept="image/*"
        id="logo-upload"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (file) {
            setSelectedImage(URL.createObjectURL(file));
            setCropModalOpen(true);
          }
        }}
      />
      <label
        htmlFor="logo-upload"
        className="block w-full cursor-pointer border-2 border-dashed border-[#4B21E2] rounded-lg p-6 text-center hover:bg-[#F3F0FF]"
      >
        {logoLoading ? (
          <span className="flex flex-col items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-[#4B21E2] mx-auto mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            <span className="text-[#4B21E2]">Uploading...</span>
          </span>
        ) : logo ? (
          <img
            src={logo}
            alt="Logo Preview"
            className="mx-auto h-24 object-contain"
          />
        ) : (
          <span className="text-[#4B21E2]">Click to upload logo</span>
        )}
      </label>
      {logo && !logoLoading && (
        <button
          className="mt-4 text-red-500 hover:underline"
          onClick={async () => {
            if (!logoId) return;
            setLogoLoading(true);
            try {
              const userId = String(getUserId());
              await deleteAppearance(logoId, userId);
              setLogo(null);
              setLogoId(null);
            } catch (err) {
              alert("Failed to delete logo");
            } finally {
              setLogoLoading(false);
            }
          }}
        >
          Remove Logo
        </button>
      )}
      {/* Cropper Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg relative w-[90vw] max-w-md">
            <h3 className="mb-4 text-lg font-semibold">Crop Logo</h3>
            <div className="relative w-full h-64 bg-gray-100">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) =>
                  setCroppedAreaPixels(croppedAreaPixels)
                }
              />
              {logoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                  <svg
                    className="animate-spin h-10 w-10 text-[#4B21E2]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-4">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => {
                  setCropModalOpen(false);
                  setSelectedImage(null);
                }}
                disabled={logoLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#4B21E2] text-white rounded"
                onClick={async () => {
                  setLogoLoading(true);
                  try {
                    const croppedBlob = await getCroppedImg(
                      selectedImage,
                      croppedAreaPixels
                    );
                    const croppedFile = new File(
                      [croppedBlob],
                      "cropped_logo.png",
                      { type: "image/png" }
                    );
                    const userId = String(getUserId());
                    const fileUrl = await uploadImageToMuncho(
                      croppedFile,
                      `logo/${userId}`
                    );
                    setLogo(fileUrl);
                    if (!logoId) {
                      const res = await postAppearance(fileUrl, userId);
                      setLogoId(res._id || res.id);
                    } else {
                      await updateAppearance(logoId, fileUrl, userId);
                    }
                    setCropModalOpen(false);
                    setSelectedImage(null);
                  } catch (err) {
                    alert("Failed to upload logo");
                  } finally {
                    setLogoLoading(false);
                  }
                }}
                disabled={logoLoading}
              >
                {logoLoading ? "Uploading..." : "Crop & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appearance;
