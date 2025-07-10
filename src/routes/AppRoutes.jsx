import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/login/LoginPage";
import SendPasswordResetMail from "../pages/login/SendPasswordResetMail";
import ResetPassword from "../pages/login/ResetPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import StaffDetails from "../pages/staff/StaffDetails";
import WaiterList from "../pages/staff/WaiterList";
import EditStaff from "../pages/staff/EditStaff";
import CreateStaff from "../pages/staff/CreateStaff";
import Reviews from "../pages/reviews/Reviews";
import Appearance from "../pages/appearance/Appearance";
import Upsells from "../pages/upsells/Upsells";
import Settings from "../pages/settings/Settings";
import Banners from "../pages/banners/Banners";
import BannerAds from "../pages/banners/BannerAds";
import PopupAds from "../pages/banners/PopupAds";
import CreateBannerAd from "../pages/banners/CreateBannerAd";
import CreatePopupAd from "../pages/banners/CreatePopupAd";
import EditBannerAd from "../pages/banners/EditBannerAd";
import EditPopupAd from "../pages/banners/EditPopupAd";
import Customer from "../pages/customer/Customer";
import Website from "../pages/website/Website";
import Menu from "../pages/menu/Menu";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" />} />

    {/* Public Routes */}
    <Route path="login" element={<LoginPage />} />
    <Route
      path="login/send-password-reset-mail"
      element={<SendPasswordResetMail />}
    />
    <Route path="login/reset-password/:authToken" element={<ResetPassword />} />

    {/* Protected Dashboard Routes */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="menu" replace />} />

      {/* Nested Route -- Menu */}
      <Route path="menu" element={<Menu />}></Route>

      {/* Nested Route -- Upsells */}
      <Route path="upsells" element={<Upsells />} />

      {/* Nested Route -- Banners */}
      <Route path="banners" element={<Banners />}>
        <Route index element={<Navigate to="banner-ads" replace />} />
        <Route path="banner-ads" element={<BannerAds />} />
        <Route path="create-banner-ad" element={<CreateBannerAd />} />
        <Route path="banner-ads/:id" element={<EditBannerAd />} />
        <Route path="popup-ads" element={<PopupAds />} />
        <Route path="create-popup-ad" element={<CreatePopupAd />} />
        <Route path="popup-ads/:id" element={<EditPopupAd />} />
      </Route>

      {/* Nested Route -- Appearance */}
      <Route path="appearance" element={<Appearance />} />

      {/* Nested Route -- Customer */}
      <Route path="customer" element={<Customer />} />

      {/* Nested Route -- Reviews */}
      <Route path="reviews" element={<Reviews />} />

      {/* Nested Route -- Staff */}
      <Route path="staff" element={<StaffDetails />}>
        <Route index element={<Navigate to="staff-list" replace />} />
        <Route path="staff-list" element={<WaiterList />} />
        <Route path="create" element={<CreateStaff />} />
        <Route path=":id" element={<EditStaff />} />
      </Route>

      {/* Nested Route -- Settings */}
      <Route path="settings" element={<Settings />} />

      <Route path="website" element={<Website />} />
    </Route>

    {/* Not Found Page */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
export default AppRoutes;
