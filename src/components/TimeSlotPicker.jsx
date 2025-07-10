import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TimeSlotPicker = ({ workingHours = {}, onChange }) => {
  const [operatingHours, setOperatingHours] = useState({
    Sun: [],
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
  });

  // Format and pass data to parent
  const notifyParent = (updatedHours) => {
    if (onChange && typeof onChange === 'function') {
      const formattedData = {
        sunday: updatedHours.Sun || [],
        monday: updatedHours.Mon || [],
        tuesday: updatedHours.Tue || [],
        wednesday: updatedHours.Wed || [],
        thursday: updatedHours.Thu || [],
        friday: updatedHours.Fri || [],
        saturday: updatedHours.Sat || [],
      };
      onChange(formattedData);
    }
  };

  // Initialize with workingHours prop
  useEffect(() => {
    if (workingHours && typeof workingHours === 'object') {
      const formattedHours = {
        Sun: Array.isArray(workingHours.sunday) ? workingHours.sunday.map(formatSlot) : [],
        Mon: Array.isArray(workingHours.monday) ? workingHours.monday.map(formatSlot) : [],
        Tue: Array.isArray(workingHours.tuesday) ? workingHours.tuesday.map(formatSlot) : [],
        Wed: Array.isArray(workingHours.wednesday) ? workingHours.wednesday.map(formatSlot) : [],
        Thu: Array.isArray(workingHours.thursday) ? workingHours.thursday.map(formatSlot) : [],
        Fri: Array.isArray(workingHours.friday) ? workingHours.friday.map(formatSlot) : [],
        Sat: Array.isArray(workingHours.saturday) ? workingHours.saturday.map(formatSlot) : [],
      };
      setOperatingHours(formattedHours);
    }
  }, [workingHours]);

  // Helper to format slot
  const formatSlot = (slot) => {
    if (typeof slot === 'string') {
      const [start, end] = slot.split('-');
      return { start, end };
    }
    return slot;
  };

  const convertToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const hasOverlap = (day, newStart, newEnd, excludeIndex = -1) => {
    const slots = operatingHours[day] || [];
    const newStartTime = convertToMinutes(newStart);
    const newEndTime = convertToMinutes(newEnd);
    
    if (newEndTime <= newStartTime) {
      toast.error('End time must be after start time', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        newestOnTop: false,
        closeOnClick: true,
        rtl: false,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        theme: 'dark',
      });
      return true;
    }

    return slots.some((slot, index) => {
      if (index === excludeIndex) return false;
      const existingStartTime = convertToMinutes(slot.start);
      const existingEndTime = convertToMinutes(slot.end);
      return (newStartTime < existingEndTime && newEndTime > existingStartTime);
    });
  };

  const addTimeSlot = (day) => {
    let newStart = '09:00';
    let newEnd = '17:00';
    
    if (operatingHours[day] && operatingHours[day].length > 0) {
      const sortedSlots = [...operatingHours[day]].sort(
        (a, b) => convertToMinutes(a.start) - convertToMinutes(b.start)
      );
      
      let foundGap = false;
      
      if (convertToMinutes(sortedSlots[0].start) >= 60) {
        newStart = '00:00';
        newEnd = sortedSlots[0].start;
        foundGap = true;
      }
      
      if (!foundGap) {
        for (let i = 0; i < sortedSlots.length - 1; i++) {
          const gapStart = sortedSlots[i].end;
          const gapEnd = sortedSlots[i + 1].start;
          if (convertToMinutes(gapEnd) - convertToMinutes(gapStart) >= 60) {
            newStart = gapStart;
            newEnd = gapEnd;
            foundGap = true;
            break;
          }
        }
      }
      
      if (!foundGap) {
        const lastSlot = sortedSlots[sortedSlots.length - 1];
        if (convertToMinutes('23:30') - convertToMinutes(lastSlot.end) >= 30) {
          newStart = lastSlot.end;
          newEnd = '23:30';
          foundGap = true;
        }
      }
      
      if (!foundGap) {
        toast.error(`No available time gaps for ${day}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          newestOnTop: false,
          closeOnClick: true,
          rtl: false,
          pauseOnFocusLoss: true,
          draggable: true,
          pauseOnHover: true,
          theme: 'dark',
        });
        return;
      }
    }
    
    if (operatingHours[day] && operatingHours[day].length >= 3) {
      toast.error(`Maximum 3 operating hours allowed for ${day}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        newestOnTop: false,
        closeOnClick: true,
        rtl: false,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        theme: 'dark',
      });
      return;
    }
    
    const newSlot = { start: newStart, end: newEnd };
    
    if (hasOverlap(day, newSlot.start, newSlot.end)) {
      toast.error(`New time slot overlaps with existing slots for ${day}`);
      return;
    }

    setOperatingHours(prev => {
      const updatedDay = [...(prev[day] || []), newSlot].sort(
        (a, b) => convertToMinutes(a.start) - convertToMinutes(b.start)
      );
      const updatedHours = { ...prev, [day]: updatedDay };
      notifyParent(updatedHours); // Notify parent after update
      return updatedHours;
    });
  };

  const removeTimeSlot = (day, index) => {
    if (!operatingHours[day]) return;
    
    setOperatingHours(prev => {
      const newSlots = [...prev[day]];
      newSlots.splice(index, 1);
      const updatedHours = { ...prev, [day]: newSlots };
      notifyParent(updatedHours); // Notify parent after update
      return updatedHours;
    });
  };

  const updateTimeSlot = (day, index, field, value) => {
    if (!operatingHours[day]) return;
    
    const updatedSlot = { 
      ...operatingHours[day][index],
      [field]: value 
    };
    
    if (field === 'end' && convertToMinutes(updatedSlot.end) <= convertToMinutes(updatedSlot.start)) {
      toast.error('End time must be after start time', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        newestOnTop: false,
        closeOnClick: true,
        rtl: false,
        pauseOnFocusLoss: true,
        draggable: true,
        pauseOnHover: true,
        theme: 'dark',
      });
      return;
    }
    
    if (field === 'start' || field === 'end') {
      if (hasOverlap(day, updatedSlot.start, updatedSlot.end, index)) {
        toast.error(`Time slot overlaps with other slots for ${day}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          newestOnTop: false,
          closeOnClick: true,
          rtl: false,
          pauseOnFocusLoss: true,
          draggable: true,
          pauseOnHover: true,
          theme: 'dark',
        });
        return;
      }
    }

    setOperatingHours(prev => {
      const newSlots = [...prev[day]];
      newSlots[index] = updatedSlot;
      const sortedSlots = newSlots.sort(
        (a, b) => convertToMinutes(a.start) - convertToMinutes(b.start)
      );
      const updatedHours = { ...prev, [day]: sortedSlots };
      notifyParent(updatedHours); // Notify parent after update
      return updatedHours;
    });
  };

  // Rest of the component (render method, helper functions, etc.) remains the same
  return (
    <div className="flex flex-col w-full h-full">      
      <div className="">
        {days.map((day) => (
          <div key={day} className="pb-2">
            <div className="flex justify-between mb-2 items-start">
              <span className="font-medium w-16 text-sm">{day}</span>
              <div className='flex flex-col gap-2 w-[232px]'>
                {(operatingHours[day] || []).map((slot, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <select
                      value={slot.start}
                      onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                      className="bg-[#F8F7FA] font-medium text-[#5C5C7A] rounded-md py-2 px-3 mr-2 text-xs appearance-none"
                    >
                      {generateTimeOptions()}
                    </select>
                    <span className="mx-2">—</span>
                    <select
                      value={slot.end}
                      onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                      className="bg-[#F8F7FA] font-medium text-[#5C5C7A] rounded-md py-2 px-3 mr-2 text-xs appearance-none"
                    >
                      {generateTimeOptions()}
                    </select>
                    <button 
                      onClick={() => removeTimeSlot(day, index)}
                      className="rounded-full p-1 text-[#323232] hover:"
                    >
                      <NotInterestedIcon />
                    </button>
                  </div>
                ))}
              </div>
              {(!operatingHours[day] || operatingHours[day].length === 0) ? (
                <div className="text-gray-500 text-sm pr-34 pt-1"><span> Unavailable </span></div>
              ) : null}
              <button 
                onClick={() => addTimeSlot(day)}
                disabled={operatingHours[day] && operatingHours[day].length >= 3}
                className={`ml-auto rounded-full p-1 ${
                  operatingHours[day] && operatingHours[day].length >= 3 
                    ? 'text-[#323232] cursor-not-allowed' 
                    : ''
                }`}
              >
                <AddCircleOutlineIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions (generateTimeOptions, formatTime) remain the same
function generateTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of ['00', '30']) {
      const h = hour.toString().padStart(2, '0');
      const timeStr = `${h}:${minute}`;
      options.push(
        <option key={timeStr} value={timeStr}>
          {formatTime(timeStr)}
        </option>
      );
    }
  }
  return options;
}

function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const period = h >= 12 ? 'pm' : 'am';
  const formattedHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${formattedHour}:${minutes}${period}`;
}

export default TimeSlotPicker;