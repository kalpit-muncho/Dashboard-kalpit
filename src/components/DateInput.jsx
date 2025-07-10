import React, { useState } from 'react';
import { TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs from 'dayjs';

const DateInput = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="relative inline-block" >
        <TextField
          value={selectedDate ? dayjs(selectedDate).format('DD/MM/YYYY') : ''}
          placeholder="DD/MM/YY"
          variant="outlined"
          size="small"
          className="w-48 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleOpenDialog}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <IconButton onClick={handleOpenDialog} size="small">
                <CalendarMonthIcon />
              </IconButton>
            ),
          }}
        />

        <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Select Date</DialogTitle>
          <DialogContent>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} />}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default DateInput;