import React from "react";

// Icons
import { Pencil } from "lucide-react";

// Components
import SmButton from "./Common/SmButton";
import DeleteButton from "./Common/DeleteButton";

function LinkEditor({
  title,
  isActive,
  enableDelete = false,
  lableValue,
  linkValue,
  onLableChange,
  onLinkChange,
  onClick,
  onSave,
  onDelete,
}) {
  return (
    <div className="w-full h-fit relative">
      <button
        onClick={onClick}
        className={`w-full h-fit flex justify-between items-center gap-2 rounded-[8px] p-2 relative hover:bg-[#EEEBFA] cursor-pointer z-0 ${
          isActive && "border-2 border-[#4B21E2]"
        }`}
      >
        <span
          className={`poppins_reg text-[14px] ${
            isActive ? "text-[#4B21E2]" : "text-black"
          }`}
        >
          {title}
        </span>
        <Pencil color={`${isActive ? "#4B21E2" : "#5C5C7A"}`} size={17} />
      </button>

      {isActive && (
        <div className="w-[300px] h-fit absolute top-[50%] left-[50%] bg-white flex flex-col justify-center items-start gap-3 rounded-[8px] p-2.5 shadow-lg z-50">
          <input
            className="w-full h-fit poppins_reg bg-[#EEEBFA] text-[14px] text-black placeholder:text-[#606060] focus:outline-none rounded-[8px] px-1.5 py-2"
            type="text"
            name="title"
            placeholder="lable"
            value={lableValue}
            onChange={onLableChange}
          />
          <input
            className="w-full h-fit poppins_reg bg-[#EEEBFA] text-[14px] text-black placeholder:text-[#606060] focus:outline-none rounded-[8px] px-1.5 py-2"
            type="text"
            name="link"
            placeholder="link"
            value={linkValue}
            onChange={onLinkChange}
          />
          <div className="w-full h-fit flex justify-between items-center">
            <SmButton title={"Save"} onClick={onSave} />
            {enableDelete && <DeleteButton onClick={onDelete} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default LinkEditor;
