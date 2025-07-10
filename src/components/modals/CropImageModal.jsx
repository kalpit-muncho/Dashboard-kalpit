import React, { useState, useCallback, useMemo, useContext } from "react";
import Cropper from "react-easy-crop";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import Button from "../Button";
import { styled } from "@mui/material/styles";
import DashboardContext from "../../contexts/dashboardContext";
import getCroppedImg from "../../utils/cropImage"; // Ensure correct path

const HiddenInput = styled("input")({
    display: "none",
});

const CropImageModal = ({ image, cropWidth, cropHeight }) => {
    const { setImageModal, setCropData } = useContext(DashboardContext);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [newImage, setNewImage] = useState(null);

    const handleSave = async () => {
        if (croppedAreaPixels && (newImage || image)) {
            try {
                const croppedImage = await getCroppedImg(newImage || image, croppedAreaPixels);
                setCropData(croppedImage);  // Save actual cropped image URL
                setImageModal(false);
            } catch (error) {
                console.error("Error cropping image:", error);
            }
        }
    };
    
    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // Only use cropWidth and cropHeight to calculate the aspect ratio
    const calculatedAspectRatio = useMemo(
        () => (cropWidth && cropHeight ? cropWidth / cropHeight : 4 / 3),
        [cropWidth, cropHeight]
    );

    // Store the actual cropped area pixels without modifying their dimensions
    const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    return (
        <div className="absolute bg-black/85 flex justify-center items-center w-full h-full p-6" style={{ zIndex: 1000 }}>
            <div className="flex flex-col relative bg-white rounded-lg overflow-hidden w-[60vw] h-[75vh]">
                <div className="relative flex fex-col h-full">
                    <Cropper
                        image={newImage || image}
                        crop={crop}
                        zoom={zoom}
                        aspect={calculatedAspectRatio}
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropComplete={handleCropComplete}
                        onZoomChange={setZoom}
                        classes={{ containerClassName: "w-full h-full", cropAreaClassName: "border-2 border-white" }}
                    />
                </div>
                <div className="flex items-center justify-between py-4 px-4">
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="small" onClick={() => document.getElementById("fileInput").click()}>
                            <HiddenInput type="file" multiple={false} accept="image/*" onChange={handleFileChange} id="fileInput" />
                            <FindReplaceIcon fontSize="small" />
                            <span>Replace</span>
                        </Button>
                        {/* <button className="p-2 flex items-center justify-center bg-[#F8F7FA] hover:bg-gray-200 rounded-full cursor-pointer w-fit h-fit" onClick={() => setImageModal(false)}>
                            <DeleteOutlineIcon className="text-[#323232]" fontSize="small" />
                        </button> */}
                    </div>
                    <div className="flex gap-2 h-fit">
                        <Button variant="secondary" size="small" onClick={() => setImageModal(false)}>
                            <span>Cancel</span>
                        </Button>
                        <Button variant="primary" size="small" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropImageModal;