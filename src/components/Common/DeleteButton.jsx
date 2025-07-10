import React from "react";

// Icons
import { Trash2 } from "lucide-react";

function DeleteButton({ onClick, styles = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-fit h-fit bg-red-600 flex justify-between items-center gap-2 rounded-[8px] px-2 py-2 cursor-pointer ${styles}`}
    >
      <Trash2 color="white" size={21} />
      <span className="poppins_reg text-white text-[14px]">Delete</span>
    </button>
  );
}

export default DeleteButton;
