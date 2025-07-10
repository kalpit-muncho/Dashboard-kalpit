import React from "react";

const Spinner = ({ size = 40, color = "#4B21E2" }) => (
  <div className="flex items-center justify-center">
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
    >
      <circle
        cx="20"
        cy="20"
        r="16"
        stroke={color}
        strokeWidth="4"
        strokeDasharray="80"
        strokeDashoffset="60"
        strokeLinecap="round"
        opacity="0.2"
      />
      <circle
        cx="20"
        cy="20"
        r="16"
        stroke={color}
        strokeWidth="4"
        strokeDasharray="40"
        strokeDashoffset="10"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

export default Spinner;
