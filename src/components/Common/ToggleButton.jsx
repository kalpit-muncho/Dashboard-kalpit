import React, { useState } from "react";

// Icons
import { ChevronsUpDown, ChevronRight } from "lucide-react";

function ToggleButton({
  label,
  isActive = false,
  showHover = false,
  showSlider = false,
  showArrow = false,
  isEnabled = false,
  onToggle,
  onClick
}) {
  const [switchon, setSwitchon] = useState(false);
  return (
    <div onClick={onClick}
      className={`w-full h-fit flex justify-between items-center gap-2 p-4 rounded-[8px] cursor-pointer ${
        showHover ? "hover:bg-[#EEEBFA] transition-colors duration-200" : ""
      } ${isActive ? "bg-[#EEEBFA]" : "bg-transparent"}`}
    >
      <div className="w-full h-fit flex justify-start items-center gap-2">
        {showSlider && (
          <ChevronsUpDown
            color={`${isActive ? "#4B21E2" : "#5C5C7A"}`}
            size={24}
            className="cursor-s-resize"
          />
        )}
        <span
          className={`poppins_reg text-[15px] ${
            isActive ? "text-[#4B21E2]" : "text-[#5C5C7A]"
          }`}
        >
          {label}
        </span>
      </div>

      <div className="w-full h-fit flex justify-end items-center gap-2">
        {/* Toggle Button  */}
        <button
          onClick={onToggle}
          className={`w-[35px] h-fit rounded-full overflow-hidden transition-colors duration-100 relative cursor-pointer p-[3px] ${
            isEnabled ? "bg-[#4B21E2]" : "bg-[#5C5C7A]"
          }`}
        >
          <div
            className={`w-[12px] aspect-square bg-white rounded-full transition-all duration-100 relative ${
              isEnabled
                ? "left-[100%] -translate-x-[100%]"
                : "left-[0%] -translate-x-[0%]"
            }`}
          ></div>
        </button>

        {showArrow && (
          <ChevronRight
            color={`${isActive ? "#4B21E2" : "#5C5C7A"}`}
            size={24}
          />
        )}
      </div>
    </div>
  );
}

export default ToggleButton;
