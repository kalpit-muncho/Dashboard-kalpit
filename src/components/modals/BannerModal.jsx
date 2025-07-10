import React, { useContext, useState, useEffect } from 'react';
import DashboardContext from '../../contexts/dashboardContext';
import CloseIcon from '@mui/icons-material/Close';
import SearchBar from '../SearchBar';
import { Radio } from '@mui/material';

const BannerModal = () => {
  const { categoryModal, setCategoryModal, dishModal, setDishModal, modalData, setModalData } = useContext(DashboardContext);
  const [categories, setCategories] = useState([]); // Initialize with empty array
  const [dishes, setDishes] = useState([]); // Initialize with empty array
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Add null checks before setting state
    console.log("Modal data:", modalData);
    if (modalData?.categories) {
      setCategories(modalData.categories);
    }
    if (modalData?.dishes) {
      setDishes(modalData.dishes);
    }
  }, [modalData]);

  const handleRadioChange = (e) => {
    // convert to number if needed
    const value = parseInt(e.target.value, 10);
    setSelectedItem(value);
    console.log("Selected item:", e.target.value);
  };
  
  const closeModal = () => {
    setCategoryModal(false);
    setDishModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Selected item:", selectedItem);
    setModalData(prev => {
      const newData = categoryModal ? { category_id: selectedItem } : { dish_id: selectedItem };
      return { ...prev, ...newData };
    });
    
    console.log("Modal data:", modalData);
    setCategoryModal(false);
    setDishModal(false);
  };

  const searchCategories = (e) => {
    const searchValue = e.target.value.toLowerCase();
    if (!modalData?.categories) return;
    
    const filteredCategories = modalData.categories.filter(category => 
      category.name.toLowerCase().includes(searchValue)
    );
    setCategories(filteredCategories);
    if (searchValue === "") {
      setCategories(modalData.categories || []);
    }
  }

  const searchDishes = (e) => {
    const searchValue = e.target.value.toLowerCase();
    if (!modalData?.dishes) return;
    
    const filteredDishes = modalData.dishes.filter(dish => 
      dish.name.toLowerCase().includes(searchValue)
    );
    setDishes(filteredDishes);
    if (searchValue === "") {
      setDishes(modalData.dishes || []);
    }
  }

  const renderCategories = () => (
    <div className='flex flex-col gap-2 w-full h-full px-10'>
      <SearchBar placeholder="Search for category" onChange={searchCategories} />
      <div className='flex flex-col gap-2 w-full h-[250px] overflow-y-scroll'>
        {categories?.map((item) => ( // Add optional chaining
          <div 
            className='flex gap-3 items-center border-b-[1px] border-[#E8E6ED] cursor-pointer'
            key={item.id}
            onClick={() => setSelectedItem(item.id)} // Add onClick to set selected item
          >
            <span className='flex items-center justify-center p-1.5'>
              <Radio
                name="category"
                size='small'
                value={item.id}
                onChange={handleRadioChange}
                checked={selectedItem === item.id}
                className='cursor-pointer'
                sx={{
                  padding: 0,
                  margin: 0,
                  color: "#323232",
                  "&.Mui-checked": {
                    color: "#323232",
                  },
                }}
              />
            </span>
            <p className='text-[#5C5C7A] text-[14px] cursor-pointer'>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDishes = () => (
    <div className='flex flex-col gap-2 w-full h-full px-10'>
      <SearchBar placeholder="Search for dishes" onChange={searchDishes} />
      <div className='flex flex-col gap-2 w-full h-[250px] overflow-y-scroll'>
        {dishes?.map((dish) => ( // Add optional chaining
          <div 
            className='flex gap-3 items-center border-b-[1px] border-[#E8E6ED] cursor-pointer' 
            key={dish.id}
            onClick={() => setSelectedItem(dish.id)} // Add onClick to set selected item
          >
            <span className='flex items-center justify-center p-1.5'>
              <Radio
                name="ads"
                size='small'
                value={dish.id}
                onChange={handleRadioChange}
                checked={selectedItem === dish.id}
                className='cursor-pointer'
                sx={{
                  padding: 0,
                  margin: 0,
                  color: "#323232",
                  "&.Mui-checked": {
                    color: "#323232",
                  },
                }}
              />
            </span>
            <p className='text-[#5C5C7A] text-[14px] cursor-pointer'>{dish.name}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className='absolute bg-black/85 flex justify-center items-center w-full h-full p-6' style={{ zIndex: 1000 }}>
      <div className='flex flex-col bg-white w-[35%] h-fit max-h-[75%] rounded-md px-6'>
        <div className='w-full flex justify-end py-2'>
          <button className='p-2 cursor-pointer' onClick={closeModal}>
            <CloseIcon fontSize='large' />
          </button>
        </div>
        {categoryModal && renderCategories()}
        {dishModal && renderDishes()}
        <div className="flex gap-4 justify-end py-4 w-full">
          <button className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 cursor-pointer" onClick={closeModal}>
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#4B21E2] text-white cursor-pointer"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerModal;