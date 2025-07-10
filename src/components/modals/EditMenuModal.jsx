import React, { useState, useContext, useEffect } from 'react';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import {
    restrictToVerticalAxis,
    restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import Button from '../Button';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Checkbox from '@mui/material/Checkbox';
import { IconButton } from '@mui/material';
import CategoryCard from '../CategoryCard';
import DashboardContext from '../../contexts/dashboardContext';
import { deleteMenuGroup, updateMenuGroup, reorderMenuGroups, updateMenuStock } from '../../models/MenuModel';
import { toast } from 'react-toastify';
import { uploadFiles } from '../../utils/fileUploader';

const EditMenuModal = ({ setModal }) => {
    const { modalData, setAddMenuModel, setImageModal, setImageModalProps, cropData, setCropData } = useContext(DashboardContext);
    const [menuGroups, setMenuGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [file, setFile] = useState(null);
    const [activeMenuGroup, setActiveMenuGroup] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState({});
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [isReordered, setIsReordered] = useState(false);
    const [menuType, setMenuType] = useState('');
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        setMenuGroups(modalData.menuGroups);
        setCategories(modalData.categories);
        setTabs(modalData.menuGroups.map(group => group.name));
        setActiveTab(modalData.menuGroups[0]?.name || '');
        setActiveMenuGroup(modalData.menuGroups[0] || null);
        const type = localStorage.getItem('menuType');
        setMenuType(type);
    }, [modalData]);

    // Update this useEffect to respond to activeMenuGroup changes
    useEffect(() => {
        // Only run this when activeMenuGroup exists
        if (activeMenuGroup) {
            if (activeMenuGroup && activeMenuGroup.imageUrl) {
                // Use URL directly instead of converting to File
                setFile({ preview: activeMenuGroup.imageUrl });
            } else {
                setFile(null);
            }

            console.log("Active Menu Group:", activeMenuGroup);
            const newSelectedCategories = modalData.categories.reduce((acc, category) => {
                // Check if this category belongs to the currently active menu group
                acc[category.name] = category.menuGroupId === activeMenuGroup.id;
                return acc;
            }, {});
            setSelectedCategories(newSelectedCategories);
            
            // Update select all state based on current selections
            const selectedCount = Object.values(newSelectedCategories).filter(Boolean).length;
            setSelectAll(selectedCount === modalData.categories.length);
        }
    }, [activeMenuGroup, modalData.categories]);

    useEffect(() => {
        if (!cropData || !(cropData instanceof File)) {
            return;
        }
        handleImageCrop(cropData);
        return () => {
            setFile(null);
            setImageModal(false);
            setImageModalProps(null);
            setCropData(null);
        }
    }, [cropData]);

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (!file || !(file instanceof File)) {
            console.error("Invalid file:", file);
            return;
        }
        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageModalProps({
                image: reader.result,
                cropWidth: 1,
                cropHeight: 1,
            });
            setImageModal(true);
        };
        reader.readAsDataURL(file);
    }

    const handleImageCrop = async (croppedImage) => {
        try {
            // Always clean up previous preview URL if it exists and it's a blob URL
            if (file?.preview && file.preview.startsWith('blob:')) {
                URL.revokeObjectURL(file.preview);
            }

            const preview = URL.createObjectURL(croppedImage);
            setFile({
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
        // Clean up preview URL only if it's a blob URL (cropped image)
        if (file?.preview && file.preview.startsWith('blob:')) {
            URL.revokeObjectURL(file.preview);
        }
        setFile(null);
        setImageModal(false);
        setImageModalProps(null);
        const fileInput = document.getElementById("imageInput");
        if (fileInput) {
            fileInput.value = "";
        }
    };

    const openAddMenuModel = () => {
        setModal(false);
        setAddMenuModel(true);
    };

    const toggleCategory = (name) => {
        setSelectedCategories(prev => {
            const newState = {
                ...prev,
                [name]: !prev[name]
            };
            
            // Update select all state
            const selectedCount = Object.values(newState).filter(Boolean).length;
            setSelectAll(selectedCount === categories.length);
            
            return newState;
        });
    };

    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedCategories(
            categories.reduce((acc, category) => {
                acc[category.name] = newSelectAll;
                return acc;
            }, {})
        );
    };

    const handleTabChange = (index) => {
        setActiveTab(tabs[index]);
        // Find menu group using both name and id to ensure uniqueness
        const menuGroup = menuGroups.find((group, idx) => idx === index);
        setActiveMenuGroup(menuGroup);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setIsReordered(true);
            // Update tabs order
            setTabs((prevTabs) => {
                const oldIndex = prevTabs.indexOf(active.id);
                const newIndex = prevTabs.indexOf(over.id);
                return arrayMove(prevTabs, oldIndex, newIndex);
            });

            // Update menuGroups order
            setMenuGroups((prevMenuGroups) => {
                const oldIndex = prevMenuGroups.findIndex(group => group.name === active.id);
                const newIndex = prevMenuGroups.findIndex(group => group.name === over.id);

                // Reorder the menu groups
                const newMenuGroups = arrayMove(prevMenuGroups, oldIndex, newIndex);

                // Update priorities based on new positions, starting from 1
                return newMenuGroups.map((group, index) => ({
                    ...group,
                    priority: index + 1
                }));
            });
        }
    };

    const handleSubmit = async () => {
        try {
            let imageUrl = activeMenuGroup.imageUrl; // Default to existing image URL

            // Only process new image if file is a File object or has a file property
            if (file instanceof File) {
                const path = `image/menu/${file.name}`;
                imageUrl = await uploadFiles(file, path);
            } else if (file?.file instanceof File) {
                const path = `image/menu/${file.file.name}`;
                imageUrl = await uploadFiles(file.file, path);
            }

            // Get selected category IDs
            const selectedCategoryIds = categories
                .filter(category => selectedCategories[category.name])
                .map(category => category.id);

            const promises = [];
            if (isReordered) {
                // Update menu groups order
                const menuGroupsPayload = menuGroups.map((menu) => ({
                    id: menu.id,
                    priority: menu.priority,
                }));
                promises.push(reorderMenuGroups(menuGroupsPayload));
            }

            // Create payload
            const payload = {
                id: activeMenuGroup.id,
                name: activeMenuGroup.name,
                imageUrl: imageUrl || "", // Use empty string as fallback
                categories: selectedCategoryIds
            }

            // Use toast.promise with the promise before awaiting
            promises.push(updateMenuGroup(payload));
            const promise = Promise.all(promises);

            toast.promise(
                promise,
                {
                    pending: "Updating menu groups...",
                    success: "Update successfull reloading in 2 seconds",
                    error: "Failed to update menu groups"
                },
                {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                }
            );
            const resp = await promise;
            console.log(resp);
            if (resp[0].status) {
                // Reload after 3 seconds
                setTimeout(() => {
                    setModal(false);
                    window.location.reload();
                }, 2000);
            }

        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const promise = deleteMenuGroup(id);
            toast.promise(
                promise,
                {
                    pending: "Deleting menu group...",
                    success: `Deleted successfully reloading in 2 seconds`,
                    error: "Failed to delete menu group"
                },
                {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                }
            );
            const resp = await promise;
            if (resp.status) {
                // Reload after 3 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
            if (!resp.status) {
                throw new Error(resp.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleStockChange = async (groupId, inStock) => {
        try {
            const res = updateMenuStock(groupId, inStock);
            toast.promise(
                res,
                {
                    pending: "Updating stock status...",
                    success: `Stock status updated successfully`,
                    error: "Failed to update stock status"
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
                throw new Error(response.message);
            }
            setMenuGroups(prevGroups =>
                prevGroups.map(group => {
                    if (group.id === groupId) {
                        console.log(`Updating group ${group.name} stock to ${inStock}`);
                        return { ...group, inStock: inStock };
                    }
                    return group;
                })
            );
        } catch (error) {
            console.error("Error updating stock status:", error.message);
        }
    };

    return (
        <div className='absolute bg-black/85 flex justify-center items-center w-full h-full p-6' style={{ zIndex: 1000 }}>
            {menuType === 'petpooja' &&
                <div className='bg-white rounded-2xl w-[70vw] h-[80vh] flex overflow-hidden'>
                    <div className='flex w-fit h-full bg-white'>
                        <div className='flex flex-col h-full w-full px-6 pt-[72px]'>
                            <h4 className='text-[18px] font-medium text-[#201F33] pl-10 w-full'>Position</h4>
                            <div className='w-full h-full overflow-y-auto'>
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                    modifiers={[restrictToVerticalAxis]}
                                >
                                    <SortableContext items={tabs} strategy={verticalListSortingStrategy} modifiers={[restrictToWindowEdges]}>
                                        <div className='flex flex-col gap-4 w-full h-full px-2 py-4'>
                                            {tabs.map((tab, index) => {
                                                const currentGroup = menuGroups[index];
                                                return (
                                                    <CategoryCard
                                                        key={`${currentGroup.id}-${tab}`}
                                                        id={currentGroup.name}
                                                        groupId={currentGroup.id}
                                                        tab={tab}
                                                        stock={currentGroup.inStock && currentGroup.isActive}
                                                        onChange={handleStockChange}
                                                        activeTab={activeTab}
                                                        menuType={menuType}
                                                        onClick={() => handleTabChange(index)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col w-full h-full bg-[#F8F7FA]'>
                        <div className='flex w-full p-4 h-fit justify-end'>
                            <IconButton onClick={() => setModal(false)}>
                                <CloseIcon className='text-[#323232]' />
                            </IconButton>
                        </div>
                        <div className='flex w-full h-fit justify-between items-center px-10 pb-6'>
                            <h4 className='text-[18px] font-medium text-[#201F33] pl-8'>{activeMenuGroup?.name}</h4>
                            <div className='flex gap-2 items-center'>
                                <div className='flex gap-2 rounded-full items-center bg-white p-2 px-4'>
                                    <Checkbox
                                        checked={selectAll}
                                        onChange={toggleSelectAll}
                                        disableRipple
                                        sx={{
                                            padding: 0,
                                            margin: 0,
                                            "& .MuiSvgIcon-root": {
                                                margin: 0,
                                                fontSize: 18,
                                            },
                                            "&.Mui-checked": {
                                                color: "#65558F",
                                            },
                                            "&.MuiCheckbox-indeterminate": {
                                                color: "#65558F",
                                            },
                                        }}
                                    />
                                    <span className='text-[14px]'>Select All</span>
                                </div>
                                <button className='flex items-center justify-center p-2 rounded-full bg-white cursor-pointer hover:bg-gray-200 transition-colors duration-300' onClick={openAddMenuModel}>
                                    <AddIcon className='text-[#201F33]' />
                                </button>
                                <button
                                    className='flex items-center justify-center p-2 rounded-full bg-white cursor-pointer hover:bg-gray-200 transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed'
                                    onClick={() => { handleDelete(activeMenuGroup.id) }}
                                    //disable if there is only one menu group
                                    disabled={menuGroups.length <= 1}
                                >
                                    <DeleteIcon className='text-[#201F33]' />
                                </button>
                            </div>
                        </div>

                        <div className='px-10 flex flex-col gap-4'>
                            <div className='flex justify-between items-center'>
                                <div className='flex gap-3 flex-col w-fit h-fit'>
                                    <div className={`flex justify-between items-center w-full h-fit`}>
                                        <h5 className='text-[#201F33] text-[16px] font-medium'>Background Image</h5>
                                    </div>
                                    <div className='flex items-center gap-2 w-full h-full'>
                                        {file ? (
                                            <div className="flex items-center gap-3 text-[#5C5C7A] px-3 py-3 rounded-[8px] bg-[#EEEBFA] border-1 border-[#E8E6ED] w-fit max-w-md">
                                                <img src={file.preview} alt="Preview" className="w-[50px] h-[50px] rounded-md object-cover" />
                                                <button className="p-1 rounded-md cursor-pointer" onClick={clearFile}>
                                                    <CloseIcon className='pl-1' fontSize="medium" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className='flex items-center gap-3 px-3 py-1 rounded-[8px]'>
                                                <span className="text-[#5C5C7A] text-[14px] overflow-clip">No image selected</span>
                                            </div>
                                        )}
                                        <div className='flex items-center justify-center p-1.5 rounded-full bg-white cursor-pointer hover:bg-gray-200 transition-colors duration-300'>
                                            {!file && (
                                                <>
                                                    <input type="file" accept=".jpg, .jpeg, .png, .svg" name="" id="imageInput" className='hidden' onChange={onFileChange} />
                                                    <FileUploadOutlinedIcon fontSize='small' className='text-[#323232]' onClick={(e) => {
                                                        e.preventDefault();
                                                        document.getElementById("imageInput").click();
                                                    }} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className='flex items-center justify-end w-fit h-fit'>
                                    <Button variant='secondary' size='small' className="" onClick={handleSubmit}>Save</Button>
                                </div>
                            </div>

                            <div className='flex gap-3 flex-col w-full h-fit'>
                                <h5 className='text-[#201F33] text-[18px] font-medium'>Categories</h5>
                                <div className='h-[320px] overflow-y-auto'>
                                    <div className='grid grid-cols-2 gap-2'>
                                        {categories.map((category) => (
                                            <div
                                                className='flex justify-between items-center bg-white hover:bg-gray-100 rounded-xl py-3 px-3 w-full'
                                                key={category.id}
                                                onClick={() => toggleCategory(category.name)}
                                            >
                                                <span className='text-[14px] cursor-default'>{category.name}</span>
                                                <Checkbox
                                                    checked={!!selectedCategories[category.name]}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={() => toggleCategory(category.name)}
                                                    sx={{
                                                        padding: "4px",
                                                        margin: 0,
                                                        '& .MuiSvgIcon-root': {
                                                            fontSize: 18,
                                                        },
                                                        '&.Mui-checked': {
                                                            color: '#65558F',
                                                        },
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            {menuType === 'prism' &&
                <div className='bg-white rounded-2xl w-fit min-h-[340px] flex overflow-hidden'>
                    <div className='flex flex-col min-h-[340px] h-full w-full px-6 pt-[19px]'>
                        <h4 className='text-[18px] font-medium text-[#201F33] pl-8 w-full'>Menu</h4>
                        <div className='w-full h-full overflow-y-auto'>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                                modifiers={[restrictToVerticalAxis]}
                            >
                                <SortableContext items={tabs} strategy={verticalListSortingStrategy} modifiers={[restrictToWindowEdges]}>
                                    <div className='flex flex-col gap-4 w-full h-full px-2 py-4'>
                                        {tabs.map((tab, index) => {
                                            const currentGroup = menuGroups[index];
                                            return (
                                                <CategoryCard
                                                    key={`${currentGroup.id}-${tab}`}
                                                    id={currentGroup.name}
                                                    groupId={currentGroup.id}
                                                    tab={tab}
                                                    stock={currentGroup.inStock && currentGroup.isActive}
                                                    onChange={handleStockChange}
                                                    activeTab={activeTab}
                                                    menuType={menuType}
                                                    onClick={() => handleTabChange(index)}
                                                />
                                            );
                                        })}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                    <div className='flex flex-col justify-between bg-[#F8F7FA] min-w-[322px] w-full h-full min-h-[340px]'>
                        <div className='flex w-full px-[24px] py-4 h-fit justify-between'>
                            <div className=''>
                                <h4 className='text-[18px] font-medium text-[#201F33] w-full'>{activeMenuGroup?.name}</h4>
                            </div>
                            <button className='cursor-pointer' onClick={() => setModal(false)}>
                                <CloseIcon sx={
                                    {
                                        padding: 0,
                                        margin: 0,
                                    }
                                } className='text-[#323232]' />
                            </button>
                        </div>
                        <div className='flex gap-3 flex-col w-full h-full px-[24px]'>
                            <div className={`flex justify-between items-center w-full h-fit`}>
                                <h5 className='text-[#201F33] text-[16px] font-medium'>Background Image</h5>
                            </div>
                            <div className='flex items-center gap-2 w-full h-full'>
                                {file ? (
                                    <div className="flex items-center gap-3 text-[#5C5C7A] px-3 py-3 rounded-[8px] bg-[#EEEBFA] border-1 border-[#E8E6ED] w-fit max-w-md">
                                        <img src={file.preview} alt="Preview" className="w-[150px] h-[150px] rounded-md object-cover" />
                                        <button className="p-1 rounded-md cursor-pointer" onClick={clearFile}>
                                            <CloseIcon className='pl-1' fontSize="medium" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-3 px-3 py-1 rounded-[8px]'>
                                        <span className="text-[#5C5C7A] text-[14px] overflow-clip">No image selected</span>
                                    </div>
                                )}
                                <div className='flex items-center justify-center p-1.5 rounded-full bg-white cursor-pointer hover:bg-gray-200 transition-colors duration-300'>
                                    {!file && (
                                        <>
                                            <input type="file" accept=".jpg, .jpeg, .png, .svg" name="" id="imageInput" className='hidden' onChange={onFileChange} />
                                            <FileUploadOutlinedIcon fontSize='small' className='text-[#323232]' onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById("imageInput").click();
                                            }} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center justify-end w-full h-fit px-6 py-4'>
                            <Button variant='secondary' size='small' className="" onClick={handleSubmit}>Save</Button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default EditMenuModal;
