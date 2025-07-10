import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { Radio } from "@mui/material";
import DashboardContext from "../../contexts/dashboardContext";
import { toast } from "react-toastify";
import FileInput from "../../components/FileInput";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import Button from "../../components/Button";
import CustomDatePicker from "../../components/CustomDatePicker";
import { validateURL } from "../../utils/validators"; // Import the URL validator
import { uploadFiles } from "../../utils/fileUploader";
import { Checkbox } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { createBanner } from "../../models/BannersModel";
import { useNavigate } from "react-router-dom";

const CreateBannerAd = () => {
    const { setCategoryModal, setDishModal, setImageModal, modalData, setImageModalProps, cropData, setCropData, setModalData } = useContext(DashboardContext);
    const [activeButton, setActiveButton] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [type, setType] = useState({ type: "", typeData: null });
    const [banner, setBanner] = useState({});
    const [isUploading, setIsUploading] = useState(false); // Add loading state for upload
    const [isTimeLimit, setIsTimeLimit] = useState(true); // State to manage time limit checkbox

    const state = useLocation().state;

    const [menu, setMenu] = useState(state.menu); // State to store menu data
    const [name, setName] = useState(null); // State to store name data

    useEffect(() => {
        if (state && state.menu) {
            setMenu(state.menu);
        }
    }, [state]);

    useEffect(() => {
        setName(null); // Reset name when activeButton changes
    }, [activeButton])

    useEffect(() => {
        if(!isTimeLimit) {
            setDuration({
                from: null,
                to: null,
            });
        }
    }, [isTimeLimit])

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [cta, setCta] = useState("");

    const [duration, setDuration] = useState({
        from: new Date().toISOString(),
        to: new Date().toISOString(),
    });

    useEffect(() => {
        if (modalData.category_id) {
            setType({
                type: "category_id",
                typeData: modalData.category_id,
            });
            const categoryName = menu.categories.find((category) => category.id === modalData.category_id)?.name;
            setName(categoryName); // update name state
        }
        if (modalData.dish_id) {
            setType({
                type: "dish_id",
                typeData: modalData.dish_id,
            });
            const dishName = menu.dishes.find((dish) => dish.id === modalData.dish_id)?.name;
            setName(dishName); // update name state
        }
    }, [modalData.category_id, modalData.dish_id]);

    useEffect(() => {
        if (duration.to && duration.from) {
            const fromDate = new Date(duration.from);
            const toDate = new Date(duration.to);
            if (fromDate > toDate) {
                toast.error("End date must be greater than start date",
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
                setDuration((prevDuration) => ({
                    ...prevDuration,
                    to: "",
                }));
            }
        }
    }, [duration]);

    useEffect(() => {
        if (activeButton === "url") {
            setType({
                type: "url",
                typeData: url,
            });
            setName(null);
        }
        if(activeButton === "none") {
            setType({
                type: "none",
                typeData: null,
            });
            setName(null);
        }
    }, [activeButton, url]);


    useEffect(() => {
        setModalData({
            categories: menu.categories,
            dishes: menu.dishes,
        });
    }, [menu])


    const handleFilesChange = (file) => {
        // Check if file is an array and extract the first file
        const selectedFile = Array.isArray(file) ? file[0] : file;

        if (!selectedFile || !(selectedFile instanceof File)) {
            console.error("Invalid file:", selectedFile);
            return;
        }

        console.log("Uploading file:", selectedFile);

        setUploadedFiles([selectedFile]); // Ensure it's stored as an array

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageModalProps({
                image: reader.result,
                cropWidth: 630,
                cropHeight: 270,
            });
            setImageModal(true);
        };
        reader.readAsDataURL(selectedFile);
    };


    const handleImageCrop = async (croppedImage) => {
        try {
            const newFile = new File([croppedImage], uploadedFiles[0].name, {
                type: croppedImage.type,
                lastModified: Date.now(),
            });
            // Create a preview URL
            const newFileWithPreview = Object.assign(newFile, {
                file: newFile,
                preview: URL.createObjectURL(newFile),
            });
            setUploadedFiles([newFileWithPreview]);
            setImageModal(false);
            toast.success("Image cropped successfully",
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
        } catch (error) {
            console.error("Error cropping image:", error);
            toast.error("Error cropping image",
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
        }
    };

    useEffect(() => {
        if (!cropData || !(cropData instanceof File)) {
            console.log("Skipping handleImageCrop, invalid cropData:", cropData);
            return;
        }
        handleImageCrop(cropData);
        return () => {
            setImageModal(false);
            setImageModalProps(null);
            setCropData(null);
        }
    }, [cropData]);

    const clearFile = () => {
        setUploadedFiles([]);
        setImageModal(false);
        setImageModalProps(null);
        document.getElementById("fileInput").value = ""; // Reset file input field
    }

    const openCategoryModal = (e) => {
        setActiveButton(e.target.value);
        setCategoryModal(true);
    };

    const openDishModal = (e) => {
        setActiveButton(e.target.value);
        setDishModal(true);
    };

    // Update the handleDateChange function
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDuration((prevDuration) => {
            const newDuration = {
                ...prevDuration,
                [name]: value,
            };

            // Validate dates whenever they change
            if (name === 'from' || name === 'to') {
                const fromDate = new Date(newDuration.from);
                const toDate = new Date(newDuration.to);

                if (fromDate > toDate) {
                    toast.error("End date must be greater than start date", {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                    return prevDuration; // Revert to previous state if invalid
                }
            }

            return newDuration;
        });
    }


    const handleUrlChange = (e) => {
        const { value } = e.target;
        setUrl(value);

    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "title") {
            setTitle(value);
        } else if (name === "cta") {
            setCta(value);
        }
    };

    const validateForm = () => {
        if (!title) {
            throw new Error("Please enter a title");
        }
        if (!cta) {
            throw new Error("Please enter a call to action");
        }
        if (!activeButton) {
            throw new Error("Please select a type");
        }
        if (activeButton === "url" && !validateURL(url)) {
            throw new Error("Please enter a valid URL");
        }
        if (!type.type || !type.typeData && type.type !== "none") {
            console.log(type)
            throw new Error("Please select a type");
        }
        if (!duration.from && isTimeLimit || !duration.to && isTimeLimit) {
            console.log(duration)
            throw new Error("Please select a duration");
        }
        if (!uploadedFiles.length) {
            throw new Error("Please upload a file");
        }
    }

    const handleSave = async (e) => {
        try {
            e.preventDefault();
            validateForm();
            setIsUploading(true); // Start loading

            // Upload the image first
            let imageUrl = "";
            if (uploadedFiles.length > 0) {
                const uploadResponse = await uploadFiles(uploadedFiles[0], `image/banner/${uploadedFiles[0].name}`);
                if (uploadResponse) {
                    imageUrl = uploadResponse;
                } else {
                    throw new Error("Failed to upload image");
                }
            }


            if (modalData.category) {
                setType((prevType) => ({
                    ...prevType,
                    typeData: modalData.category,
                }));
            }

            if (modalData.dish) {
                setType((prevType) => ({
                    ...prevType,
                    typeData: modalData.dish,
                }));
            }

            const restID = localStorage.getItem("restaurantId");

            const newBanner = {
                restaurant_id: restID,
                title: title,
                cta: cta,
                imageUrl: imageUrl, // Use the uploaded image URL
                type: type.type,
                typeData: type.typeData,
                durationFrom: duration.from ? new Date(duration.from).toISOString() : null,
                durationTo: duration.to ? new Date(duration.to).toISOString() : null,
            };

            setBanner(newBanner);

            const res = createBanner(newBanner);
            toast.promise(
                res,
                {
                    pending: "Creating banner...",
                    success: "Banner created successfully",
                    error: "Error creating banner",
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

            const response = await res;
            if (!response) {
                throw new Error("Failed to create banner");
            }
            if (response.status) {
                navigate("/dashboard/banners");
            }
        } catch (error) {
            setIsUploading(false);
            toast.error(error.message, { position: "top-right", autoClose: 2000, theme: "dark" });
        } finally {
            setIsUploading(false); // Stop loading regardless of success/error
        }
    };


    return (
        <section className="flex flex-col gap-2 w-full h-full px-[24px] pt-4">
            <div className="flex font-medium text-xl items-center w-full">
                <ArrowBackIosIcon fontSize="small" className="cursor-pointer" onClick={() => window.history.back()} />
                <h2>Add Banner</h2>
            </div>

            <div className="flex flex-col md:flex-row w-full h-full px-4">

                <div className="w-1/2 h-full md:border-r-1 border-[#E8E6ED] pr-[15vw]">
                    <div className="w-full h-fit mt-2 text-sm">
                        <input
                            type="text"
                            name="title"
                            placeholder="Enter title of Ad"
                            className="bg-[#F8F7FA] px-4 py-2 rounded-xl placeholder:text-[#5C5C7A] placeholder:font-medium w-full outline-[#4B21E2]"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex flex-col gap-[12px] pt-[24px] w-full">
                        <label className="text-[14px] font-medium tracking-wide" >Attached</label>
                        <div className="flex flex-col w-full gap-4">
                            <div className="flex flex-col gap-3 w-full text-sm">
                                <div className="flex gap-x-[5px] items-center">
                                    <Radio
                                        name="radio-buttons"
                                        sx={{
                                            padding: 0,
                                            margin: 0,
                                            color: "#323232",
                                            "&.Mui-checked": {
                                                color: "#323232",
                                            },
                                        }}
                                        onChange={(e => setActiveButton(e.target.value))}
                                        checked={activeButton === "url"}
                                        value={"url"}
                                    />
                                    <span className="">URL</span>
                                </div>
                                {
                                    activeButton === "url" &&
                                    <input
                                        type="text"
                                        name="ad_url"
                                        value={url}
                                        placeholder="Enter URL"
                                        className="text-sm px-[10px] py-[8px] rounded-xl text-[#323232] placeholder:text-[#5C5C7A] w-full outline-none truncate bg-[#F8F7FA]"
                                        onChange={handleUrlChange}
                                    />
                                }
                            </div>
                            <div className="flex flex-col gap-3 w-full text-sm">
                                <div className="flex gap-x-[5px] items-center">
                                    <Radio
                                        name="radio-buttons"
                                        sx={{
                                            padding: 0,
                                            margin: 0,
                                            color: "#323232",
                                            "&.Mui-checked": {
                                                color: "#323232",
                                            },
                                        }}
                                        onChange={(e) => {
                                            setActiveButton(e.target.value);
                                            openCategoryModal(e);
                                        }}
                                        checked={activeButton === "category"}
                                        value="category"
                                    />
                                    <span className="">Menu category</span>
                                </div>
                                {
                                    activeButton === "category" && name &&
                                    <div className="flex items-center justify-between w-full h-fit relative text-sm px-[10px] py-[8px] rounded-xl text-[#797C8F] bg-[#F8F7FA]">
                                        <span className="truncate w-[70%]">{name}</span>
                                        <button 
                                            className="flex gap-1 items-center cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveButton("category");
                                                setCategoryModal(true);
                                            }}
                                        >
                                            <EditIcon
                                                fontSize="12px"
                                                className="text-[#4B21E2]"
                                            />
                                            <span className="text-[#4B21E2] text-[12px]">Change</span>
                                        </button>
                                    </div>
                                }
                            </div>
                            <div className="flex flex-col gap-3 w-full text-sm">
                                <div className="flex gap-x-[5px] items-center">
                                    <Radio
                                        name="radio-buttons"
                                        sx={{
                                            padding: 0,
                                            margin: 0,
                                            color: "#323232",
                                            "&.Mui-checked": {
                                                color: "#323232",
                                            },
                                        }}
                                        onChange={(e) => {
                                            setActiveButton(e.target.value);
                                            openDishModal(e);
                                        }}
                                        checked={activeButton === "dish"}
                                        value="dish"
                                    />
                                    <span className="text-sm">Dish</span>
                                </div>
                                {
                                    activeButton === "dish" && name &&
                                    <div className="flex items-center justify-between w-full h-fit relative text-sm px-[10px] py-[8px] rounded-xl text-[#797C8F] bg-[#F8F7FA]">
                                        <span className="truncate w-[70%]">{name}</span>
                                        <button 
                                            className="flex gap-1 items-center cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setActiveButton("dish");
                                                setDishModal(true);
                                            }}
                                        >
                                            <EditIcon
                                                fontSize="12px"
                                                className="text-[#4B21E2]"
                                            />
                                            <span className="text-[#4B21E2] text-[12px]">Change</span>
                                        </button>
                                    </div>
                                }
                            </div>
                            <div className="flex flex-col gap-3 w-full text-sm">
                                <div className="flex gap-x-[5px] items-center">
                                    <Radio
                                        name="radio-buttons"
                                        sx={{
                                            padding: 0,
                                            margin: 0,
                                            color: "#323232",
                                            "&.Mui-checked": {
                                                color: "#323232",
                                            },
                                        }}
                                        onChange={(e) => {
                                            setActiveButton(e.target.value);
                                        }}
                                        checked={activeButton === "none"}
                                        value="none"
                                    />
                                    <span className="text-sm">None</span>
                                </div>
                            </div>
                        </div>
                    </div>                    <div className="flex flex-col gap-4 pt-[24px] w-full">
                        <div className="w-full h-fit flex justify-between items-center">
                            <h3 className="text-[14px] font-medium tracking-wide">Set Duration</h3>
                            <button 
                                className=" w-fit h-fit flex items-center justify-center rounded-full p-[11px] bg-[#F8F7FA]"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsTimeLimit(!isTimeLimit);
                                }}
                            >
                                <Checkbox
                                    id="set-duration"
                                    checked={isTimeLimit}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        setIsTimeLimit(!isTimeLimit);
                                    }}
                                    sx={{
                                        padding: 0,
                                        margin: 0,
                                        color: "#5C5C7A",
                                        "&.Mui-checked": { color: "#65558F" },
                                        "& .MuiSvgIcon-root": { fontSize: 18 },
                                    }}
                                />
                            </button>
                        </div>
                        <div 
                            className="flex flex-col gap-[12px] w-full"
                            style={{
                                opacity: isTimeLimit ? 1 : 0.7,
                                pointerEvents: isTimeLimit ? "auto" : "none",
                            }}
                        >
                            <div className="flex flex-col gap-1 w-full">
                                <label htmlFor="from" className="text-sm font-medium text-[#5C5C7A]" >From</label>
                                <CustomDatePicker name="from" onChange={handleDateChange} isTimeLimit={isTimeLimit} />
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <label htmlFor="to" className="text-sm font-medium text-[#5C5C7A]" >To</label>
                                <CustomDatePicker name="to" onChange={handleDateChange} isTimeLimit={isTimeLimit} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Side */}
                <div className="w-1/2 h-full flex flex-col items-center justify-between gap-4 md:pl-12 pr-[10vw]">
                    <div className="flex flex-col gap-4 w-full h-full">
                        <div className="w-full h-fit flex flex-col gap-2 ">
                            <label className="text-[14px] font-medium tracking-wide">Call to Action</label>
                            <input
                                type="text"
                                name="cta"
                                onChange={handleChange}
                                placeholder="Write call to action text here"
                                className="bg-[#F8F7FA] text-sm px-4 py-2 rounded-xl placeholder:text-[#5C5C7A] placeholder:font-medium w-full outline-[#4B21E2]"
                            />
                        </div>
                        <div className="w-full h-fit flex flex-col gap-2 pt-[24px]">
                            {
                                uploadedFiles.length === 0 &&
                                <div className="w-full h-[200px] flex flex-col gap-2 rounded-md">
                                    <FileInput multiple={false} placeholder="file can be of gif, jpg, png, svg of size 30Mb" onFilesChange={handleFilesChange} accept=".jpg, .jpeg, .png, .svg, .gif" />
                                </div>
                            }
                            {uploadedFiles.length > 0 && (
                                <>
                                    <label className="text-[14px] font-medium tracking-wide">File</label>
                                    <div className="flex items-center gap-3 text-[#5C5C7A] px-3.5 py-2 rounded-xl bg-[#EEEBFA] border-1 border-[#E8E6ED] w-fit max-w-md text-sm">
                                        <ImageIcon fontSize="small" />
                                        <span className="font-medium text-sm overflow-clip">
                                            {uploadedFiles[0].name}
                                        </span>
                                        <button
                                            className="p-1 rounded-md cursor-pointer"
                                            onClick={() => {
                                                clearFile() // Reset file input field
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4 justify-end w-full mb-24">
                        <Button 
                            variant="tertiary" 
                            size="small" className=" 
                            font-medium"
                            onClick={() => {
                                setImageModal(false);
                                setImageModalProps(null);
                                navigate("/dashboard/banners");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="small"
                            className="font-medium"
                            onClick={handleSave}
                            disabled={isUploading} // Disable button during upload
                        >
                            {isUploading ? "Uploading..." : "Save"}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CreateBannerAd;
