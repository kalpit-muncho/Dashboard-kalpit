import React from "react";

function SmButton({
  Icon = undefined,
  iconSize,
  iconColor,
  title,
  onClick,
  styles = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`w-fit h-fit bg-black flex justify-center items-center gap-2 rounded-[8px] px-5 py-2 cursor-pointer ${styles}`}
    >
      {Icon && <Icon color={iconColor} size={iconSize} />}
      <span className="poppins_reg text-white text-[14px]">{title}</span>
    </button>
  );
}

export default SmButton;
