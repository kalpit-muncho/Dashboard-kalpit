import React, { useState, useEffect } from "react";

const Textarea = ({ maxChars = 100, onChange, value, defaultValue, className }) => {
  const [text, setText] = useState(defaultValue || value || "");
  
  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setText(value);
    }
  }, [value]);

  const handleChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= maxChars) {
      setText(newText);
      if (onChange) {
        onChange(newText);
      }
    }
  };

  return (
    <div className={"relative bg-[#F8F7FA] rounded-xl p-4 w-full min-h-[140px]  " + className} >
      {/* Textarea */}
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Description here.."
        className="w-full h-full bg-transparent outline-none text-[#5C5C7A] text-sm resize-none placeholder:text-[#B9B9C7] placeholder:font-medium placeholder:text-sm"
      />
      
      {/* Character Counter */}
      <div className="absolute bottom-3 right-3 text-xs text-[#5C5C7A]">
        {text.length}/{maxChars}
      </div>
    </div>
  );
};

export default Textarea;