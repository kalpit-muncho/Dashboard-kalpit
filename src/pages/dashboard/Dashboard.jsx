import React, { useEffect, useState } from 'react'
import DashboardContext from '../../contexts/dashboardContext';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Outlet } from 'react-router-dom';
import {
  CreateSectionModal,
  LinksModal,
  BannerModal,
  EditMenuModal,
  AddCategoryModal,
  AddMenuModel,
  CropImageModal,
  ResetPasswordModal,
  UpdateMenuModal,
  DownloadSettingsModal,
  AddOnGroupsModal
} from '../../components/modals';
import { ToastContainer } from 'react-toastify';
import { getSettings } from '../../models/RestaurantModel';
import { getMenu, getAddons, getAddonGroups } from '../../models/MenuModel';
import logo from '../../assets/images/muncho_logo.svg';


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("menu");
  const [createSection, setCreateSection] = useState(false);
  const [linksModal, setLinksModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [dishModal, setDishModal] = useState(false);
  const [editMenuModal, setEditMenuModal] = useState(false);
  const [addMenuModel, setAddMenuModel] = useState(false);
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [updateMenuModal, setUpdateMenuModal] = useState(false);
  const [downloadSettingsModal, setDownloadSettingsModal] = useState(false);
  const [addOnGroupsModal, setAddOnGroupsModal] = useState(false);
  const [links, setLinks] = useState([]);

  const [imageModalProps, setImageModalProps] = useState({});
  const [imageModal, setImageModal] = useState(false);
  const [cropData, setCropData] = useState(null);
  const [modalData, setModalData] = useState({});

  const [restaurant, setRestaurant] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [addons, setAddons] = useState(null);
  const [addonGroups, setAddonGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [settings, menuData, addons, addonGroups] = await Promise.all([
          getSettings(),
          getMenu(),
          getAddons(),
          getAddonGroups()
        ]);
        
        setMenuData(menuData || null);
        setRestaurant(settings || null);
        setAddons(addons || null);
        setAddonGroups(addonGroups || null);
        
        if (!menuData) console.error('No Menu found');
        if (!settings) console.error('No Data found');
        if (!addons) console.error('No Addons found');
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  },[])

  useEffect(() => {
    setAddonGroups(modalData.changedAddonGroups)
  }, [modalData.changedAddonGroups])

  const context = {
    modalData,
    setModalData,
    activeTab,
    setActiveTab,
    createSection,
    setCreateSection,
    linksModal,
    setLinksModal,
    links,
    setLinks,
    categoryModal,
    setCategoryModal,
    dishModal,
    setDishModal,
    imageModal,
    setImageModal,
    imageModalProps,
    setImageModalProps,
    cropData,
    setCropData,
    editMenuModal,
    setEditMenuModal,
    addMenuModel,
    setAddMenuModel,
    addCategoryModal,
    setAddCategoryModal,
    resetPasswordModal,
    setResetPasswordModal,
    updateMenuModal,
    setUpdateMenuModal,
    downloadSettingsModal,
    setDownloadSettingsModal,
    addOnGroupsModal,
    setAddOnGroupsModal,
  }

  if (loading) {
    return (
      <div className='w-screen h-screen flex flex-col items-center justify-center animate-pulse gap-1'>
          <img src={logo} alt="Muncho Logo" className='w-[400px] mb-4' />
          <div className="flex flex-row gap-2">
            <div className="w-4 h-4 rounded-full bg-[#4B21E2] animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-[#4B21E2] animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-[#4B21E2] animate-bounce [animation-delay:-.5s]"></div>
          </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-screen h-screen flex flex-col items-center justify-center gap-4'>
        <img src={logo} alt="Muncho Logo" className='w-[400px] mb-4' />
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#4B21E2] text-white rounded hover:bg-[#3918c7]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardContext.Provider value={context}>
      <section className='w-screen h-screen flex flex-col md:flex-row overflow-auto'>
        {/* Modals */}
        {addOnGroupsModal && <AddOnGroupsModal setModal={setAddOnGroupsModal} />}
        {downloadSettingsModal && <DownloadSettingsModal setModal={setDownloadSettingsModal} />}
        {updateMenuModal && <UpdateMenuModal setModal={setUpdateMenuModal} />}
        {resetPasswordModal && <ResetPasswordModal setModal={setResetPasswordModal} />}
        {addCategoryModal && <AddCategoryModal setModal={setAddCategoryModal} />}
        {editMenuModal && <EditMenuModal setModal={setEditMenuModal} />}
        {addMenuModel && <AddMenuModel setModal={setAddMenuModel} />}
        {imageModal && <CropImageModal {...imageModalProps} modalData={modalData} />}
        {createSection && <CreateSectionModal />}
        {linksModal && <LinksModal />}
        {(categoryModal || dishModal) && <BannerModal />}
        <div className='sticky top-0 left-0 shrink-0 h-screen'>
          <DashboardSidebar />
        </div>
        <div className='flex pt-12 md:pt-0 w-full flex-grow overflow-y-auto'>
          <Outlet context={{restaurant, menuData, addons, addonGroups }}  />
        </div>
        <ToastContainer />
      </section>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
