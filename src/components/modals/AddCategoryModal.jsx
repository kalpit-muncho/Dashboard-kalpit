import React, { useState, useContext, useEffect } from "react";
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

import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Button from "../Button";
import SearchBar from "../SearchBar";
import DashboardContext from "../../contexts/dashboardContext";
import CategoryCard from "../CategoryCard";
import { toast } from "react-toastify";

import { updateMenuGroup, reorderMenuGroups } from "../../models/MenuModel";

const AddCategoryModal = ({ setModal }) => {
    const { modalData } = useContext(DashboardContext);

    const [menuGroups, setMenuGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [activeMenuGroup, setActiveMenuGroup] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState({});
    const [isReordered, setIsReordered] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);

    useEffect(() => {
        setMenuGroups(modalData.menuGroups);
        setCategories(modalData.categories);
        setFilteredCategories(modalData.categories);
        setTabs(modalData.menuGroups.map(group => group.name));
        setActiveTab(modalData.menuGroups[0]?.name || '');
    }, [modalData]);

    useEffect(() => {
        if (menuGroups && menuGroups.length > 0 && activeMenuGroup === null) {
            setActiveMenuGroup(menuGroups[0]);
        }
    }, [menuGroups]);

    // useEffect(() => {
    //     if (searchTerm) {
    //         const filtered = categories.filter(category =>
    //             category.name.toLowerCase().includes(searchTerm.toLowerCase())
    //         );
    //         setFilteredCategories(filtered);
    //     } else {
    //         setFilteredCategories(modalData.categories);
    //     }
    // }, [searchTerm, modalData.categories, categories]);

    useEffect(() => {
        if (activeMenuGroup) {
            setSelectedCategories(
                modalData.categories.reduce((acc, category) => {
                    acc[category.name] = category.menuGroupId === activeMenuGroup.id;
                    return acc;
                }, {})
            );
        }
    }, [activeMenuGroup, modalData.categories]);

    const handleTabChange = (index) => {
        setActiveTab(tabs[index]);
        setActiveMenuGroup(menuGroups[index]);
    };

    const toggleCategory = (name) => {
        setSelectedCategories(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
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
            setTabs((prevTabs) => {
                const oldIndex = prevTabs.indexOf(active.id);
                const newIndex = prevTabs.indexOf(over.id);
                return arrayMove(prevTabs, oldIndex, newIndex);
            });

            setMenuGroups((prevMenuGroups) => {
                const oldIndex = prevMenuGroups.findIndex(group => group.name === active.id);
                const newIndex = prevMenuGroups.findIndex(group => group.name === over.id);
                const newGroups = arrayMove(prevMenuGroups, oldIndex, newIndex);

                return newGroups.map((group, i) => ({
                    ...group,
                    priority: i + 1
                }));
            });
        }
    };

    const handleSave = async () => {
        try {
            const selectedCategoryIds = categories
                .filter(cat => selectedCategories[cat.name])
                .map(cat => cat.id);

            const promises = [];
            if (isReordered) {
                // Update menu groups order
                const menuGroupsPayload = menuGroups.map((menu) => ({
                    id: menu.id,
                    priority: menu.priority,
                }));
                promises.push(reorderMenuGroups(menuGroupsPayload));
            }

            const payload = {
                id: activeMenuGroup.id,
                categories: selectedCategoryIds
            }
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
                setTimeout(() => {
                    setModal(false);
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error("Error saving menu groups:", error);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        const filtered = categories.filter(category =>
            category.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCategories(filtered);
        if (value === '') {
            setFilteredCategories(modalData.categories);
        }
    };

    const closeModal = () => setModal(false);

    return (
        <div className="absolute bg-black/85 flex justify-center items-center w-full h-full p-6" style={{ zIndex: 1000 }}>
            <div className="bg-white rounded-2xl min-w-[812px] h-[80vh] flex overflow-hidden">
                <div className="flex min-w-[280px] h-full bg-white">
                    <div className="flex flex-col h-full w-full px-6 pt-[72px]">
                        <h4 className="text-[18px] font-medium text-[#201F33] pl-10 w-full">Position</h4>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                            <SortableContext items={tabs} strategy={verticalListSortingStrategy} modifiers={[restrictToWindowEdges]}>
                                <div className="flex flex-col gap-4 w-full h-full px-2 py-4">
                                    {tabs.map((tab, index) => (
                                        <CategoryCard
                                            key={tab}
                                            id={tab}
                                            tab={tab}
                                            activeTab={activeTab}
                                            onClick={() => handleTabChange(index)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                <div className="flex flex-col w-full h-full bg-[#F8F7FA]">
                    <div className="flex w-full p-4 h-fit justify-end">
                        <IconButton onClick={closeModal}>
                            <CloseIcon className="text-[#323232]" />
                        </IconButton>
                    </div>
                    <div className="px-10 flex flex-col gap-4">
                        <div className="flex justify-between items-center w-full h-fit">
                            <h4 className="text-[18px] font-medium text-[#201F33] pl-8">{activeMenuGroup?.name}</h4>
                            <Button variant="secondary" size="small" onClick={handleSave}>Save</Button>
                        </div>

                        <div className="flex w-full h-fit py-2.5">
                            <SearchBar placeholder="Search Dish & categories" bgColor="white" onChange={handleSearchChange} />
                        </div>

                        <div className="h-[320px] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                                {filteredCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex justify-between items-center bg-white hover:bg-gray-100 rounded-xl py-3 px-3 w-full"
                                        onClick={() => toggleCategory(category.name)}
                                    >
                                        <span className="text-[14px] cursor-default">{category.name}</span>
                                        <Checkbox
                                            checked={!!selectedCategories[category.name]}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => toggleCategory(category.name)}
                                            sx={{
                                                padding: "4px",
                                                margin: 0,
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: 18,
                                                },
                                                "&.Mui-checked": {
                                                    color: "#65558F",
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
    );
};

export default AddCategoryModal;
