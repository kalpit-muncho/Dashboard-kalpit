import React, { useState, useContext, useEffect, useMemo } from "react";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import Checkbox from "@mui/material/Checkbox";
import SearchBar from "../SearchBar"
import Button from "../Button";
import { toast } from "react-toastify";

import DashboardContext from '../../contexts/dashboardContext';
import { createAddonGroup, updateAddonGroup, deleteAddonGroup } from "../../models/MenuModel";

const AddOnGroupsModal = ({ setModal }) => {
    const { modalData, setModalData } = useContext(DashboardContext);
    const [addonGroups, setAddonGroups] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [editingGroupId, setEditingGroupId] = useState(null);

    //form fields
    const [groupName, setGroupName] = useState('');
    const [minMax, setMinMax] = useState({ min: 0, max: 0 });
    const [addons, setAddons] = useState([]);
    // Add search state
    const [searchQuery, setSearchQuery] = useState("");

    // Sort addons only on initial load when editing
    const sortedAddons = useMemo(() => {
        if (isEditing && editingGroupId) {
            const group = addonGroups.find(g => g.id === editingGroupId);
            const initialSelectedIds = group?.data?.map(item => item.id) || [];

            return addons.sort((a, b) => {
                const aSelected = initialSelectedIds.includes(a.id);
                const bSelected = initialSelectedIds.includes(b.id);
                return bSelected - aSelected;
            });
        }
        return addons;
    }, [addons, isEditing, editingGroupId, addonGroups]);

    // Filtered addons based on search
    const filteredAddons = useMemo(() => {
        if (!searchQuery.trim()) return sortedAddons;
        return sortedAddons.filter(addon =>
            addon.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [sortedAddons, searchQuery]);    useEffect(() => {
        if (modalData?.addons) {
            setAddons(modalData.addons);
        }
        if (modalData?.addonGroups) {
            setAddonGroups(modalData.addonGroups);
        }
    }, [modalData]);

    const handleIsAdding = () => {
        // Reset form fields when closing the add group modal
        setGroupName('');
        setMinMax({ min: 0, max: 0 });
        setSelectedItems([]);
        setIsAdding(true);
    }

    const handleIsEditing = (groupId) => {
        // Find the group to edit
        const group = addonGroups.find(g => g.id === groupId);
        if (group) {
            setGroupName(group.name);
            setMinMax({ min: group.min, max: group.max });
            setSelectedItems(group.data || []);
        }
        setEditingGroupId(groupId);
        setIsEditing(true);
    }

    const handleAddonSelect = (addonId) => {
        const addon = addons.find(a => a.id === addonId);
        const isSelected = selectedItems.some(item => item.id === addonId);

        if (isSelected) {
            setSelectedItems(selectedItems.filter(item => item.id !== addonId));
            console.log("Addon removed:", addon.name);
        } else {
            setSelectedItems([...selectedItems, addon]);
            console.log("Addon added:", addon.name);
            console.log("Selected items:", selectedItems);        }
    }

    const handleClose = () => {
        setModalData(prevData => ({ 
            ...prevData, 
            changedAddonGroups: addonGroups 
        }));
        setIsAdding(false);
        setIsEditing(false);
        setEditingGroupId(null);
        setGroupName('');
        setMinMax({ min: 0, max: 0 });
        setSelectedItems([]);
        setSearchQuery("");
        setModal(false);
    }

    const handleBack = () => {
        setIsAdding(false);
        setIsEditing(false);
        setEditingGroupId(null);
        setGroupName('');
        setMinMax({ min: 0, max: 0 });
        setSelectedItems([]);
        setSearchQuery("");
    }

    const validateGroupData = () => {
        if (!groupName) {
            toast.error("Group name is required.");
            return false;
        }

        // Validate min and max values logic
        const minValue = parseInt(minMax.min, 10);
        const maxValue = parseInt(minMax.max, 10);

        if (isNaN(minValue) || minValue < 0) {
            toast.error("Minimum addons must be a valid non-negative number.");
            return false;
        }

        if (isNaN(maxValue) || maxValue < 0) {
            toast.error("Maximum addons must be a valid non-negative number.");
            return false;
        }

        if (minValue > maxValue) {
            toast.error("Minimum addons cannot be greater than maximum addons.");
            return false;
        }

        if (maxValue === 0) {
            toast.error("Maximum addons must be greater than 0.");
            return false;
        }

        return { minValue, maxValue };
    };

    const handleSaveGroup = async () => {
        const validation = validateGroupData();
        if (!validation) return;

        const { minValue, maxValue } = validation;

        const groupData = {
            name: groupName,
            min: minValue,
            max: maxValue,
            data: selectedItems
        };

        const isEditMode = isEditing && editingGroupId;

        try {
            const response = isEditMode
                ? updateAddonGroup(editingGroupId, groupData)
                : createAddonGroup(groupData);

            toast.promise(response, {
                pending: isEditMode ? "Updating addon group..." : "Adding addon group...",
                success: isEditMode ? "Addon group updated successfully!" : "Addon group added successfully!",
            }, {
                position: "top-right",
                autoClose: 1500,
                theme: "light"
            });

            const res = await response;
            console.log(`Response from ${isEditMode ? 'updateAddonGroup' : 'createAddonGroup'}:`, res);

            if (res.status) {
                if (isEditMode) {
                    // Update existing group
                    setAddonGroups(addonGroups.map(group =>
                        group.id === editingGroupId ? { ...group, ...groupData } : group
                    ));
                } else {
                    // Add new group
                    const newGroupData = res.data;
                    setAddonGroups([...addonGroups, {
                        id: newGroupData.id,
                        name: newGroupData.name,
                        min: newGroupData.min,
                        max: newGroupData.max,
                        data: newGroupData.data
                    }]);
                }
                // Reset form fields
                handleBack();
            }

        } catch (error) {
            const action = isEditMode ? "updating" : "adding";
            const errorMessage = isEditMode ? "Failed to update Addon Group: " : "Error adding Group: ";

            console.error(`Error ${action} addon group:`, error.message);
            toast.error(errorMessage + error.message, {
                position: "top-right",
                autoClose: 2000,
                theme: "light"
            });
        }
    }

    const handleDeleteGroup = async (groupId) => {
        try {
            const response = deleteAddonGroup(groupId);
            toast.promise(response, {
                pending: "Deleting addon group...",
                success: "Addon group deleted successfully! Refreshing...",
            }, {
                position: "top-right",
                autoClose: 1500,
                theme: "light"
            });

            await response;
            const res = await response;
            if (res.status) {
                setAddonGroups(addonGroups.filter(group => group.id !== groupId));
                handleBack();
            }
        } catch (error) {
            console.error("Error deleting addon group:", error.message);
            toast.error("Failed to delete Addon Group: " + error.message, {
                position: "top-right",
                autoClose: 2000,
                theme: "light"
            });
        }
    }

    return (
        <div className="absolute bg-black/85 flex justify-center items-center w-full h-full p-6" style={{ zIndex: 1000 }}>
            {!isAdding && !isEditing && (
                <div className="bg-[#F8F7FA] rounded-2xl flex flex-col p-4">
                    {addonGroups.length === 0 &&
                        <div className="flex flex-col items-center justify-center h-[350px] w-[400px]">
                            <h1 className="text-[#201F33] text-[24px] font-medium text-center p-3">No Add-on Groups found</h1>
                        </div>
                    }
                    {addonGroups.length !== 0 &&
                        <>
                            <div className="flex items-center justify-between">
                                <h1 className="text-[18px] font-medium">Addon Groups</h1>
                            </div>
                            <div className="flex flex-col gap-2 min-h-[350px] max-h-[400px] min-w-[400px] overflow-y-scroll pt-4">
                                {addonGroups.map((group) => (
                                    <div key={group.id} className="bg-white flex justify-between items-center gap-2 px-[16px] py-[10px] rounded-[12px] border-[1px] border-[#E8E6ED]">
                                        <span className="text-[#201F33] text-[14px]" >{group.name}</span>
                                        <button className="cursor-pointer flex items-center justify-center rounded-full p-1 hover:bg-gray-200 transition-colors duration-300"
                                            onClick={() => { handleIsEditing(group.id) }}
                                        >
                                            <EditIcon className='text-[#201F33]' fontSize="small" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    }
                    <div className="flex gap-3 items-center justify-end w-full pt-4">
                        <Button className="font-medium" size='small' onClick={handleClose} ><span className='flex text-[14px] font-medium h-[24px] text-center items-center'>Cancel</span></Button>
                        <Button className="font-medium" variant='secondary' size='small' onClick={handleIsAdding} ><AddIcon className='text-[#FFFFFF]' /><span className='flex text-[14px] font-medium h-[24px] text-center items-center'>Add Group</span></Button>
                    </div>
                </div>
            )}
            {(isAdding || isEditing) && (
                <div className="bg-[#F8F7FA] rounded-2xl flex flex-col p-6 min-w-[900px]">
                    <div className="flex flex-col gap-4 text-[#201F33]">
                        <div className="flex items-center justify-between">
                            <h1 className="text-[18px] font-medium">Addon Details</h1>
                            {
                                isEditing && !isAdding &&
                                <button className="cursor-pointer flex items-center justify-center rounded-full p-1.5 bg-white hover:bg-red-200 transition-colors duration-300"
                                    title="Delete Addon Group"
                                    onClick={() => handleDeleteGroup(editingGroupId)}
                                >
                                    <DeleteIcon className='text-[#201F33]' fontSize="medium" />
                                </button>
                            }
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-col gap-[14px] w-full">
                                <span className="text-[14px] font-medium">Group Name</span>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => { setGroupName(e.target.value) }}
                                    placeholder="Enter name for the Addon group"
                                    className="w-full px-[13px] py-[12px] rounded-[8px] bg-white border-none outline-none placeholder:text-[#5C5C7A] text-[#201F33] text-[14px] font-normal"
                                />
                            </div>
                            <div className="flex gap-5 w-full pt-[18px]">
                                <div className="flex gap-[14px] w-1/2 flex-col">
                                    <span className="text-[14px] font-medium">Minimum Addons</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={minMax.min}
                                        onChange={(e) => {
                                            setMinMax({ ...minMax, min: e.target.value });
                                        }}
                                        placeholder="Enter minimum addons"
                                        className="w-full px-[13px] py-[12px] rounded-[8px] bg-white border-none outline-none placeholder:text-[##5C5C7A] text-[#201F33] text-[14px] font-normal"
                                    />
                                </div>
                                <div className="flex gap-[14px] w-1/2 flex-col">
                                    <span className="text-[14px] font-medium">Maximum Addons</span>
                                    <input
                                        type="number"
                                        min="1"
                                        value={minMax.max}
                                        onChange={(e) => {
                                            setMinMax({ ...minMax, max: e.target.value });
                                        }}
                                        placeholder="Enter maximum addons"
                                        className="w-full px-[13px] py-[12px] rounded-[8px] bg-white border-none outline-none placeholder:text-[##5C5C7A] text-[#201F33] text-[14px] font-normal"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 pt-4">
                            <div className="flex items-center justify-between gap-2 w-full">
                                <h2 className="text-[18px] font-medium w-[80px]">Add Ons</h2>
                                <div className="w-1/2">
                                    <SearchBar
                                        placeholder="Search Addons"
                                        bgColor="#FFFFFF"
                                        onChange={e => setSearchQuery(e.target.value)}
                                        value={searchQuery}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 h-[264px] overflow-y-auto">
                                {filteredAddons.map((addon) => (
                                    <div key={addon.id} className='flex justify-between items-center bg-white hover:bg-gray-200 transition-colors duration-300 rounded-xl px-6 py-3 w-full h-fit border-[1px] border-[#E8E6ED]'
                                        onClick={() => handleAddonSelect(addon.id)}
                                    >
                                        <span className='text-[14px] cursor-default max-w-[260px] truncate'>{addon.name}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[14px] text-[#5C5C7A] cursor-default">₹{addon.price}</span>
                                            <Checkbox
                                                checked={selectedItems.some(item => item.id === addon.id)}
                                                onChange={(e) => { e.stopPropagation, handleAddonSelect(addon.id) }}
                                                sx={{
                                                    padding: "4px",
                                                    margin: 0,
                                                    '& .MuiSvgIcon-root': {
                                                        fontSize: 20,
                                                    },
                                                    '&.Mui-checked': {
                                                        color: '#65558F',
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button className="font-medium" size='small' onClick={handleBack} >Cancel</Button>
                        <Button className="font-medium" variant='secondary' size='small' onClick={handleSaveGroup} >{"Save"}</Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddOnGroupsModal