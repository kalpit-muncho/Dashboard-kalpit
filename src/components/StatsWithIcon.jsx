import React from 'react';

const StatsWithIcon = ({ props }) => {
  const { isHighlighted = false, icon, value, title, onClick } = props;
  return (
    <div 
      className={`relative flex flex-col w-full max-w-[340px] px-4 py-3 rounded-[8px] 
        ${isHighlighted ? 'bg-[#4B21E2]' : 'bg-[#F8F7FA]'} sm:max-w-[280px] md:max-w-[320px] lg:max-w-[340px]`} 
      onClick={onClick}
    >
      <div className='absolute top-2 right-2 p-1.5 md:p-3 rounded-xl bg-white shadow-sm'>
        {icon}
      </div>
      <div className='flex flex-col gap-4 mt-4 text-center sm:text-left'>
        <span className={`font-semibold ${isHighlighted ? 'text-white' : 'text-black'} text-4xl`}>{value}</span>
        <span className={`text-lg ${isHighlighted ? 'text-white' : 'text-black'}`}>{title}</span>
      </div>
    </div>
  );
};

export default StatsWithIcon;