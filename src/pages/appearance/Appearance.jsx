import React, { useState, useContext, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import { Radio } from "@mui/material";
import { uploadFiles } from "../../utils/fileUploader";

import ColorPicker from "../../components/ColorPicker";
import DashboardContext from "../../contexts/dashboardContext";
import LinkCard from "../../components/LinkCard";
import Loading from "../../components/Loading";

import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';

import { toast } from "react-toastify";

import { fetchAppearance, updateAppearance } from "../../models/AppearanceModel";

// Drag and Drop Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    TouchSensor,
    MouseSensor,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const Appearance = () => {
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState("light");
    const [fonts, setFonts] = useState({ heading: "", body: "" });
    const [image, setImage] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [selectedColor, setSelectedColor] = useState("#123AAA");
    const [appearanceUpadating, setAppearanceUpdating] = useState(false);
    const [appearance, setAppearance] = useState(null);
    const { setLinksModal, links, setLinks, setImageModal, setImageModalProps, cropData, setCropData, setUpdateMenuModal, setModalData } = useContext(DashboardContext);
    const { restaurant } = useOutletContext();

    useEffect(() => {
        if (!cropData || !(cropData instanceof File)) {
            return;
        }
        handleImageCrop(cropData);
        return () => {
            setImage(null);
            setImageModal(false);
            setImageModalProps(null);
            setCropData(null);
        }
    }, [cropData]);

    useEffect(() => {
        const getAppearance = async () => {
            try {
                setLoading(true);
                const appearanceData = await fetchAppearance();
                setAppearance(appearanceData);
                setTheme(appearanceData.theme);
                setFonts(appearanceData.fonts);
                setSelectedColor(appearanceData.primaryColor);
                setImage(appearanceData.homeScreenImageUrl);
                setLinks(appearanceData.links);
            } catch (error) {
                setLoading(false);
                console.error("Error fetching appearance data:", error);
            } finally {
                setLoading(false);
            }
        };
        getAppearance();
    }, [])

    const resetAppearance = () => {
        setTheme(appearance.theme);
        setFonts(appearance.fonts);
        setSelectedColor(appearance.primaryColor);
        setImage(appearance.homeScreenImageUrl);
        setLinks(appearance.links);
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file || !(file instanceof File)) {
            console.error("Invalid file:", file);
            return;
        }
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageModalProps({
                image: reader.result,
                cropWidth: 200,
                cropHeight: 330,
            });
            setImageModal(true);
        };
        reader.readAsDataURL(file);
    }

    const handleImageCrop = async (croppedImage) => {
        try {
            // Always clean up previous preview URL if it exists
            if (image?.preview && typeof image !== 'string') {
                URL.revokeObjectURL(image.preview);
            }

            const preview = URL.createObjectURL(croppedImage);
            setImage({
                file: croppedImage,
                preview: preview,
                name: croppedImage.name || "cropped-image"
            });

            setImageModal(false);
            toast.success("Image cropped successfully", {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
            });
        } catch (error) {
            console.error("Error cropping image:", error);
            toast.error("Error cropping image", {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
            });
        }
    };

    const clearFile = () => {
        // Clean up preview URL only if it's a cropped image (object with preview)
        if (image?.preview && typeof image !== 'string') {
            URL.revokeObjectURL(image.preview);
        }
        setImage(null);
        setImageModal(false);
        setImageModalProps(null);
        document.getElementById("fileInput").value = "";
    };

    const handleActiveIndex = (index) => {
        if (activeIndex === index) {
            setActiveIndex(null);
        }
        else {
            setActiveIndex(index);
        }
    }

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!active || !over || active.id === over.id) return;

        setLinks((prevLinks) => {
            const oldIndex = prevLinks.findIndex((link) => link.id === active.id);
            const newIndex = prevLinks.findIndex((link) => link.id === over.id);

            const updatedLinks = arrayMove(prevLinks, oldIndex, newIndex);

            return updatedLinks.map((link, index) => ({
                ...link,
                priority: index + 1,
            }));
        });
    };

    const Spinner = () => {
        return (
            <div className="flex justify-center items-center w-full h-full">
                <svg className="text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                    <path
                        d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                        stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path
                        d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                        stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    </path>
                </svg>
            </div>
        )
    }

    const handleUpdateAppearance = async (e) => {
        e.preventDefault();

        try {
            setAppearanceUpdating(true);
            let imageUrl = image;
            if (image instanceof File || image?.file instanceof File) {
                const fileToUpload = image.file || image;
                const path = `image/home_bg/${fileToUpload.name}`;
                imageUrl = await uploadFiles(fileToUpload, path);
            }

            // Ensure color is a string
            const colorValue = typeof selectedColor === 'object' ? selectedColor.color : selectedColor;

            const appearanceData = {
                theme: theme,
                primaryColor: colorValue,
                headingFont: fonts.heading,
                baseFont: fonts.body,
                homescreenImageUrl: imageUrl,
                customButtons: links
            };

            const res = updateAppearance(appearanceData);
            toast.promise(res, {
                pending: "Updating appearance...",
                success: "Appearance updated successfully",
                error: "Error updating appearance",
            }, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });

            const data = await res;
            console.log("Appearance updated successfully:", data);

        } catch (err) {
            setAppearanceUpdating(false);
            console.error("Error updating appearance:", err.message);
            toast.error("Error updating appearance", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } finally {
            setAppearanceUpdating(false);
        }
    }

    const handleUpdateMenu = async () => {
        setUpdateMenuModal(true);
        setModalData({ outlets: restaurant.outlets });
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <main className="flex flex-col w-full h-full px-[24px]">
            <div className="flex justify-between items-start w-full pt-4 pb-8">
                <h1 className="text-2xl font-medium mb-3 sm:mb-0 text-[#201F33]">Appearance</h1>
                <Button variant="primary" size="small" className="font-medium" onClick={handleUpdateMenu} >
                    <AutorenewIcon /> Update Menu
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row w-full h-full">
                {/* Theme and Font Section */}
                <div className="flex flex-col gap-6 w-full lg:w-1/2 pr-8 border-b-2 lg:border-b-0 lg:border-r-2 border-[#E8E6ED] pb-6 lg:pb-0">
                    <div className="flex w-full h-fit flex-col gap-y-[16px]">
                        <h2 className="text-lg font-medium">Theme</h2>
                        <div className="flex w-full gap-4">
                            <button
                                className="bg-[#F8F7FA] hover:bg-gray-200 flex justify-between items-center gap-3 px-3 py-2.5 rounded-xl w-fit md:w-1/2 cursor-pointer"
                                onClick={() => setTheme("light")}
                            >
                                <div className="flex items-center gap-3">
                                    <LightModeOutlinedIcon className="text-[#323232]" fontSize="small" />
                                    <span className="font-medium text-sm">Light Theme</span>
                                </div>
                                <Radio
                                    checked={theme === "light"}
                                    onChange={() => setTheme("light")}
                                    value="light"
                                    name="radio-buttons"
                                    sx={{
                                        padding: 0,
                                        color: "#323232",
                                        "&.Mui-checked": {
                                            color: "#323232",
                                        },
                                    }}
                                />
                            </button>

                            <button
                                className="bg-[#F8F7FA] hover:bg-gray-200 flex justify-between items-center gap-3 px-3 py-2.5 rounded-xl w-fit md:w-1/2 cursor-pointer"
                                onClick={() => setTheme("dark")}
                            >
                                <div className="flex items-center gap-3">
                                    <NightsStayOutlinedIcon className="text-[#323232]" fontSize="small" />
                                    <span className="font-medium text-sm">Dark Theme</span>
                                </div>
                                <Radio
                                    checked={theme === "dark"}
                                    onChange={() => setTheme("dark")}
                                    value="light"
                                    name="radio-buttons"
                                    sx={{
                                        padding: 0,
                                        color: "#323232",
                                        "&.Mui-checked": {
                                            color: "#323232",
                                        },
                                    }}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Home Screen Image */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium">Home Screen Image</h2>
                            <Button variant="secondary" size="small" className="font-medium relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".jpg, .jpeg, .png"
                                    onChange={handleImageChange}
                                    id="fileInput"
                                    style={{ zIndex: 10 }}
                                />
                                Upload Image
                            </Button>
                        </div>
                        {image && (
                            <div className="flex items-center gap-3 text-[#5C5C7A] px-3 py-2 rounded-xl bg-[#EEEBFA] border-1 border-[#E8E6ED] w-fit max-w-md relative">
                                {typeof image === 'string' ? (
                                    <img src={image} alt="Home screen" className="max-h-20" />
                                ) : image?.preview ? (
                                    <img
                                        src={image.preview}
                                        alt="Cropped preview"
                                        className="max-h-20"
                                        onLoad={() => {
                                            // Revoke the object URL after the image loads to free memory
                                            if (image.preview) URL.revokeObjectURL(image.preview);
                                        }}
                                    />
                                ) : (
                                    <span className="font-medium text-xs">
                                        {image?.name || 'Uploaded Image'}
                                    </span>
                                )}
                                <button className="p-1 rounded-md cursor-pointer" onClick={clearFile}>
                                    <CloseIcon fontSize="small" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Link and Color Section */}
                <div className="flex flex-col gap-6 w-full h-[calc(100vh-92px)] lg:w-1/2 px-2 pl-14 pr-[10vw]">
                    <div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium">Link</h2>
                            <Button variant="secondary" size="small" className="font-medium text-sm" onClick={() => { setLinksModal(true) }}>Add custom link</Button>
                        </div>
                        <div className="flex w-full h-fit overflow-auto flex-shrink-0">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                                modifiers={[restrictToVerticalAxis]}
                            >
                                <SortableContext
                                    items={links}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="flex flex-col gap-2 pt-4 w-full h-full">
                                        {links.length === 0 && (
                                            <div className="flex justify-center items-center w-full h-fit pt-[24px]">
                                                <h3 className="text-lg font-medium text-[#5C5C7A]">No links added yet</h3>
                                            </div>
                                        )}
                                        {[...links]
                                            .sort((a, b) => a.priority - b.priority)
                                            .map((link, index) => (
                                                <LinkCard
                                                    key={link.id}
                                                    id={link.id}
                                                    title={link.title}
                                                    icon={link.icon}
                                                    link={link.link}
                                                    active={link.active}
                                                    cardActive={activeIndex === index}
                                                    onClick={() => { handleActiveIndex(index) }}

                                                />
                                            ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                    <div className="flex flex-col w-full h-full justify-between items-center pb-4">
                        <div className="flex flex-col w-full gap-[16px]">
                            <div className="flex flex-col gap-[12px] w-full h-fit">
                                <div className="flex justify-between w-full">
                                    <h3 className="text-lg font-medium">Color</h3>
                                </div>
                                <div className="flex justify-center items-center w-full max-w-full h-fit">
                                    <ColorPicker
                                        color={selectedColor || "#123AAA"}
                                        onChange={setSelectedColor}
                                    />
                                </div>
                            </div>
                            <div className='flex justify-end items-center gap-4 w-full pt-4'>
                                <button className='flex justify-center items-center px-4 py-2 bg-[#F8F7FA] font-medium text-sm rounded-[8px] cursor-pointer' onClick={() => resetAppearance()} >Cancel</button>
                                <button className='flex justify-center items-center px-4 py-2 bg-[#4B21E2] font-medium text-sm text-white rounded-[8px] cursor-pointer' onClick={(e) => { handleUpdateAppearance(e) }}>{appearanceUpadating ? <Spinner /> : <>Save</>}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Appearance;