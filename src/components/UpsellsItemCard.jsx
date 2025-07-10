import React, { useState } from "react";
import Checkbox from "@mui/material/Checkbox";

const UpsellsItemCard = ({ label, onChange, variant = "normal", type, checked, isOnClick=false }) => {
  const [selected, setSelected] = useState(false);

  const setColor = (type) => {
    if (type === "veg") return "bg-[#4CAF50]";
    if (type === "non-veg") return "bg-[#D84343]";
    if (type === "egg") return "bg-[#C8B439]";
    if (type === "liquor") return "bg-[#3C40E5]";
    // if (type === null || type === '') return "bg-gray-200";
  };

  const handleChange = (event) => {
    const newSelected = !selected;
    setSelected(newSelected);
    if (onChange) {
      onChange(newSelected);
    }
  };

  return (
    <div
      className={
        "flex gap-4 items-center justify-between rounded-lg p-4 w-full h-[56px] relative overflow-hidden cursor-pointer border-[1px] border-[#E8E6ED] " +
        (checked ? "bg-[#F8F7FA]" : "bg-white")
      }
      onClick={isOnClick ? handleChange : () => {}}
    >
      <div className="flex items-center gap-2.5 pr-6 h-fit" title={label}>
        {variant === "checked" && (
          <Checkbox
            checked={checked}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onChange(e.target.checked)}
            disableRipple
            sx={{
              padding: 0,
              margin: 0,
              "& .MuiSvgIcon-root": {
                margin: 0,
                fontSize: 19,
              },
              "&.Mui-checked": {
                color: "#65558F",
              },
            }}
          />
        )}
        <span className="text-[#5C5C7A] text-[14px] font-medium">{label}</span>
      </div>
      <div className={`absolute right-0 top-0 h-full ${setColor(type)} transition-all duration-300 w-4`}></div>
    </div>
  );
};

export default UpsellsItemCard;