import React from 'react';

// Reusable Button Component
const Button = ({ variant = 'primary', size = 'medium', className, children, onClick, disabled=false }) => {
  // color styles
  const variants = {
    primary: 'bg-[#4B21E2] text-white',
    secondary: 'bg-[#201F33] text-white',
    tertiary: 'bg-[#F8F7FA] text-black'
  };
  
  // Size configurations
  const sizes = {
    large: 'py-2 px-3 text-md  md:py-4 md:px-6 md:text-lg',
    medium: 'py-2 px-3 text-base md:py-2.5 md:px-3.5 md:text-md',
    small: 'py-1.5 px-3 text-sm md:text-sm'
  };
  
  // Base classes for all buttons
  const baseClasses = 'rounded-lg flex items-center cursor-pointer gap-2 w-fit h-fit whitespace-nowrap disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#6B7280] transition duration-200 ease-in-out';
  
  // Combine classes based on props
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button className={buttonClasses} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;