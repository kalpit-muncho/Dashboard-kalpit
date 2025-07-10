import React, { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { Radio } from "@mui/material";
import DashboardContext from "../../contexts/dashboardContext";
import { toast } from "react-toastify";
import FileInput from "../../components/FileInput";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Button from "../../components/Button";
import Loading from "../../components/Loading";
import EditIcon from "@mui/icons-material/Edit";
import Checkbox from "@mui/material/Checkbox";
import CustomDatePicker from "../../components/CustomDatePicker";
import { useNavigate, useLocation } from "react-router-dom";
import { validateURL } from "../../utils/validators";
import { getBannerById, updateBanner, deleteBanner } from "../../models/BannersModel";
import dayjs from "dayjs";
import { uploadFiles } from "../../utils/fileUploader";

const EditBannerAd = () => {
    const { setCategoryModal, setDishModal, modalData, setImageModal, setImageModalProps, cropData, setCropData, setModalData } = useContext(DashboardContext);
    const [activeButton, setActiveButton] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false); // Add loading state for upload
    const { id } = useParams();



    const [type, setType] = useState({ type: "", typeData: "" });

    const [originalImageUrl, setOriginalImageUrl] = useState(""); // Store original image URL


    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [cta, setCta] = useState("");

    const [duration, setDuration] = useState({
        from: null,
        to: null
    });

    const state = useLocation().state;

    const [menu, setMenu] = useState({ categories: [], dishes: [] }); // Initialize with empty arrays
    const [name, setName] = useState(null); // State to store name data
    const [isTimeLimit, setIsTimeLimit] = useState(true); // State to manage time limit checkbox

    useEffect(() => {
        if (!isTimeLimit) {
            setDuration({
                from: null,
                to: null,
            });
        }
    }, [isTimeLimit])

    useEffect(() => {
        const fetchAd = async () => {
            try {
                setLoading(true);
                const menuData = state?.menu || { categories: [], dishes: [] }; // Provide default value
                setMenu(menuData);
                const data = await getBannerById(id);
                if (data) {
                    console.log("Fetched ad data:", data);
                    setAd(data);
                    setTitle(data.title);
                    setCta(data.cta_text);
                    setDuration({
                        from: data.duration.from ? dayjs(data.duration.from).toISOString() : null,
                        to: data.duration.to ? dayjs(data.duration.to).toISOString() : null
                    });
                    if(!data.duration.from && !data.duration.to) {
                        setIsTimeLimit(false);
                    }
                    setOriginalImageUrl(data.image_url); // Store original image URL

                    if (data.image_url) {
                        setUploadedFile({
                            name: "banner-image.jpg",
                            preview: data.image_url
                        });
                    }
                    setType({
                        type: data.type,
                        typeData: data.type_data,
                    });

                    // Set activeButton and name based on type
                    if (data.type === "category_id") {
                        setActiveButton("category");
                        const category = menuData.categories.find((category) => category.id === data.type_data);
                        if (category) {
                            setName(category.name);
                        }
                    } else if (data.type === "dish_id") {
                        setActiveButton("dish");
                        const dish = menuData.dishes.find((dish) => dish.id === data.type_data);
                        if (dish) {
                            setName(dish.name);
                        }
                    } else if (data.type === "url") {
                        setActiveButton("url");
                        setUrl(data.type_data);
                    } else if (data.type === "none") {
                        setActiveButton("none");
                        setName(null); // Reset name if type is "none"
                    }
                } else {
                    throw new Error("Ad not found");
                }
            } catch (error) {
                setLoading(false);
                console.error("Error fetching ad data:", error);
                toast.error("Error fetching ad data", {
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
                setLoading(false);
            }
        };
        fetchAd();
    }, [id, state]);

    useEffect(() => {
        if (modalData.category_id && menu?.categories) {
            setType({
                type: "category_id",
                typeData: modalData.category_id,
            });
            const categoryName = menu.categories.find((category) => category.id === modalData.category_id)?.name;
            setName(categoryName); // update name state
        }
        if (modalData.dish_id && menu?.dishes) {
            setType({
                type: "dish_id",
                typeData: modalData.dish_id,
            });
            const dishName = menu.dishes.find((dish) => dish.id === modalData.dish_id)?.name;
            setName(dishName); // update name state
        }
    }, [modalData.category_id, modalData.dish_id, menu]);

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

    useEffect(() => {
        if (activeButton === "url") {
            setType({
                type: "url",
                typeData: url,
            });
            // Only reset name when explicitly changing to URL type
            if (type.type !== "url") {
                setName(null);
            }
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
            categories: menu?.categories || [],
            dishes: menu?.dishes || [],
        });
    }, [menu])


    const handleFilesChange = (files) => {
        const file = Array.isArray(files) ? files[0] : files; // Take the first file if multiple is false
        if (!file || !(file instanceof File)) {
            console.error("Invalid file:", file);
            return;
        }
        setUploadedFile(file);
        console.log("Selected file:", file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageModalProps({
                image: reader.result,
                cropWidth: 630,
                cropHeight: 270,
            });
            setImageModal(true);
        };
        reader.readAsDataURL(file);
    };

    const handleImageCrop = async (croppedImage) => {
        try {
            const newFile = new File([croppedImage], uploadedFile.name, {
                type: croppedImage.type,
                lastModified: Date.now(),
            });
            // Create a preview URL
            const newFileWithPreview = Object.assign(newFile, {
                file: newFile,
                preview: URL.createObjectURL(newFile),
            });
            setUploadedFile(newFileWithPreview);
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

    const clearFile = () => {
        setUploadedFile(null);
        setImageModal(false);
        setImageModalProps(null);
        document.getElementById("fileInput").value = ""; // Reset file input field
    }

    const openCategoryModal = (e) => {
        if (activeButton !== "category") {
            setName(null); // Only reset name when changing from different type
        }
        setActiveButton(e.target.value);
        setCategoryModal(true);
    };

    const openDishModal = (e) => {
        if (activeButton !== "dish") {
            setName(null); // Only reset name when changing from different type
        }
        setActiveButton(e.target.value);
        setDishModal(true);
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDuration((prevDuration) => ({
            ...prevDuration,
            [name]: value,
        }));
    }

    const handleUrlChange = (e) => {
        const { value } = e.target;
        setUrl(value);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "title") {
            setTitle(value);
            console.log("Title:", value);
        } else if (name === "cta") {
            setCta(value);
            console.log("CTA:", value);
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
            throw new Error("Please select a duration");
        }
        if (!uploadedFile) {
            throw new Error("Please upload a file");
        }
    }

    const handleSave = async (e) => {
        try {
            e.preventDefault();
            validateForm();
            setIsUploading(true);

            let imageUrl = originalImageUrl; // Default to original image URL

            // Only upload if a new file was selected
            if (uploadedFile && uploadedFile instanceof File) {
                const uploadResponse = await uploadFiles(uploadedFile, `image/banner/${uploadedFile.name}`);
                if (uploadResponse) {
                    imageUrl = uploadResponse;
                } else {
                    throw new Error("Failed to upload image");
                }
            }

            const updatedBanner = {
                id: ad.id,
                title,
                cta: cta,
                imageUrl: imageUrl || originalImageUrl,
                type: type.type,
                typeData: type.typeData,
                durationFrom: duration.from ? new Date(duration.from).toISOString() : null,
                durationTo: duration.to ? new Date(duration.to).toISOString() : null,
            };

            const res = updateBanner(updatedBanner);
            toast.promise(
                res,
                {
                    pending: "Updating banner...",
                    success: "Banner updated successfully",
                    error: "Error updating banner",
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
            if (!response.status) {
                throw new Error(response.message || "Failed to update banner");
            }
            navigate("/dashboard/banners");
        } catch (error) {
            toast.error(error.message, { position: "top-right", autoClose: 2000, theme: "dark" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            const response = await deleteBanner(ad.id);
            if (response.status) {
                navigate("/dashboard/banners");
                toast.success(response.message, { position: "top-right", autoClose: 2000, theme: "dark" });
            } else {
                throw new Error("Error deleting banner: " + response.message);
            }
        } catch (error) {
            toast.error(error.message, { position: "top-right", autoClose: 2000, theme: "dark" });
        }
    };

    if (loading) {
        return (
            <Loading />
        );
    }

    if (!ad) {
        return <div>Ad not found</div>;
    }

    return (
        <section className="flex flex-col gap-2 w-full h-full px-[24px] pt-4">
            <div className="flex font-medium text-xl items-center w-full">
                <ArrowBackIosIcon fontSize="small" className="cursor-pointer" onClick={()=>{navigate("/dashboard/banners")}} />
                <h2>Edit Banner Ad</h2>
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
                            value={title}
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
                                        className="text-sm px-[10px] py-[8px] rounded-xl text-[#323232] placeholder:text-[#5C5C7A] placeholder:font-medium w-full outline-none truncate bg-[#F8F7FA]"
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
                                <CustomDatePicker name="from" onChange={handleDateChange} isTimeLimit={isTimeLimit} value={duration.from} />
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <label htmlFor="to" className="text-sm font-medium text-[#5C5C7A]" >To</label>
                                <CustomDatePicker name="to" onChange={handleDateChange} isTimeLimit={isTimeLimit} value={duration.to} />
                            </div>
                        </div>
                    </div>

                </div>
                <div className="w-1/2 h-full flex flex-col items-center justify-between gap-4 md:pl-12 pr-[10vw] ">
                    <div className="flex flex-col gap-6 w-full h-full">
                        <div className="w-full h-fit flex flex-col gap-2 ">
                            <label className="text-[14px] font-medium tracking-wide">Call to Action</label>
                            <input
                                type="text"
                                name="cta"
                                value={cta}
                                onChange={handleChange}
                                placeholder="Write call to action text here"
                                className="bg-[#F8F7FA] px-4 py-2 rounded-xl placeholder:text-[#5C5C7A] placeholder:font-medium w-full outline-[#4B21E2]"
                            />
                        </div>
                        <div className="w-full h-fit flex flex-col gap-2 ">
                            {
                                !uploadedFile &&
                                <div className="w-full h-[250px] flex flex-col gap-2 rounded-md">
                                    <FileInput multiple={false} accept=".jpg, .jpeg, .png, .svg, .gif" placeholder="file can be of gif, jpg, png, svg of size 30Mb" onFilesChange={handleFilesChange} />
                                </div>
                            }
                            {uploadedFile && (
                                <>
                                    <label className="text-[14px] font-medium tracking-wide">File</label>
                                    <div className="flex items-center gap-3 text-[#5C5C7A] px-3.5 py-2 rounded-xl bg-[#EEEBFA] border-1 border-[#E8E6ED] w-fit max-w-md">
                                        <ImageIcon fontSize="small" />
                                        <span className="font-medium text-sm overflow-clip">{uploadedFile.name}</span>
                                        <button className="p-1 rounded-md cursor-pointer" onClick={() => clearFile()}>
                                            <CloseIcon fontSize="small" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 w-full py-[24px]">
                            {/* <h3 className="text-[14px] font-medium tracking-wide">Delete Banner</h3> */}
                            <div className="rounded-[12px] bg-[#FAE8E8] px-[10px] py-[8px] flex items-center justify-between w-full h-fit">
                                <div className="flex items-center w-full">
                                    <span className="text-[14px]">Delete Banner</span>
                                    {/* <p className="text-[10px]">by clicking you will permanently delete the banner</p> */}
                                </div>
                                <button 
                                    className="bg-[#F8F7FA] rounded-full p-[8px] w-fit h-fit flex items-center justify-center cursor-pointer"
                                    onClick={handleDelete}
                                >
                                    <DeleteOutlineIcon
                                        className="text-[#D84343]"
                                        fontSize="small"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 justify-end w-full mb-24">
                        <Button 
                            variant="tertiary" 
                            size="small" 
                            className=" font-medium"
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
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Save"}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EditBannerAd;