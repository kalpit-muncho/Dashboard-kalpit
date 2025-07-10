import React, { useState, useContext, useEffect } from 'react'
import Tabs from './Tabs'
import Button from './Button'
import Textarea from './TextArea';
import UpsellsItemCard from './UpsellsItemCard';
import SearchBar from './SearchBar';

import { styled } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import { updateDish } from '../models/MenuModel.jsx';
import { uploadFiles } from '../utils/fileUploader.jsx';
import { toast } from "react-toastify";
import Spinner from './Spinner';

import DashboardContext from '../contexts/dashboardContext';


const HiddenInput = styled("input")({
    display: "none",
});

const FileInput = ({ placeholder, onFilesChange, video, images, menuType }) => {

    const isMaxFilesReached = menuType === "petpooja" ?
        video !== null :
        (video && images.length >= 3);

    if (isMaxFilesReached) {
        return null;
    }

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);

        if (menuType === "petpooja") {
            // Only allow videos for petpooja
            const videos = selectedFiles.filter((file) => file.type.startsWith("video/"));
            const images = selectedFiles.filter((file) => file.type.startsWith("image/"));

            if (images.length > 0) {
                toast.error("Image upload is not allowed for PetPooja menu type. Only videos are supported.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                return;
            }

            if (videos.length > 1) {
                toast.error("You can only upload 1 video at a time.", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                return;
            }

            if (onFilesChange) {
                onFilesChange(videos);
            }
        } else {
            // Original logic for other menu types
            const images = selectedFiles.filter((file) => file.type.startsWith("image/"));
            const videos = selectedFiles.filter((file) => file.type.startsWith("video/"));

            if (videos.length > 1 || images.length > 1) {
                toast.error("You can only upload up to 3 images and 1 video at a time.", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                return;
            }

            if (onFilesChange) {
                onFilesChange(selectedFiles);
            }
        }
    };

    return (
        <label className="flex flex-col items-center justify-center w-full min-h-[140px] bg-[#F8F7FA] rounded-xl cursor-pointer">
            <HiddenInput
                type="file"
                multiple={false}
                accept={menuType === "petpooja" ? "video/*" : "image/*,video/*"}
                onChange={handleFileChange}
            />
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.875 14.667V5.15866L4.95 8.19199L3.375 6.50033L9 0.666992L14.625 6.50033L13.05 8.19199L10.125 5.15866V14.667H7.875ZM2.25 19.3337C1.63125 19.3337 1.10175 19.1054 0.6615 18.6488C0.22125 18.1923 0.00075 17.6428 0 17.0003V13.5003H2.25V17.0003H15.75V13.5003H18V17.0003C18 17.642 17.7799 18.1915 17.3396 18.6488C16.8994 19.1062 16.3695 19.3344 15.75 19.3337H2.25Z" fill="#B9B9C7" />
            </svg>

            <p className="text-md py-1 text-center w-[100px] font-medium text-[#B9B9C7]">Upload</p>
            <p className="text-md py-1 text-[#B9B9C7]">{placeholder}</p>
        </label>
    );
};


const Dropdown = ({ label, options, onChange, value, icon: Icon = KeyboardArrowDownOutlinedIcon, defaultValue }) => {
    const StyledSelect = styled(Select)(() => ({
        '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
        },
        backgroundColor: '#F8F7FA',
        borderRadius: '8px',
        '& .MuiSelect-select': {
            padding: '8px 12px',
            fontSize: '13px',
            fontFamily: 'Satoshi, sans-serif',
        },
        '& .MuiOutlinedInput-input': {
            fontSize: '13px',
            fontFamily: 'Satoshi, sans-serif',
        },
        '& .MuiSvgIcon-root': {
            color: '#5C5C7A',
            fontSize: '13px',
        },
        color: '#5C5C7A',
        fontWeight: '600',
        fontSize: '14px',
        fontFamily: 'Satoshi, sans-serif',
    }));


    return (
        <FormControl fullWidth>
            <StyledSelect
                id={`${label}-select`}
                onChange={onChange}
                value={value}
                IconComponent={Icon}
                displayEmpty
                defaultValue={defaultValue}
            >
                <MenuItem value="" disabled>
                    {label}
                </MenuItem>
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </StyledSelect>
        </FormControl>
    );
};

