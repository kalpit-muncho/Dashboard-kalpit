import React, { useState, useEffect } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";

const CustomDatePicker = ({ name, onChange, value, isTimeLimit=true }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [open, setOpen] = useState(false);

  //if !isTimeLimit, set selected date to null
  useEffect(() => {
    if (!isTimeLimit) {
      setSelectedDate(null);
    }
  }, [isTimeLimit]);

  // Sync with parent value
  useEffect(() => {
    if (value) {
      setSelectedDate(dayjs(value));
    }
  }, [value]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);

    const event = {
      target: {
        name: name,
        value: newDate ? newDate.toISOString() : "", // Send ISO string for consistency
      },
    };

    if (onChange) {
      onChange(event);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        name={name}
        minDate={dayjs()}
        value={selectedDate}
        onChange={handleDateChange}
        format="DD / MM / YYYY"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        disabled={!isTimeLimit}
        slotProps={{
          textField: {
            fullWidth: true,
            placeholder: "DD / MM / YY",
            onClick: () => setOpen(true),
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <CalendarTodayIcon
                    style={{ color: "#5C5C72", cursor: "pointer" }}
                    onClick={() => setOpen(true)}
                  />
                </InputAdornment>
              ),
            },
            sx: {
              fontSize: "12px",
              fontFamily: "Satoshi",
              backgroundColor: "#F8F7FC",
              borderRadius: "8px",
              height: "36px",
              "& .MuiOutlinedInput-root": {
                height: "36px",
                minHeight: "36px",
                padding: "6px 10px",
                "& fieldset": { border: "none" },
              },
            },
          },
          desktopPaper: {
            sx: {
              fontSize: "14px",
              fontFamily: "Satoshi",
              borderRadius: "12px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            },
          },
          popper: {
            sx: {
              fontFamily: "Satoshi",
              ".MuiPaper-root": {
                fontFamily: "Satoshi",
                borderRadius: "12px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              },
              ".MuiPickersDay-root": {
                fontFamily: "Satoshi",
                fontSize: "14px",
                fontWeight: "500",
              },
              ".MuiPickersDay-root.Mui-selected": {
                fontFamily: "Satoshi",
                backgroundColor: "#18181B",
                color: "#FFFFFF",
                borderRadius: "8px",
              },
              ".MuiPickersDay-root:not(.Mui-selected)": {
                "&:hover": {
                  backgroundColor: "#EEE",
                },
              },
              ".MuiPickersArrowSwitcher-root": {
                color: "#18181B",
                fontSize: "20px",
              },
              ".MuiTypography-root.MuiPickersToolbar-title": {
                fontFamily: "Satoshi",
                fontSize: "18px",
                fontWeight: "600",
                color: "#191919",
              },
              ".MuiTypography-caption": {
                fontFamily: "Satoshi",
                color: "#7C7C84",
                fontSize: "14px",
              },
              ".Mui-disabled": {
                color: "#D3D3D3",
                opacity: 0.5,
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;