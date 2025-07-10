import React, { useState, useContext, useEffect } from 'react'
import Button from '../Button';
import CloseIcon from '@mui/icons-material/Close';
import Checkbox from '@mui/material/Checkbox';
import DashboardContext from '../../contexts/dashboardContext';

import { createMenuGroup } from '../../models/MenuModel';
import { toast } from 'react-toastify';

const AddMenuModel = ({ setModal }) => {
    const { setModalData ,modalData, setEditMenuModal } = useContext(DashboardContext);

    const [categories, setCategories] = useState([]);
    const [menuGroups, setMenuGroups] = useState([]);

    useEffect(() => {
        setMenuGroups(modalData.menuGroups);
        setCategories(modalData.categories);
        console.log("latest modal data: ",modalData)
    }, [modalData])

    const [selectedCategories, setSelectedCategories] = useState({});
    const [menuName, setMenuName] = useState("");

    const toggleCategory = (name) => {
        setSelectedCategories(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleNameChange = (e) => {
        setMenuName(e.target.value)
    }

    const handleAddMenuGroup = async () => {
        //filter seleceted categories
        const selected = categories.filter(category => selectedCategories[category.name]);

        //api to create a new menu group would be called here
        //for now we are just creating a new menu group object
        let newPriority;
        if (menuGroups.length > 0) {
            const minPriority = Math.min(...menuGroups.map(group => group.priority));
            // If minPriority is already 1 or less, use maxPriority + 1 instead
            if (minPriority <= 1) {
                const maxPriority = Math.max(...menuGroups.map(group => group.priority));
                newPriority = maxPriority + 1;
            } else {
                newPriority = minPriority - 1;
            }
        } else {
            newPriority = 1;
        }
        
        const newMenuGroup = {
            name: menuName,
            //ensure priority is always positive and unique
            priority: newPriority,
            imageUrl: "",
        }

        const payload = {
            ...newMenuGroup,
            categories: selected.map(category => category.id)
        }
          
        const data = await createMenuGroup(payload)
        toast.success("Menu group created successfully. Reloading ...", {
            position: "top-right",
            autoClose: 2000,
            theme: "dark"
        });
        // Reload after 1 seconds
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        // handleClose()
    }

    const handleClose = () => {
        setModal(false);
        setEditMenuModal(true);
    }

    return (
        <div className='absolute bg-black/85 flex justify-center items-center w-full h-full p-6' style={{ zIndex: 1000 }}>
            <div className='bg-[#F8F7FA] rounded-xl w-[30%] h-fit flex flex-col gap-4 p-8'>
                <div className='flex justify-between'>
                    <h2 className='text-[18px] font-medium text-[#201F33]'>Add Menu</h2>
                    <button className='ml-auto text-[#201F33] font-semibold cursor-pointer' onClick={(e) => { handleClose(e) }}><CloseIcon fontSize='medium' /></button>
                </div>
                <div className='flex w-full h-fit'>
                    <input 
                        type="text" 
                        placeholder='Enter name for menu' 
                        className='bg-white rounded-xl px-4 py-1.5 w-full max-w-[280px] outline-[#4B21E2] text-[14px]'
                        onChange={handleNameChange}
                    />
                </div>
                <div className='flex flex-col gap-4 pt-4'>
                    <h5 className='text-[#201F33] text-[14px] font-medium'>Select Categories</h5>
                    <div className='flex flex-col h-[420px] overflow-auto w-full gap-2'>
                        {categories.map((category) => (
                            <div
                                className="flex justify-between items-center bg-white hover:bg-gray-100 rounded-[12px] p-2 px-3 w-full cursor-normal"
                                key={category.id}
                                onClick={() => toggleCategory(category.name)}
                            >
                                <span className="text-[14px]">{category.name}</span>
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
                <div className='flex gap-4 w-full justify-end'>
                    <Button size='small' className="font-medium" onClick={handleClose} >Cancel</Button>
                    <Button variant='secondary' size='small' className="" onClick={handleAddMenuGroup} >Add Menu</Button>
                </div>
            </div>
        </div>
    )
}

export default AddMenuModel;