import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const SearchBar = ({ placeholder, onChange, bgColor, disabled }) => {
  return (
    <TextField
      disabled={disabled ? disabled : false}
      variant="outlined"
      placeholder={placeholder}
      onChange={onChange}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        sx: {
          disabled: {
            opacity: 0.5,
            pointerEvents: "none",
          },
          fontSize: "14px",
          fontFamily: 'Satoshi, sans-serif',
          borderRadius: "8px",
          backgroundColor: bgColor ? bgColor : "#F8F7FA",
          border: "none",
          "& fieldset": { border: "none" }, // Removes the default border
          "& .MuiInputBase-input": {
            fontSize: "14px",
            padding: "12px 0px 12px 0px", // Corrected padding inside input
          },
          "& .MuiInputBase-input::placeholder": {
            color: "#5C5C7A",
            opacity: 1, // Ensures full visibility of placeholder color
          },
        },
      }}
    />
  );
};

export default SearchBar;
