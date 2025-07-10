import React from "react";

function Menu({ links, active }) {
  return (
    <div className="w-[82%] h-fit grid grid-cols-3 gap-3 absolute top-[70px] left-1/2 -translate-x-1/2 bg-white rounded-[0.8rem] px-24 py-5 z-30 shadow-lg">
      {links?.length > 0 &&
        links.map(({ title }, index) => (
          <span
            key={index}
            className={`w-fit text-black text-[0.8rem] px-2 py-1.5 inter_reg ${
              active === title && "bg-[#EBEBEC] rounded-[0.5rem] inter_med"
            }`}
          >
            {title}
          </span>
        ))}
    </div>
  );
}

export default Menu;
