import React from "react";

function SectionMenuOption({ Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full aspect-square bg-[#EEEBFA] flex flex-col justify-center items-center rounded-[8px] p-4 gap-2 hover:bg-[#e7e2fa] active:scale-[0.9] transition-all cursor-pointer"
    >
      <Icon color="#323232" size={45} />
      <span className="poppins_reg text-[14px] text-[#5C5C7A]">{label}</span>
    </button>
  );
}

export default SectionMenuOption;
