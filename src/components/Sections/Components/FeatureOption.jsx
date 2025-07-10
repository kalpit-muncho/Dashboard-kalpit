import React from "react";

function FeatureOption({Icon, label}) {
  return (
    <div className="w-full h-fit flex flex-col justify-center items-center gap-2">
      <Icon strokeWidth={1.5} size={22} color="#323232" />
      <span className="inter_reg text-[14px] text-black">{label}</span>
    </div>
  );
}

export default FeatureOption;
