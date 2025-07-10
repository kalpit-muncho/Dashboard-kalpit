import React, { useState, useContext } from 'react'
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import { SiSwiggy, SiZomato, SiBookmyshow, SiPaytm } from "react-icons/si";
import { LiaTripadvisor } from "react-icons/lia";
import LinkIcon from '@mui/icons-material/Link';
import DashboardContext from '../contexts/dashboardContext';
import Switch from "@mui/material/Switch";
import { styled } from "@mui/system";

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LanguageIcon from '@mui/icons-material/Language';

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { toast } from 'react-toastify';
import { validateURL } from "../utils/validators";

const LinkCard = ({ cardActive = false, active, id, title, icon, link, onClick }) => {

    const [value, setValue] = useState(link);

    const { setLinks, links } = useContext(DashboardContext);

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
                    backgroundColor: (cardActive ? "#4B21E2" : "#5C5C7A"),
                    opacity: 1,
                },
            },
        },
        "& .MuiSwitch-thumb": {
            width: 12,
            height: 12,
        },
        "& .MuiSwitch-track": {
            borderRadius: 20 / 2,
            backgroundColor: (cardActive ? "#8669F1" : "#ABABC8"),
            opacity: 1,
        },
    }));

    const getIcon = (icon) => {
        // Return the corresponding icon based on the icon name passed
        if (icon === "instagram") {
            return <InstagramIcon fontSize="small" />;
        } else if (icon === "x") {
            return <XIcon fontSize="small" />;
        }
        else if (icon === "facebook") {
            return <FacebookIcon fontSize="small" />;
        }
        else if (icon === "google") {
            return <GoogleIcon fontSize="small" />;
        }
        else if (icon === "swiggy") {
            return <SiSwiggy size={20} />;
        }
        else if (icon === "zomato") {
            return <SiZomato size={20} />;
        }
        else if (icon === "bookmyshow") {
            return <SiBookmyshow size={20} />;
        } 
        else if (icon === "tripadvisor") {
            return <LiaTripadvisor size={20} />;
        } 
        else if (icon === "paytm") {
            return <SiPaytm size={20} />;
        } 
        else  {
            return <LinkIcon fontSize="small" />;
        }
    }

    const handleLinkDelete = (id) => {
        try {
            // Remove the link at the specified index
            if (!id) {
                throw new Error("Link ID is not provided");
            }
            const newLinks = links.filter(link => link.id !== id);
            console.log("Updated links:", newLinks);
            setLinks(newLinks);
            console.log("Link deleted:", id);
            toast.success("Link deleted successfully", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } catch (error) {
            console.error(error.message);
            toast.error(error.message, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    }

    const handleLinkChange = (e) => {
        setValue(e.target.value);
        //find the link with the same id and update the link value
        setLinks(links.map(link => link.id === id ? { ...link, link: e.target.value } : link));
    }

    const handleLinkEdit = (id) => {
        try {
            if (!id) throw new Error("Link ID is not provided");
            if (!value.trim()) throw new Error("Link cannot be empty");
            if (!validateURL(value)) throw new Error("Invalid URL format");
    
            const newLinks = links.map(link => 
                link.id === id ? { ...link, link: value } : link
            );
            
            setLinks(newLinks);
            toast.success("Link updated successfully",{
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        } catch (error) {
            toast.error(error.message,{
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };
    

    const [isActive, setIsActive] = useState(active); 

    const handleLinkActive = (e) => {
        setIsActive(e.target.checked);
        const newLinks = links.map(link => 
            link.id === id ? { ...link, active: e.target.checked } : link
        );
        setLinks(newLinks);
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.6 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        boxShadow: isDragging ? "0 2px 10px rgba(0, 0, 0, 0.2)" : "none",
        borderRadius: "18px",
        overflow: "hidden",
    };
    


    return (
        <div 
            ref={setNodeRef}
            style={style}
            className="flex flex-col gap-2"
        >
            <div className={`flex flex-wrap sm:flex-nowrap items-center justify-between rounded-[12px] px-3 sm:px-4 py-2 ${cardActive ? "bg-[#EEEBFA] text-[#4B21E2]" : "bg-[#F8F7FA] text-black"}`}>
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <div className="block"
                        {...attributes}
                        {...listeners}
                    >

                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_1096_15314)">
                                <path d="M12 5.83L15.17 9L16.58 7.59L12 3L7.41 7.59L8.83 9L12 5.83ZM12 18.17L8.83 15L7.42 16.41L12 21L16.59 16.41L15.17 15L12 18.17Z" fill={cardActive ? "#4B21E2" : "#5C5C7A"} />
                            </g>
                            <defs>
                                <clipPath id="clip0_1096_15314">
                                    <rect width="24" height="24" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <div>
                        {getIcon(icon)}
                    </div>
                    <span className="text-sm">{title}</span>
                </div>
                <div className={`flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end ${cardActive ? "text-[#4B21E2]" : "text-[#5C5C7A]"}`}>
                    <CustomSwitch
                        checked={isActive} onChange={handleLinkActive}
                    />
                    <button className="p-1 rounded-md cursor-pointer" onClick={() => { handleLinkDelete(id) }}> <DeleteOutlineIcon /> </button>
                    <button className={`p-1 rounded-md cursor-pointer ${cardActive ? "bg-[#4B21E2] text-white" : ""}`} onClick={onClick}> <LanguageIcon /> </button>
                </div>
            </div>
            {cardActive && (
                <div className="relative flex w-full rounded-lg text-sm" id="edit-link">
                    <input 
                        type="url" 
                        name="link"
                        defaultValue={link}
                        value={value} 
                        className="px-4 py-2 w-full bg-[#F8F7FA] rounded-lg outline-0 outline-none" 
                        onChange={(e)=>handleLinkChange(e)} 
                    />
                    <button className="absolute top-1.5 right-3 cursor-pointer" onClick={() => { handleLinkEdit(id) }}><EditOutlinedIcon /></button>
                </div>
            )}
        </div>
    )
}

export default LinkCard;