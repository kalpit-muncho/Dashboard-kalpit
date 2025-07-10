import React from "react";

function TabHeading({ title, description = undefined }) {
  return (
    <div className="w-full h-fit">
      <h1 className="poppins_med text-[#201F33] text-[18px]">{title}</h1>
      {description && (
        <p className="w-full max-w-[78%] poppins_reg text-[#5C5C7A] text-[14px] mt-3">
          {description}
        </p>
      )}
    </div>
  );
}

export default TabHeading;
