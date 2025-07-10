import React, { useState, useEffect } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Switch } from "@mui/material";
import { styled } from "@mui/system";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { setCategoryStatus } from "../models/MenuModel";
import { toast } from "react-toastify";

// Custom styled switch
const CustomSwitch = styled(Switch, {
    shouldForwardProp: (prop) => prop !== 'active',
})(({ active }) => ({
    width: 32,
    height: 16,
    padding: 0,
    "& .MuiSwitch-switchBase": {
        padding: 2,
        "&.Mui-checked": {
            transform: "translateX(16px)",
            color: "#fff",
            "& + .MuiSwitch-track": {
                backgroundColor: active ? "#4B21E2" : "#5C5C7A", // Active color
                opacity: 1,
            },
        },
    },
    "& .MuiSwitch-thumb": {
        width: 12,
        height: 12,
    },
    "& .MuiSwitch-track": {
        borderRadius: 10,
        backgroundColor: "#5C5C7A",  // Default color
        opacity: 1,
    },
}));

const SortableCategoryCard = ({ id, name, active = false, onClick, checked, onChange }) => {
    const [disabled, setDisabled] = useState(false)
    const [isChecked, setIsChecked] = useState(checked);

    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
        opacity: !isChecked ? 0.56 : (isDragging ? 0.9 : 1),
    };

    const handleChange = async (event) => {
        const toastConfig = {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        }
        const checked = event.target.checked;
        try {
            setIsChecked(checked);
            setDisabled(true);
            const promise = setCategoryStatus(id, checked);
            toast.promise(
                promise,
                {
                    pending: "Updating category status...",
                    success: "Category status updated successfully!",
                    error: "Error updating category status",
                },
                toastConfig
            );
            const response = await promise;
            if (!response.status) {
                throw new Error(response.message);
            }
            console.log(response);
            onChange(id, checked);
        } catch (error) {
            setIsChecked(!checked);
            setDisabled(false);
            toast.error(error, toastConfig);
        } finally {
            setDisabled(false)
        }
    }

    const formatName = (str) => {
        return str
            .toLowerCase()
            .split(" ")
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex rounded-xl justify-between items-center h-[66px] overflow-hidden relative text-[#5C5C7A] transition-all duration-300 cursor-pointer hover:bg-[#F8F7FA] border-[1px] border-[#E8E6ED] shadow-xs
                ${active ? "bg-[#EEEBFA] hover:bg-[#EEEBFA]" : "bg-white"} 
                ${isDragging ? "shadow-lg" : ""}`}
            onClick={onClick}
        >
            {/* Left Side (Icon & Text) */}
            <div className="flex gap-3 px-3 py-3 items-center flex-1 min-w-0" style={{ cursor: "grab", zIndex: 50 }}>
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab touch-manipulation flex-shrink-0"
                    aria-label="Drag to reorder category"
                >
                    <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M5.00016 2.83L8.17016 6L9.58016 4.59L5.00016 0L0.410156 4.59L1.83016 6L5.00016 2.83ZM5.00016 15.17L1.83016 12L0.420156 13.41L5.00016 18L9.59016 13.41L8.17016 12L5.00016 15.17Z"
                            fill={active ? "#4B21E2" : "#5C5C7A"}
                        />
                    </svg>
                </div>
                <div
                    className={`flex flex-col justify-center cursor-pointer h-[42px] min-w-0 flex-1 ${active ? "text-[#4B21E2] " : "text-[#5C5C7A]"}`}
                    onClick={onClick}
                >
                    <h1 className="text-[14px] leading-tight truncate" title={name}>{formatName(name)}</h1>
                </div>
            </div>

            {/* Right Side (Switch & Arrow) */}
            <div className="flex items-center gap-2 px-4 flex-shrink-0">
                <CustomSwitch 
                    checked={isChecked} 
                    onChange={handleChange} 
                    disabled={disabled} 
                    active={active} 
                    onClick={e => e.stopPropagation()} // Prevent card onClick when clicking switch
                />
                <ChevronRightIcon className={`w-6 h-6 cursor-pointer ${active ? "text-[#4B21E2] " : "text-[#5C5C7A]"}`} onClick={onClick} />
            </div>
        </div>
    );
};

export default SortableCategoryCard;