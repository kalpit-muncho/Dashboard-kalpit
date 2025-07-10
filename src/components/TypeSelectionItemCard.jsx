import React, { useState, useEffect } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Switch,Checkbox } from "@mui/material";
import { styled } from "@mui/system";
import { setDishStatus } from "../models/MenuModel";
import { toast } from "react-toastify";

// Custom Switch
const CustomSwitch = styled(Switch)(({active}) => ({
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
    backgroundColor: "#5C5C7A", // Default color
    opacity: 1,
  },
}));

// Get category color
const getTypeColor = (type) => {
  const colors = {
    veg: "bg-[#4CAF50]",
    "non-veg": "bg-[#D84343]",
    egg: "bg-[#C8B439]",
    liquor: "bg-[#3C40E5]",
  };
  return colors[type];
};

const ItemCard = ({ id, name, type, checked, onChange, onItemSelected, isSelected }) => {

  const [disabled, setDisabled] = useState(false)
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleDishStatusChange = async (event) => {
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
      setDisabled(true)
      const promise = setDishStatus(id, checked);
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
      onChange(id,checked);
    } catch (error) {
      onChange(id, checked);
      setDisabled(false)
      setIsChecked(!checked);
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

    const onSelected = (id) => {
      onItemSelected(id);
    }

  return (
    <div
      className={`flex rounded-xl justify-between items-center h-[66px] overflow-hidden relative text-[#5C5C7A] transition-all duration-300 cursor-pointer hover:bg-[#F8F7FA] border-[1px] border-[#E8E6ED] shadow-xs ${isSelected ? "bg-[#F8F7FA]" : "bg-white"} `}
      onClick={onSelected.bind(this, id)}
    >
      {/* Left Side */}
      <div className="flex gap-3 px-3 py-3 items-center justify-center"  >
        <Checkbox
            size="small"
            onChange={onSelected.bind(this, id)}
            onClick={(e) => e.stopPropagation()}
            checked={isSelected}
            sx={{
                padding: 0,
                "&.Mui-checked": {
                    color: "#65558F",
                },
                "&.MuiCheckbox-root": {
                    padding: 0,
                    fontSize: "14px",
                },
            }}
        />
        <h1 className={`flex  justify-center items-center text-[14px] leading-tight cursor-pointer h-[42px] text-[#5C5C7A]`} title={name} >{formatName(name)}</h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 px-4">
        <CustomSwitch checked={isChecked} onChange={handleDishStatusChange} disabled={disabled} active={false} />
        <ChevronRightIcon className={`w-6 h-6 cursor-pointer text-[#5C5C7A]`}  />
      </div>

      {/* Type Indicator */}
      <div className={`absolute right-0 top-0 h-full w-4 ${getTypeColor(type)}`} />
    </div>
  );
};

export default ItemCard;
