import React, { useState, useRef, useEffect } from "react";
import {
  Popover,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Box
} from "@mui/material";

const RadioDropdown = ({
  onChange,
  options,
  defaultValue,
  value,
  backgroundColor = "#F8F7FA", // Default background color
  textColor = "#201F33", // Default text color
  selectedTextColor = "#323232", // Default selected text color
  selectedBgColor = "#F8F7FA" // Default selected background color
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(value || defaultValue || options[0]);

  const buttonRef = useRef(null);

  // Update selected when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelected(value);
    }
  }, [value]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  }; 

  const handleRadioChange = (event) => {
    const value = event.target.value;
    setSelected(value);
    if (onChange) onChange(value);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        onClick={handleClick}
        ref={buttonRef}
        sx={{
          fontSize: 12,
          fontFamily: "Satoshi",
          fontWeight: 500,
          bgcolor: backgroundColor,
          color: textColor,
          borderRadius: 2,
          boxShadow: "none",
          width: "100%",
          height: 40,
          padding: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          border: "none",
        }}
      >
        <span className="max-w-[180px] truncate">
          {selected}
        </span>
        <span className="pl-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={textColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          sx: {
            bgcolor: "#F8F7FA",
            borderRadius: 1,
            mt: 0.5,
            boxShadow: "none",
            minWidth: anchorEl?.offsetWidth || 150,
          },
        }}
      >
        <RadioGroup value={selected} onChange={handleRadioChange}>
          {options.map((option, index) => (
            <FormControlLabel
              key={index}
              value={option}
              control={
                <Radio
                  size="small"
                  sx={{
                    fontSize: 14,
                    fontFamily: "Satoshi",
                    color: "#323232",
                    "&.Mui-checked": {
                      color: "#323232",
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontSize: 12,
                    fontFamily: "Satoshi",
                    fontWeight: 500,
                    color: selected === option ? selectedTextColor : "#323232",
                  }}
                >
                  {option}
                </Typography>
              }
              sx={{
                mx: 0,
                px: 1,
                py: 0.5,
                width: "100%",
                backgroundColor: selected === option ? selectedBgColor : "",
                "&:hover": {
                  backgroundColor: "#F0F0F0",
                  borderRadius: 1,
                },
              }}
            />
          ))}
        </RadioGroup>
      </Popover>
    </Box>
  );
};

export default RadioDropdown;