const DishDetails = ({ dish, dishes, tagsList, menuType, outletsData, addonGroups }) => {
    const { name } = dish || {}
    const tabs = ["Details", "Upsells", "Add Ons"];
    const [outlets, setOutlets] = useState([])
    const [activeTab, setActiveTab] = useState(tabs[0])
    const [upsellingDishes, setUpsellingDishes] = useState(dish?.upsellDishes || []);
    const [filteredDishes, setFilteredDishes] = useState([]);
    const [addItems, setAddItems] = useState(false);
    const [text, setText] = useState(dish?.description || "");
    const [spicyMeter, setSpicyMeter] = useState(false);
    const [type, setType] = useState('');
    const [tagsListState, setTagsList] = useState(tagsList);
    const [tags, setTags] = useState(dish?.tags || []);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState(dish?.upsellDishes || []);
    const [displayedUpsells, setDisplayedUpsells] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [customTag, setCustomTag] = useState("");
    const [selectedAddonGroups, setSelectedAddonGroups] = useState([]);

    const [images, setImages] = useState([]);
    const [video, setVideo] = useState(null);

    const [areTagsExpanded, setAreTagsExpanded] = useState(false);
    const initialVisibleCount = 4;

    useEffect(() => {
        const loadDishData = async () => {
            try {
                if (dish) {
                    console.table("Outlets from menu: ", outletsData);
                    // Reset states first
                    setImages([]);
                    setVideo(null);

                    setType(dish.type || "");
                    setTags(dish.tags || []);
                    setSelectedTags(dish.tags || []);
                    setText(dish.description || "");
                    setOutlets(dish.outlets || []);
                    setSpicyMeter(dish.hasSpicyMeter || false);
                    setUpsellingDishes(dish.upsellDishes || []);
                    setSelectedItems(dish.upsellDishes || []);
                    setDisplayName(dish.displayName || "");
                    // Filter out deleted addon group IDs
                    const validAddonGroupIds = (dish.addOns || []).filter(id =>
                        (addonGroups || []).some(group => group.external_addon_id === id)
                    );
                    setSelectedAddonGroups(validAddonGroupIds);

                    // Set video after reset
                    if (dish.videoUrl) {
                        setVideo(dish.videoUrl);
                    }

                    // Set images after reset
                    if (dish.imageUrls && dish.imageUrls.length > 0) {
                        const formattedImages = dish.imageUrls.map(url => ({
                            previewUrl: url,
                            isExisting: true
                        }));
                        setImages(formattedImages);
                    }
                } else {
                    // Reset all states if no dish
                    setImages([]);
                    setVideo(null);
                    setType("");
                    setTags([]);
                    setSelectedTags([]);
                    setText("");
                    setOutlets([]);
                    setSpicyMeter(false);
                    setUpsellingDishes([]);
                    setSelectedItems([]);
                    setSelectedAddonGroups([]);
                }

                setFilteredDishes(dishes || []);
            } catch (err) {
                console.error("Error loading dish data:", err);
            }
        };

        loadDishData();
        return () => {
            // Cleanup function to reset states if needed
            setImages([]);
            setVideo(null);
            setType("");
            setTags([]);
            setSelectedTags([]);
            setText("");
            setOutlets([]);
            setSpicyMeter(false);
            setUpsellingDishes([]);
            setSelectedItems([]);
        }
    }, [dish, dishes, tagsList]);

    // Set up displayed upsells whenever upsellingDishes or dishes changes
    useEffect(() => {
        if (upsellingDishes && dishes) {
            const upsellsToDisplay = dishes.filter(d =>
                Array.isArray(upsellingDishes) && upsellingDishes.includes(d.id)
            );
            setDisplayedUpsells(upsellsToDisplay);
        }
    }, [upsellingDishes, dishes, addItems]);

    const renderFilePreviews = () => {
        return (
            <>
                {images.length > 0 && images.map((image, index) => (
                    <div className='relative w-[90px] h-[75px] rounded-md overflow-hidden' key={index}>
                        <button
                            className="flex items-center justify-center absolute right-1 top-1 w-fit h-fit p-1.5 bg-[#F8F7FA] rounded-full hover:bg-gray-400 text-[#5C5C7A] hover:text-white cursor-pointer"
                            onClick={() => handleDeleteImages(index)}
                        >
                            <DeleteIcon fontSize='15' />
                        </button>
                        <img
                            src={image.previewUrl}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
                {video && (
                    <div className='relative w-[90px] h-[75px] rounded-md overflow-hidden'>
                        <button
                            className="flex items-center justify-center absolute right-1 top-1 w-fit h-fit p-1.5 bg-[#F8F7FA] rounded-full hover:bg-gray-400 text-[#5C5C7A] hover:text-white cursor-pointer"
                            onClick={() => handleDeleteVideo()}
                            style={{ zIndex: 10 }}
                        >
                            <DeleteIcon fontSize='15' />
                        </button>
                        <video
                            src={typeof video === 'string' ? video : URL.createObjectURL(video)}
                            alt="Video preview"
                            controls={false}
                            autoPlay
                            muted
                            loop
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </>
        );
    };

    const CustomSwitch = styled(Switch)(() => ({
        width: 32,
        height: 16,
        padding: 0,
        "& .MuiSwitch-switchBase": {
            padding: 2,
            "&.Mui-checked": {
                transform: "translateX(16px)",
                color: "#fff",
                "& + .MuiSwitch-track": {
                    backgroundColor: ("#5C5C7A"),
                    opacity: 1,
                },
            },
            "&.Mui-disabled": {
                opacity: 0.5,
                "& + .MuiSwitch-track": {
                    backgroundColor: "#ABABC8",
                    opacity: 0.3,
                },
            },
        },
        "& .MuiSwitch-thumb": {
            width: 12,
            height: 12,
        },
        "& .MuiSwitch-track": {
            borderRadius: 20 / 2,
            backgroundColor: ("#ABABC8"),
            opacity: 1,
        },
    }));

    const handleTypeChange = (e) => {
        setType(e.target.value);
    }

    useEffect(() => {
        if (dish?.tags) {
            console.log("Initial Tags:", dish.tags);
            setTags(dish.tags);
        }
    }, [dish]);

    const handleTagSelect = (tagId) => {
        tagId = tagId.toString();
        setSelectedTags(prevTags => {
            // If tag is already selected, remove it
            if (prevTags.includes(tagId)) {
                return prevTags.filter(tag => tag !== tagId);
            }

            // Check if we've reached the maximum allowed tags (2)
            if (prevTags.length >= 2) {
                toast.warn("You can select a maximum of 2 tags", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                return prevTags;
            }

            // Add the new tag
            return [...prevTags, tagId];
        });
    };

    const isTagActive = (tagId) => {
        return selectedTags.includes(tagId.toString());
    }

    const visibleTags = (() => {
        if (areTagsExpanded) {
            return tagsListState; // Show all when expanded
        }

        // Always show selected tags first
        const selectedTagsFirst = [...tagsListState].sort((a, b) =>
            isTagActive(b.id) - isTagActive(a.id)
        );

        // Get the first N tags, but make sure all selected ones are visible
        const visible = selectedTagsFirst.slice(0, initialVisibleCount);
        const hasAllSelected = selectedTags.every(tagId =>
            visible.some(tag => tag.id.toString() === tagId.toString())
        );

        if (!hasAllSelected) {
            // If not all selected tags are visible, add the missing ones
            const missingSelected = tagsListState.filter(tag =>
                selectedTags.includes(tag.id.toString()) &&
                !visible.includes(tag)
            );
            return [...new Set([...visible, ...missingSelected])];
        }

        return visible;
    })();

    const onTabChange = (index) => {
        setActiveTab(tabs[index]); // Update the active tab
    };

    const handleTextChange = (value) => {
        setText(value);
        console.log("Text changed:", text);
    };

    const onFilesChange = (newFiles) => {
        if (menuType === "petpooja") {
            // Handle only video files for petpooja
            for (const file of newFiles) {
                if (file.type.startsWith('video/')) {
                    if (!video) {
                        setVideo(file);
                    } else {
                        toast.warn('Only one video allowed', {
                            position: "top-right",
                            autoClose: 2000,
                            theme: "dark",
                        });
                    }
                }
            }
        } else {
            // Original logic for other menu types
            let imageCount = images.length;
            let hasVideo = video !== null;

            for (const file of newFiles) {
                if (file.type.startsWith('image/')) {
                    if (imageCount < 3) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setImageModalProps({
                                image: reader.result,
                                cropWidth: 400,
                                cropHeight: 400,
                            });
                            setImageModal(true);
                        };
                        reader.readAsDataURL(file);
                    } else {
                        toast.warn('Maximum 3 images allowed', {
                            position: "top-right",
                            autoClose: 2000,
                            theme: "dark",
                        });
                    }
                } else if (file.type.startsWith('video/')) {
                    if (!hasVideo) {
                        setVideo(file);
                        hasVideo = true;
                    } else {
                        toast.warn('Only one video allowed', {
                            position: "top-right",
                            autoClose: 2000,
                            theme: "dark",
                        });
                    }
                } else {
                    toast.warn('Unsupported file type', {
                        position: "top-right",
                        autoClose: 2000,
                        theme: "dark",
                    });
                }
            }
        }
    };


    const handleOnclick = () => {
        setAddItems(!addItems);
        // Reset filtered dishes when toggling adding items mode
        setFilteredDishes(dishes || []);
    }

    // Addons related state and functions
    const [addAddons, setAddAddons] = useState(false);
    const [isUpdatingUpsells, setIsUpdatingUpsells] = useState(false);
    const [isUpdatingAddons, setIsUpdatingAddons] = useState(false);

    const handleAddAddonsClick = () => {
        setAddAddons(!addAddons);
        // Reset selected addon groups when toggling add addons mode
        setSelectedAddonGroups(dish?.addOns || []);
    }

    // Dedicated handler for updating addons
    const handleAddAddons = async () => {
        setIsUpdatingAddons(true);
        const toastConfig = {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        };
        try {
            // Only include valid addon group IDs
            const validAddonGroupIds = selectedAddonGroups.filter(id =>
                addonGroups.some(group => group.external_addon_id === id)
            );
            const updatedDish = {
                addons: validAddonGroupIds,
                upsellDishes: selectedItems, // Always send current upsells too
            };
            const response = updateDish(updatedDish, dish.id);
            toast.promise(
                response,
                {
                    pending: 'Adding addons...',
                    success: 'Addons added successfully!',
                    error: 'Error adding addons',
                },
                toastConfig
            );
            const res = await response;
            if (res.status) {
                dish.addOns = validAddonGroupIds;
                setModalData({ updatedDish: { ...dish, id: dish.id } });
            }
            setAddAddons(false);
        } catch (error) {
            console.error('Error adding addons', error);
            toast.error('Error adding addons', toastConfig);
        } finally {
            setIsUpdatingAddons(false);
        }
    };

    // Dedicated handler for updating upsells
    const handleAddUpsells = async () => {
        setIsUpdatingUpsells(true);
        const toastConfig = {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        };
        try {
            const updatedDish = {
                upsellDishes: selectedItems,
                addons: selectedAddonGroups, // Always send current addons too
            };
            const response = updateDish(updatedDish, dish.id);
            toast.promise(
                response,
                {
                    pending: 'Adding upsells...',
                    success: 'Upsells added successfully!',
                    error: 'Error adding upsells',
                },
                toastConfig
            );
            const res = await response;
            if (res.status) {
                dish.upsellDishes = selectedItems;
                setUpsellingDishes(selectedItems);
                // Update displayed upsells after saving
                const upsellsToDisplay = dishes.filter(d => selectedItems.includes(d.id));
                setDisplayedUpsells(upsellsToDisplay);
                setModalData({ updatedDish: { ...dish, id: dish.id } });
            }
            setAddItems(false);
        } catch (error) {
            console.error('Error adding upsells', error);
            toast.error('Error adding upsells', toastConfig);
        } finally {
            setIsUpdatingUpsells(false);
        }
    };

    const handleSearch = (e) => {
        const searchText = e.target.value.toLowerCase();

        if (addItems) {
            // When in add mode, filter all dishes
            const filteredResults = dishes.filter((dish) =>
                dish.name.toLowerCase().includes(searchText)
            );
            setFilteredDishes(searchText === "" ? dishes : filteredResults);
        } else {
            // When in view mode, filter only upsell dishes
            const filteredUpsells = displayedUpsells.filter((dish) =>
                dish.name.toLowerCase().includes(searchText)
            );
            setDisplayedUpsells(searchText === "" ?
                dishes.filter(d => upsellingDishes.includes(d.id)) :
                filteredUpsells
            );
        }
    }

    const { setImageModal, setImageModalProps, cropData, setCropData, setModalData } = useContext(DashboardContext);

    const handleDeleteImages = (index) => {
        setImages(prev => {
            const newImages = [...prev];
            // Revoke the object URL to prevent memory leaks
            if (!newImages[index].isExisting) {
                URL.revokeObjectURL(newImages[index].previewUrl);
            }
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const handleDeleteVideo = () => {
        console.log("Deleting video");
        setVideo(null);
    }

    useEffect(() => {
        if (cropData) {
            handleImageCrop(cropData);
            setCropData(null);
        }
    }, [cropData]);

    const handleImageCrop = async (croppedImage) => {
        try {
            const file = new File([croppedImage], `cropped-${Date.now()}.jpg`, {
                type: 'image/jpeg',
            });

            const previewUrl = URL.createObjectURL(file);

            setImages(prev => {
                // Check if we've reached the maximum number of images
                if (prev.length >= 3) {
                    URL.revokeObjectURL(previewUrl);
                    toast.warn('Maximum 3 images allowed', {
                        position: "top-right",
                        autoClose: 2000,
                        theme: "dark",
                    });
                    return prev;
                }
                return [...prev, {
                    file,
                    previewUrl,
                    isExisting: false
                }];
            });

            setImageModal(false);
            setImageModalProps({ image: null, cropWidth: 400, cropHeight: 400 });
        } catch (error) {
            console.error("Error processing cropped image:", error);
            toast.error("Error processing image", {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
            });
        }
    };

    const handleSwitchChange = (event) => {
        const { name, checked } = event.target;

        // Find if outlet already exists in dish outlets
        const existingOutletIndex = outlets.findIndex(outlet => outlet.outletCode === name);

        if (existingOutletIndex >= 0) {
            // Update existing outlet
            setOutlets((prevOutlets) =>
                prevOutlets.map((outlet) =>
                    outlet.outletCode === name
                        ? { ...outlet, inStock: checked }
                        : outlet
                )
            );
        } else {
            // This shouldn't happen for outlets without prices since the switch should be disabled
            // But adding this as a safeguard
            console.warn(`Attempted to toggle switch for outlet ${name} that doesn't have price data`);
        }
    };

    const handleSave = async () => {
        try {
            setIsUpdating(true);
            let imageUrls = [];
            let videoUrl = null;  // Changed from video to null by default

            // Process images only if there are any
            if (images.length > 0) {
                for (const image of images) {
                    if (image.isExisting) {
                        imageUrls.push(image.previewUrl);
                    } else if (image.file) {
                        const url = await uploadFiles(image.file, `image/dish/${dish.name || 'untitled'}`);
                        imageUrls.push(url);
                    }
                }
            }

            // Handle video
            if (video) {
                if (typeof video === 'string') {
                    videoUrl = video;  // Keep existing video URL
                } else {
                    videoUrl = await uploadFiles(video, `video/dish/${dish.name || 'untitled'}`);
                }
            }

            const updatedDish = {
                displayName: displayName,
                type,
                description: text,
                hasSpicyMeter: spicyMeter,
                videoUrl: videoUrl,  // Will be null if video was deleted
                imageUrls: imageUrls, // Will be empty array if all images were deleted
                tags: selectedTags,
                outlets,
            };

            const response = updateDish(updatedDish, dish.id);

            toast.promise(
                response,
                {
                    pending: "Saving dish...",
                    success: "Dish saved successfully!",
                    error: "Error saving dish",
                },
                {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                }
            );

            const res = await response;

            if (res.status) {
                setModalData({ updatedDish: { ...updatedDish, id: dish.id } });
            }

            console.log("Dish saved successfully:", res);

            if (areTagsExpanded) {
                setAreTagsExpanded(false);
            }

        } catch (error) {
            setIsUpdating(false);
            console.error("Error saving dish:", error);
            toast.error("Error saving dish", {
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
            setIsUpdating(false);
        }
    };


    // Check if a dish is selected in the add items view
    const isDishSelected = (dishId) => {
        return selectedItems.includes(dishId);
    };

    const handleUpsellsChange = (isChecked, id) => {
        if (isChecked) {
            if (selectedItems.length >= 4) {
                toast.warn("You can select a maximum of 4 items", {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "dark",
                });
                return;
            }
            setSelectedItems((prevSelected) => {
                if (!prevSelected.includes(id)) {
                    return [...prevSelected, id];
                }
                return prevSelected;
            });
        } else {
            setSelectedItems((prevSelected) =>
                prevSelected.filter(itemId => itemId !== id)
            );
        }
    }

    const handleAddTag = () => {
        if (customTag.trim() === "") {
            toast.warn("Tag cannot be empty", {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
            });
            return;
        }
        if (tagsListState.some(tag => tag.tag === customTag)) {
            toast.warn("Tag already exists", {
                position: "top-right",
                autoClose: 2000,
                theme: "dark",
            });
            return;
        }
        const newTag = {
            id: tagsListState.length + 1,
            tag: customTag,
        };
        setTagsList((prevTags) => [...prevTags, newTag]);
        setCustomTag("");
        toast.success("Tag added successfully", {
            position: "top-right",
            autoClose: 2000,
            theme: "dark",
        });
    }

    //function to capitalize the first letter of each word of name
    const formatName = (str) => {
        return str
            .toLowerCase()
            .split(" ")
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    return (
        <div className='flex flex-col w-full h-full px-8 relative' >
            <div className='flex justify-between items-center w-full py-2 sticky top-0 bg-white z-10'>
                <Tabs tabs={tabs} activeTabIndex={tabs.indexOf(activeTab)} onTabChange={onTabChange} />
                {
                    activeTab === "Details" &&
                    <Button
                        variant='secondary'
                        disabled={isUpdating || (activeTab === "Upsells" && isUpdatingUpsells) || (activeTab === "Add Ons" && isUpdatingAddons)}
                        size='small'
                        className="font-medium"
                        onClick={handleSave}
                    >
                        {isUpdating ? <Spinner size={20} /> : null}
                        {!isUpdating && (
                            "Apply"
                        )}
                    </Button>
                }
            </div>
            {activeTab === "Details" ? (
                <div className='flex flex-col w-full h-full'>
                    <h2 className='text-lg font-medium text-[#201F33] tracking-wide py-[16px]'>{formatName(name)}</h2>
                    <div className='flex flex-col gap-y-[12px] w-full h-fit'>
                        <label htmlFor="displayName" className='text-sm text-[#5C5C7A] font-medium'>Display Name</label>
                        <input
                            type="text"
                            className='outline-none pl-2 py-2 bg-[#F8F7FA] text-[14px] rounded-[12px] text-[#5C5C7A] placeholder:text-[#B9B9C7]'
                            placeholder='Enter display name'
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={80}
                        />
                    </div>
                    <div className='flex flex-col gap-y-[12px] pt-[16px] w-full h-fit'>
                        <label htmlFor="media" className='text-sm text-[#5C5C7A] font-medium'>Gallery</label>
                        <FileInput
                            placeholder={menuType === "petpooja" ? "maximum 1 video" : "maximum 1 video, 3 images"}
                            onFilesChange={onFilesChange}
                            images={images}
                            video={video}
                            menuType={menuType}
                        />
                        <div className='relative flex flex-wrap gap-y-2 gap-x-2 w-full h-fit'>
                            {renderFilePreviews()}
                        </div>
                    </div>
                    {
                        menuType === "prism" &&
                        <div className='flex flex-col gap-y-[12px] w-full h-fit pt-[16px]'>
                            <label htmlFor="description" className='text-sm text-[#5C5C7A] font-medium'>Description</label>
                            <Textarea
                                maxChars={255}
                                onChange={handleTextChange}
                                value={text}
                                className="text-[12px]"
                            />
                        </div>
                    }
                    <div className='flex w-full h-fit gap-x-[16px] gap-y-[12px] pt-[16px]'>
                        {
                            menuType === "prism" &&
                            <div className='flex flex-col gap-2 w-1/2 h-fit'>
                                <label htmlFor="media" className='text-sm text-[#5C5C7A] font-medium'>Type</label>
                                <Dropdown
                                    label="Select Type"
                                    options={[
                                        { label: "Veg", value: "veg" },
                                        { label: "Non-Veg", value: "non-veg" },
                                        { label: "Egg", value: "egg" },
                                        { label: "Liquor", value: "liquor" }
                                    ]}
                                    onChange={handleTypeChange}
                                    value={type}
                                />
                            </div>
                        }
                        <div className='flex flex-col gap-2 w-1/2 h-full'>
                            <label className='text-sm text-[#5C5C7A] font-medium'>Spicy Meter</label>
                            <div className='flex items-center w-full gap-2 h-full'>
                                <Checkbox
                                    checked={spicyMeter}
                                    onChange={(e) => {
                                        setSpicyMeter(e.target.checked);
                                    }}
                                    sx={{
                                        padding: 0,
                                        "& .MuiSvgIcon-root": {
                                            fontSize: 18,
                                        },
                                        "&.Mui-checked": {
                                            color: "#65558F",
                                            padding: 0,
                                        },
                                    }}
                                />
                                <label htmlFor="media" className='text-sm text-[#5C5C7A]'>Enable Spicy Meter ?</label>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col gap-y-[12px] h-fit pt-[16px]'>
                        <label htmlFor="media" className='text-sm text-[#5C5C7A] font-medium'>Tags</label>

                        <div className='flex flex-wrap gap-2 w-full h-fit overflow-x-scroll'>
                            {tagsListState.length === 0 &&
                                <span className='text-sm text-[#5C5C7A]'>No tags available</span>
                            }
                            {visibleTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    className={
                                        `border-[0.5px] cursor-pointer px-2 py-2 rounded-lg text-[12px] text-[#5C5C7A] font-medium ${isTagActive(tag.id) ? 'bg-[#4b21e2dc] text-white border-white' : 'border-[0.5px] border-[#201F33] border-dashed'
                                        } ${selectedTags.length >= 2 && !isTagActive(tag.id) ? 'opacity-80 cursor-not-allowed' : ''
                                        }`
                                    }
                                    onClick={() => handleTagSelect(tag.id)}
                                    title={selectedTags.length >= 2 && !isTagActive(tag.id) ? 'You can only select 2 tags' : 'click to select/unselect'}
                                >
                                    {tag.tag}
                                </button>
                            ))}
                        </div>

                        {tagsListState.length > initialVisibleCount && (
                            <span
                                className='text-sm text-[#5C5C7A] underline cursor-pointer hover:text-[#201F33] transition-colors duration-300'
                                onClick={() => setAreTagsExpanded(!areTagsExpanded)}
                            >
                                {areTagsExpanded ? 'Show less' : `Show more (${tagsListState.length - visibleTags.length + (visibleTags.length > initialVisibleCount ? initialVisibleCount : 0)})`}
                            </span>
                        )}
                        {/* TODO: ADD TAGS */}
                        {/* <div className='flex'>
                            <input 
                                type="text" 
                                className='bg-[#F8F7FA] font-medium text-[#5C5C7A] rounded-[8px] p-[8px] text-[14px] placeholder:text-[#B1B1EB] outline-none'
                                placeholder='write tag'
                                onChange={(e) => setCustomTag(e.target.value)}
                            />
                            <button
                                className='bg-[#F8F7FA] rounded-[8px] p-[8px] font-medium text-[14px] text-[#5C5C7A] ml-2 flex items-center justify-center gap-[8px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                title={customTag.trim() === "" ? "Tag cannot be empty" : "Click to add tag"}
                                onClick={handleAddTag}
                                disabled={!customTag.trim()}
                            >
                                <AddIcon />
                                <span>Add custom tag</span>
                            </button>
                        </div> */}
                    </div>
                    <div className='flex flex-col gap-2 gap-y-[12px] pt-[16px] w-full h-fit'>
                        <label htmlFor="media" className='text-sm text-[#5C5C7A] font-medium'>Outlets</label>
                        <div className='flex flex-col w-full gap-y-[12px]'>
                            {outletsData && outletsData.length > 0 && outletsData
                                .map((outletFromMenu) => {
                                    const dishOutlet = outlets.find(outlet => outlet.outletCode === outletFromMenu.code);
                                    const hasPrice = dishOutlet && dishOutlet.prices && dishOutlet.prices.length > 0 && dishOutlet.prices[0].price;
                                    return { ...outletFromMenu, dishOutlet, hasPrice };
                                })
                                .sort((a, b) => b.hasPrice - a.hasPrice) // Sort by hasPrice (true first, false last)
                                .map((outletData, index) => {
                                    return (
                                        <div className='flex justify-between items-center w-full border-b-[1px] border-[#E8E6ED] pb-2' key={index}>
                                            <span className={`text-[14px] ${outletData.hasPrice ? 'text-[#5C5C7A]' : 'text-[#ABABC8]'}`}>
                                                {outletData.name}
                                            </span>
                                            <div className='flex items-center gap-4 w-[95px] h-fit'>
                                                <CustomSwitch
                                                    name={outletData.code}
                                                    checked={outletData.dishOutlet ? outletData.dishOutlet.inStock : false}
                                                    onChange={outletData.hasPrice ? handleSwitchChange : () => { }}
                                                    disabled={!outletData.hasPrice}
                                                />
                                                <span className={`text-sm ${outletData.hasPrice ? 'text-[#201F33]' : 'text-[#ABABC8]'}`}>
                                                    {outletData.hasPrice ? `₹ ${outletData.dishOutlet.prices[0].price}` : '₹----'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className='flex flex-col w-full h-full sticky top-0 bg-white z-50'>
                    <h2 className='text-lg font-medium text-[#201F33] tracking-wide py-[16px]'>{formatName(name)}</h2>
                    {activeTab === "Upsells" && (
                        <>
                            <div className='flex flex-col gap-2 items-center w-full h-fit'>
                                <div className='flex justify-between items-center w-full h-fit'>
                                    <div className='flex flex-col '>
                                        <h3 className='text-[#201F33] text-md font-medium'>Upselling dishes</h3>
                                        <span className='text-[#5C5C7A] text-sm'>{upsellingDishes?.length || 0} Items</span>
                                    </div>

                                    {!addItems && (
                                        <Button variant='secondary' size='small' className="font-medium" onClick={handleOnclick}>
                                            <><AddIcon /> Add Items</>
                                        </Button>
                                    )}
                                    {addItems && (
                                        <Button variant='secondary' size='small' className="font-medium" onClick={handleAddUpsells} disabled={isUpdatingUpsells}>
                                            {isUpdatingUpsells ? <Spinner size={20} /> : 'Save'}
                                        </Button>
                                    )}
                                </div>
                                <SearchBar placeholder="Search Items" onChange={handleSearch} />
                            </div>

                            {isLoading && (
                                <div className='flex items-center justify-center w-full h-fit'>
                                    <span className='text-black text-md animate-pulse'>Loading...</span>
                                </div>
                            )}

                            {!isLoading && !addItems && displayedUpsells.length === 0 && (
                                <div className='flex flex-col items-center justify-center w-full h-full gap-4'>
                                    <h5 className='text-black text-lg'>No items found</h5>
                                    <span className='text-[#5C5C7A] text-sm'>click on add items to add upsells</span>
                                </div>
                            )}

                            {!isLoading && !addItems && displayedUpsells.length > 0 && (
                                <div className='grid grid-cols-2 gap-4 w-full h-fit overflow-y-scroll pt-[16px]'>
                                    {displayedUpsells.map((dish, index) => (
                                        <UpsellsItemCard
                                            key={index}
                                            label={dish.name}
                                            type={dish.type}
                                            onChange={() => { }}
                                            variant="normal"
                                        />
                                    ))}
                                </div>
                            )}

                            {!isLoading && addItems && filteredDishes.length > 0 && (
                                <div className='grid grid-cols-2 gap-4 w-full h-fit overflow-y-scroll pt-[16px]'>
                                    {filteredDishes.map((dish, index) => (
                                        <UpsellsItemCard
                                            key={index}
                                            label={dish.name}
                                            type={dish.type}
                                            checked={isDishSelected(dish.id)}
                                            onChange={(checked) => handleUpsellsChange(checked, dish.id)}
                                            variant="checked"
                                            isOnClick={true}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    {activeTab === "Add Ons" && (
                        <>
                            <div className='flex flex-col gap-2 items-center w-full h-fit'>
                                <div className='flex justify-between items-center w-full h-fit'>
                                    <div className='flex flex-col '>
                                        <h3 className='text-[#201F33] text-md font-medium'>Addon Groups</h3>
                                    </div>

                                    {!addAddons && (
                                        <Button variant='secondary' size='small' className="font-medium" onClick={handleAddAddonsClick}>
                                            <><AddIcon /> Add Group</>
                                        </Button>
                                    )}
                                    {addAddons && (
                                        <Button variant='secondary' size='small' className="font-medium" onClick={handleAddAddons} disabled={isUpdatingAddons}>
                                            {isUpdatingAddons ? <Spinner size={20} /> : 'Save'}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {isLoading && (
                                <div className='flex items-center justify-center w-full h-fit'>
                                    <span className='text-black text-md animate-pulse'>Loading...</span>
                                </div>
                            )}

                            {!isLoading && addonGroups.length === 0 && (
                                <div className='flex flex-col items-center justify-center w-full h-full gap-4'>
                                    <h5 className='text-black text-lg'>No Addon Groups available</h5>
                                </div>
                            )}

                            {!isLoading && !addAddons && addonGroups.length > 0 && selectedAddonGroups.length === 0 && (
                                <div className='flex flex-col items-center justify-center w-full h-full gap-4'>
                                    <h5 className='text-black text-lg'>No Addon Groups found</h5>
                                    <span className='text-[#5C5C7A] text-sm'>click on add group to add addons</span>
                                </div>
                            )}

                            {!isLoading && !addAddons && addonGroups.length > 0 && selectedAddonGroups.length > 0 && (
                                <div className='grid grid-cols-2 gap-4 w-full h-fit overflow-y-scroll pt-[16px]'>
                                    {addonGroups
                                        .filter(group => selectedAddonGroups.includes(group.external_addon_id))
                                        .map((group, index) => (
                                            <UpsellsItemCard
                                                key={index}
                                                label={group.name}
                                                variant="normal"
                                            />
                                        ))}
                                </div>
                            )}

                            {!isLoading && addAddons && addonGroups.length > 0 && (
                                <div className='grid grid-cols-2 gap-4 w-full h-fit overflow-y-scroll pt-[16px]'>
                                    {addonGroups.map((group, index) => {
                                        const isChecked = selectedAddonGroups.includes(group.external_addon_id);
                                        return (
                                            <UpsellsItemCard
                                                key={index}
                                                label={group.name}
                                                checked={isChecked}
                                                onChange={(checked) => {
                                                    setSelectedAddonGroups(prev => {
                                                        if (checked) {
                                                            // Prevent duplicates
                                                            return prev.includes(group.external_addon_id)
                                                                ? prev
                                                                : [...prev, group.external_addon_id];
                                                        } else {
                                                            return prev.filter(id => id !== group.external_addon_id);
                                                        }
                                                    });
                                                }}
                                                variant="checked"
                                                isOnClick={true}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                        </>
                    )}
                    {activeTab === "Variants" && (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                            <span className="text-[#B9B9C7] text-lg">No Variations Found</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DishDetails