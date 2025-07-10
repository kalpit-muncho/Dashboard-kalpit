import React from "react";
import { X } from "lucide-react";

function SectionTab({
  Icon,
  title,
  isActive,
  onClick,
  styles = "",
  onDelete,
  showDelete,
}) {
  return (
    <div
      className={`w-full h-fit rounded-[8px] flex justify-between items-center gap-2 p-3 cursor-pointer ${
        isActive ? "bg-[#EEEBFA]" : "bg-[#F8F7FA]"
      } ${styles}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <Icon color={`${isActive ? "#4B21E2" : "#5C5C7A"}`} size={24} />
        <span
          className={`poppins_reg text-[14px] ${
            isActive ? "text-[#4B21E2]" : "text-[#5C5C7A]"
          }`}
        >
          {title}
        </span>
      </div>
      {showDelete && (
        <button
          className="ml-2 p-1 rounded hover:bg-red-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete();
          }}
        >
          <X size={18} color="#e53e3e" />
        </button>
      )}
    </div>
  );
}

export default SectionTab;
