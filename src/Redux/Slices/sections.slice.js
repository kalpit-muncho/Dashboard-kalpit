import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sendSectionTabs } from "../../services/websiteTemplate";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getUserId } from "../../utils/user";

// Permanent Sections
import Nav from "../../Components/Sections/Nav";
import Hero from "../../Components/Sections/Hero";
import Footer from "../../components/Sections/Footer";

const sectionTabs = [
  {
    id: "nav",
    name: "Navigation Bar",
    isLocked: true,
    section: "Nav", // store as string
    priority: 0,
  },
  {
    id: "hero",
    name: "Hero Section",
    isLocked: true,
    section: "Hero",
    priority: 1,
  },
  {
    id: "footer",
    name: "Footer",
    isLocked: true,
    section: "Footer",
    priority: 9999,
  },
];

const initialState = {
  sectionTabs,
};

// Async thunk to send sectionTabs to backend
export const saveSectionTabs = createAsyncThunk(
  "sections/saveSectionTabs",
  async (sectionTabs, thunkAPI) => {
    try {
      const userId = getUserId();
      const response = await sendSectionTabs(sectionTabs, userId);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// NOTE: These thunks are now deprecated and should be replaced by direct API usage via sectionListService.js

// Async thunk to fetch sectionTabs from backend
export const fetchSectionTabs = createAsyncThunk(
  "sections/fetchSectionTabs",
  async (_, thunkAPI) => {
    try {
      const userId = getUserId();
      const response = await axios.get(
        "https://backend-template-eight.vercel.app/api/sections",
        {
          params: { userId },
          withCredentials: true,
        }
      );
      return response.data.sectionTabs;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async thunk to delete a section by index
export const deleteSection = createAsyncThunk(
  "sections/deleteSection",
  async (index, thunkAPI) => {
    try {
      const userId = getUserId();
      const response = await axios.delete(
        `https://backend-template-eight.vercel.app/api/sections/${index}`,
        { data: { userId }, withCredentials: true }
      );
      return response.data.sectionTabs;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async thunk to update/reorder sectionTabs
export const updateSectionTabs = createAsyncThunk(
  "sections/updateSectionTabs",
  async (sectionTabs, thunkAPI) => {
    try {
      const userId = getUserId();
      const response = await axios.put(
        "https://backend-template-eight.vercel.app/api/sections",
        { sectionTabs, userId },
        { withCredentials: true }
      );
      return response.data.sectionTabs;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const sectionsSlice = createSlice({
  name: "sections",
  initialState,
  reducers: {
    addSection: (state, action) => {
      // Insert before Footer, assign unique id and next priority
      const dynamicSections = state.sectionTabs.filter(
        (s) => !s.isLocked && s.section !== "Footer"
      );
      const nextPriority =
        dynamicSections.length > 0
          ? Math.max(...dynamicSections.map((s) => s.priority || 2)) + 1
          : 2;
      const newSection = {
        ...action.payload,
        id: uuidv4(),
        priority: nextPriority,
      };
      state.sectionTabs.splice(state.sectionTabs.length - 1, 0, newSection);
    },
    removeSection: (state, action) => {
      state.sectionTabs.splice(action.payload, 1);
    },
    setSectionTabs: (state, action) => {
      state.sectionTabs = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSectionTabs.fulfilled, (state, action) => {
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.sectionTabs = action.payload;
        }
      })
      .addCase(deleteSection.fulfilled, (state, action) => {
        state.sectionTabs = action.payload;
      })
      .addCase(updateSectionTabs.fulfilled, (state, action) => {
        state.sectionTabs = action.payload;
      });
  },
});

export const { addSection } = sectionsSlice.actions; // Export actions
export const selectSectionTabs = (state) => state.sections.sectionTabs; // Export selector
export default sectionsSlice.reducer; // Export reducer
