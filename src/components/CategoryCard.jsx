import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Switch from '@mui/material/Switch';
import { styled } from '@mui/system';

const CategoryCard = ({ id, groupId, tab, activeTab, onClick, menuType, stock, onChange }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1,
        backgroundColor: isDragging ? "#EEEBFA" : "",
        opacity: isDragging ? 0.9 : 1,
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
                    backgroundColor: "#4B21E2",
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
            backgroundColor: "#8669F1",
            opacity: 1,
        },
    }));

    const handleChange = (event) => {
        event.stopPropagation(); // Prevent click from bubbling to parent
        if (onChange) {
            // Use groupId for stock update instead of sortable id
            onChange(groupId, event.target.checked);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                flex justify-between gap-8 items-center w-full h-fit rounded-lg cursor-pointer
                ${activeTab === tab ? "bg-[#F8F7FA]" : ""} ${menuType === "prism" ? "p-[16px]" : "p-2 px-3"}
            `}
            onClick={onClick}
        >
            <div className="flex gap-4 items-center">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab touch-manipulation"
                    aria-label="Drag to reorder item"
                >
                    <svg
                        width="10"
                        height="18"
                        viewBox="0 0 10 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4.99991 2.83L8.16991 6L9.57991 4.59L4.99991 0L0.409912 4.59L1.82991 6L4.99991 2.83ZM4.99991 15.17L1.82991 12L0.419912 13.41L4.99991 18L9.58991 13.41L8.16991 12L4.99991 15.17Z"
                            fill="#323232"
                        />
                    </svg>
                </div>
                <span className="text-[14px] text-[#201F33] cursor-normal">{tab}</span>
            </div>
            <CustomSwitch
                checked={!!stock}  // Ensure boolean value
                onChange={handleChange}
                onClick={(e) => e.stopPropagation()} // Prevent triggering parent click
            />
            {/* {
                menuType === "prism" &&
                <CustomSwitch
                    checked={!!stock}  // Ensure boolean value
                    onChange={handleChange}
                    onClick={(e) => e.stopPropagation()} // Prevent triggering parent click
                />
            } */}
            {/* {
                menuType === "petpooja" &&
                <div>
                    <IconButton className="p-1 rounded-full bg-[#F8F7FA] cursor-pointer hover:bg-gray-200 transition-colors duration-300 w-fit h-fit">
                        <EditIcon className="text-[#323232]" />
                    </IconButton>
                </div>
            } */}
        </div>
    );
};

export default CategoryCard;