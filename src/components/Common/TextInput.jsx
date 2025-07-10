import React, { useRef, useEffect } from "react";

function TextInput({
  name,
  placeholder,
  value,
  onChange,
  styles = "",
  isTextArea = false,
  className = "",
  ...props
}) {
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (isTextArea && textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
    }
  }, [value, isTextArea]);

  if (isTextArea) {
    return (
      <textarea
        ref={textAreaRef}
        className={`poppins_reg w-full text-[14px] text-[#5C5C7A] placeholder:text-[#5C5C7A] focus:outline-none px-2 py-3 ${styles} ${className} h-auto resize-none`}
        onChange={onChange}
        value={value}
        name={name}
        placeholder={placeholder}
        {...props}
      />
    );
  }
  return (
    <input
      className={`poppins_reg w-full text-[14px] text-[#5C5C7A] placeholder:text-[#5C5C7A] focus:outline-none px-2 py-3 ${styles} ${className} h-auto`}
      onChange={onChange}
      value={value}
      type="text"
      name={name}
      placeholder={placeholder}
      {...props}
    />
  );
}

export default TextInput;
