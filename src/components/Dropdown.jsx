import React, { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Dropdown = ({ 
    options, 
    placeholder = 'Select color', 
    bgColor = 'bg-white', 
    dropdownBgColor = 'bg-[#201F33]',
    dropdownTextColor = 'text-black',
    textColor = 'text-[#333]',
    onChange,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(null);
  
    // Toggle dropdown visibility
    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };
  
    // Handle option selection
    const handleSelect = (option) => {
      setSelected(option);
      setIsOpen(false);
      if (onChange) {
        onChange(option);
      }
    };
  
    return (
      <div className="relative w-full">
        {/* button */}
        <button
          onClick={toggleDropdown}
          disabled={disabled}
          className={`w-full ${bgColor} ${textColor} rounded-[12px] py-2 px-4 text-xs flex justify-between items-center disabled:bg-gray-400 disabled:cursor-not-allowed`}
          style={{ backgroundColor: disabled ? '#9ca3af' : bgColor.includes('bg-[#F8F7FA]') ? '#F8F7FA' : 'white' }}
          title='Select an option'
        >
          <span>{selected ? selected : placeholder}</span>
          <KeyboardArrowDownIcon className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* dropdown */}
        {isOpen && (
          <div 
            className={`absolute mt-1.5 text-xs w-full rounded-[12px] ${dropdownBgColor} z-50`}
            style={{ 
              backgroundColor: dropdownBgColor.includes('bg-[#201F33]') ? '#201F33' : dropdownBgColor.includes('bg-gray-200') ? '#e5e7eb' : '#201F33'
            }}
          >
            <ul className="py-1">
              {options.map((option, index) => (
                <li
                  key={index}
                  className={`px-4 py-2 cursor-pointer ${dropdownTextColor} hover:bg-opacity-80 hover:bg-gray-100 transition-colors`}
                  onClick={() => handleSelect(option)}
                  style={{ 
                    color: dropdownTextColor.includes('text-black') ? '#000000' : dropdownTextColor.includes('text-white') ? '#ffffff' : '#000000'
                  }}
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
};

export default Dropdown;
