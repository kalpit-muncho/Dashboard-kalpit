import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/images/muncho_logo.svg";
import DashboardContext from "../contexts/dashboardContext";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ViewCarouselOutlinedIcon from '@mui/icons-material/ViewCarouselOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';

const tabs = [
  { id: "menu", label: "Menu", icon: MenuBookIcon },
  { id: "upsells", label: "Upsells", icon: AttachMoneyIcon },
  { id: "banners", label: "Ads", icon: ViewCarouselOutlinedIcon },
  { id: "appearance", label: "Appearance", icon: ColorLensOutlinedIcon },
  { id: "customer", label: "Customer", icon: PeopleAltOutlinedIcon },
  { id: "reviews", label: "Reviews", icon: RateReviewOutlinedIcon },
  { id: "staff", label: "Staff", icon: PersonOutlineOutlinedIcon },
  {id:"website", label: "Website", icon: LanguageIcon},
];

const SidebarTab = ({ id, label, Icon, isActive, closeSidebar }) => {
  const navigate = useNavigate();

  const handleTabClick = () => {
    closeSidebar();
    navigate('/dashboard/' + id);
  }

  return (
    <li onClick={handleTabClick} className="cursor-pointer min-w-[160px]">
      <div className={`flex items-center gap-4 p-3 rounded-xl transition-colors duration-300 hover:bg-[#F8F7FA] ${isActive ? "bg-[#EEEBFA] hover:bg-[#EEEBFA] text-[#4B21E2]" : "text-[#5C5C7A]"}`}>
        <Icon />
        <span className="text-sm">{label}</span>
      </div>
    </li>
  );
};

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const dashboardContext = useContext(DashboardContext);
  const { setActiveTab } = dashboardContext;

  // Determine which tab is active based on the current URL path
  const getCurrentTab = () => {
    const path = location.pathname;
    
    // Extract the tab from the path - get the part after '/dashboard/'
    const pathParts = path.split('/');
    if (pathParts.length >= 3) {
      return pathParts[2]; // Returns the part after '/dashboard/'
    }
    return "menu"; // Default tab
  };

  const currentTab = getCurrentTab();
  
  // Function to get page title based on current tab
  const getPageTitle = (tabId) => {
    const titleMap = {
      menu: "Menu | Muncho Dashboard",
      upsells: "Upsells | Muncho Dashboard", 
      banners: "Ads | Muncho Dashboard",
      appearance: "Appearance | Muncho Dashboard",
      customer: "Customer | Muncho Dashboard",
      reviews: "Reviews | Muncho Dashboard", 
      staff: "Staff | Muncho Dashboard",
      settings: "Settings | Muncho Dashboard"
    };
    return titleMap[tabId] || "Muncho Dashboard";
  };

  // Update page title when route changes
  React.useEffect(() => {
    document.title = getPageTitle(currentTab);
  }, [currentTab]);
  
  // Update context state to match URL (optional, depending on if you still need this elsewhere)
  React.useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab, setActiveTab]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.clear();
    navigate("/");
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="fixed top-0 left-0 w-full border-1 border-gray-300 bg-white md:hidden z-100">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-4 w-full flex items-center gap-4"
        >
          <MenuIcon />
          <img src={logo} alt="muncho logo" className="w-30" />
        </button>
      </div>

      {/* Overlay for mobile menu */}
      {isOpen && <div className="fixed inset-0 bg-black opacity-50 md:hidden z-99" onClick={closeSidebar}></div>}
      
      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 z-100 h-full bg-white w-[15vw] min-w-[180px] p-4 border-r border-[#E8E6ED] transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex flex-col h-full gap-4">
          {/* Logo */}
          <div className="w-full flex items-center justify-center">
            <img src={logo} alt="Muncho Logo" className="w-[140px]" />
          </div>

          {/* Navigation */}
          <div className="flex flex-col justify-between h-full py-8">
            <ul className="flex flex-col gap-2 text-lg font-medium">
              {tabs.map(({ id, label, icon: Icon }) => (
                <SidebarTab
                  key={id}
                  id={id}
                  label={label}
                  Icon={Icon}
                  isActive={currentTab === id}
                  closeSidebar={closeSidebar}
                />
              ))}
            </ul>

            {/* Settings & Logout */}
            <ul className="flex flex-col gap-2 text-lg font-medium">
              <li onClick={() => { closeSidebar(); navigate('/dashboard/settings'); }} className="cursor-pointer">
                <div className={`flex items-center gap-4 p-3 rounded-xl ${currentTab === "settings" ? "bg-[#EEEBFA] text-[#4B21E2]" : "text-[#5C5C7A]"}`}>
                  <SettingsOutlinedIcon />
                  <span className="text-sm">Settings</span>
                </div>
              </li>
              <li className="cursor-pointer" onClick={handleLogout}>
                <button className="flex items-center gap-4 p-3 rounded-xl text-[#5C5C7A] cursor-pointer" >
                  <LogoutIcon width={24} height={24} />
                  <span className="text-sm cursor-pointer">Log Out</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;