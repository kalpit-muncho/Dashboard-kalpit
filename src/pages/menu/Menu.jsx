import React, { useState, useContext, useEffect } from "react";
import Tabs from "../../components/Tabs";
import Button from "../../components/Button";
import SearchBar from "../../components/SearchBar";
import ItemCard from "../../components/ItemCard";
import TypeSelectionItemCard from "../../components/TypeSelectionItemCard";
import SortableCategoryCard from "../../components/SortableCategoryCard"; // Import the new component
import DishDetails from "../../components/DishDetails";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import WidgetsIcon from '@mui/icons-material/Widgets';
import pot from "../../assets/images/pot.png";
import { getDishById, reorderCategories, reorderDishes, syncRestaurant, updateDishesType } from "../../models/MenuModel";
import DashboardContext from "../../contexts/dashboardContext";
import { Checkbox } from "@mui/material";
// Drag and Drop Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  MouseSensor,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import AssignTypeButton from "../../components/AssignTypeButton";
import { useOutletContext } from "react-router-dom";

const Menu = () => {
  const [menu, setMenu] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [activeCategory, setActiveCategory] = useState([]);
  const [activeDish, setActiveDish] = useState(null);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuGroups, setMenuGroups] = useState([]);
  const [activeMenuGroup, setActiveMenuGroup] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [menuType, setMenuType] = useState();
  const [loading, setLoading] = useState(false);
  const [outlets, setOutlets] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { setEditMenuModal, setAddCategoryModal, setModalData, setUpdateMenuModal, setAddOnGroupsModal, modalData } = useContext(DashboardContext);

  const { restaurant, menuData, addons, addonGroups } = useOutletContext();

  useEffect(() => {
    console.log("Restaurant data from Outlet:", restaurant);
    const fetchData = async () => {
      try {
        setLoading(true);  // Set loading to true before starting both fetches

        setMenuType(restaurant.type);
        localStorage.setItem("menuType", restaurant.type);

        setRestaurantData(restaurant);
        setOutlets(restaurant.outlets);
        setTagList(restaurant.tags);
        setMenu(menuData);
        
        const activeMenuGroups = menuData.menuGroups.filter(group => group.isActive !== false);
        const activeCategories = menuData.categories.filter(category => category.isActive !== false);
        const activeDishes = menuData.dishes.filter(dish => dish.outlets.some(outlet => outlet.isActive !== false));
        
        setMenuGroups(activeMenuGroups);
        setCategories(activeCategories);
        setDishes(activeDishes);
        setFilteredDishes([]);

        // Set tabs from active menu groups ordered by priority
        setTabs(
          activeMenuGroups
            .sort((a, b) => a.priority - b.priority)  // Sort menuGroups by priority
            .map(group => group.name)  // Map to get the names
        );

        // Set the first tab as active and its corresponding menuGroupId
        if (activeMenuGroups.length > 0) {
          setActiveTab(activeMenuGroups[0].name);
          setActiveMenuGroup(activeMenuGroups[0].id);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);  // Set loading to false when all data is fetched
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (modalData.updatedDish) {
      const changedDishData = modalData.updatedDish;

      // Update the main 'dishes' state
      setDishes(prevDishes =>
        prevDishes.map(d =>
          d.id === changedDishData.id ? { ...d, ...changedDishData } : d
        )
      );

      // Update 'filteredDishes' state
      setFilteredDishes(prevFilteredDishes =>
        prevFilteredDishes.map(d =>
          d.id === changedDishData.id ? { ...d, ...changedDishData } : d
        )
      );

      // Update 'activeDish' with the new data if it's the one that was edited
      if (activeDish && activeDish.id === changedDishData.id) {
        setActiveDish(prevActiveDish => ({ ...prevActiveDish, ...changedDishData }));
      }
      // Consider clearing modalData.updatedDish here if it's intended as a one-time trigger
      // e.g., setModalData(prev => ({ ...prev, updatedDish: null }));
    }
  }, [modalData.updatedDish]);


  // Modify the useEffect for category filtering
  useEffect(() => {
    // Filter categories by activeMenuGroup
    const filtered = categories.filter(category => category.menuGroupId === activeMenuGroup);
    // filter based on priority
    const sorted = filtered.sort((a, b) => a.priority - b.priority);
    // Set the filtered categories
    setFilteredCategories(sorted);
    // Don't set any active category here
    // This removes the automatic selection of the first category
  }, [activeMenuGroup, categories]);
  const openEditMenuModal = () => {
    // Set the modal data if needed
    setActiveDish(null); // Clear any active dish when opening the edit menu modal
    setModalData(prevData => ({ 
      ...prevData, 
      menuGroups, 
      categories 
    }));
    setEditMenuModal(true);
  };
  const openAddCategoryModal = () => {
    setActiveDish(null); // Clear any active dish when opening the add category modal
    setModalData(prevData => ({ 
      ...prevData, 
      menuGroups, 
      categories 
    }));
    setAddCategoryModal(true);
  };

  // Configure sensors with appropriate activation constraints
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleCategoryClick = async (category) => {
    // Toggle category if already active
    if (activeCategory?.id === category.id) {
      setActiveCategory(null);
      setFilteredDishes([]);
      setActiveDish(null);
      return;
    }

    // Set new active category
    setActiveCategory(category);

    // Filter, sort, and process dishes in a single pass
    const updated = dishes
      .filter(dish =>
        dish.categoryId === category.id &&
        dish.outlets.some(outlet => outlet.isActive)
      )
      .sort((a, b) => a.priority - b.priority)
      .map(dish => ({
        ...dish,
        isActive: dish.outlets.some(outlet => outlet.inStock)
      }));

    console.log("Filtered dishes:", updated);
    setFilteredDishes(updated);
    setActiveDish(null);
  };

  const handleDishClick = async (id) => {
    // check if dish is already active
    if (activeDish && activeDish.id === id) {
      setActiveDish(null); // Deselect if already active
      return;
    }
    // If a dish is clicked, set it as active
    const dish = await getDishById(dishes, id, outlets);
    console.log("Dish clicked:", dish);
    setActiveDish(dish);
  };

  // The tab change handler
  const onTabChange = (index) => {
    setActiveTab(tabs[index]);
    setActiveMenuGroup(menuGroups[index].id);
    setActiveCategory(null); // Reset active category on tab change
    setActiveDish(null); // Reset active dish on tab change
    setFilteredDishes([]); // Clear filtered dishes when tab changes
  };

  const [categoriesOrderChanged, setCategoriesOrderChanged] = useState(false);
  const [dishesOrderChanged, setDishesOrderChanged] = useState(false);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setCategoriesOrderChanged(true); // Mark that categories order has changed

      // 1. Reorder filteredCategories
      const oldIndex = filteredCategories.findIndex(category => category.id === active.id);
      const newIndex = filteredCategories.findIndex(category => category.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Category not found in filtered list during drag operation");
        return;
      }

      const reorderedFilteredCategories = arrayMove([...filteredCategories], oldIndex, newIndex);

      // 2. Update priorities within the reordered filteredCategories (relative to the current menu group)
      const updatedFilteredCategoriesWithNewPriorities = reorderedFilteredCategories.map((category, index) => ({
        ...category,
        priority: index + 1, // Priority within this filtered group
      }));

      // 3. Update filteredCategories state for immediate UI update
      setFilteredCategories(updatedFilteredCategoriesWithNewPriorities);

      // 4. Update the main categories state
      setCategories(prevGlobalCategories => {
        // Create a map of new priorities for categories in the active menu group
        const newPrioritiesMap = new Map();
        updatedFilteredCategoriesWithNewPriorities.forEach(cat => {
          newPrioritiesMap.set(cat.id, cat.priority);
        });

        // Update priorities in the global list for categories in the active menu group
        return prevGlobalCategories.map(category => {
          if (category.menuGroupId === activeMenuGroup) {
            const newPriority = newPrioritiesMap.get(category.id);
            if (newPriority !== undefined) {
              return { ...category, priority: newPriority };
            }
          }
          // Keep other categories (and their priorities) as they are
          return category;
        });
      });
    }
  };

  const handleDishDragEnd = (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setDishesOrderChanged(true); // Mark that dishes order has changed

      // Find the indices in the filtered dishes array
      const oldFilteredIndex = filteredDishes.findIndex(dish => dish.id === active.id);
      const newFilteredIndex = filteredDishes.findIndex(dish => dish.id === over.id);

      // Create a new reordered filtered dishes array
      const newFilteredDishes = arrayMove([...filteredDishes], oldFilteredIndex, newFilteredIndex);

      // Update priorities in the reordered filtered dishes
      const updatedFilteredDishes = newFilteredDishes.map((dish, index) => ({
        ...dish,
        priority: index + 1
      }));

      // Update the filtered dishes state
      setFilteredDishes(updatedFilteredDishes);

      // Update the main dishes array by preserving the original priorities for other categories
      // and only updating the priorities for dishes in the active category
      setDishes(prevDishes =>
        prevDishes.map(dish => {
          // Only update priority if the dish belongs to the active category
          if (dish.categoryId === activeCategory.id) {
            // Find this dish in our updated filtered dishes
            const updatedDish = updatedFilteredDishes.find(d => d.id === dish.id);
            if (updatedDish) {
              return {
                ...dish,
                priority: updatedDish.priority
              };
            }
          }
          // Return the dish unchanged if it's not in the active category
          return dish;
        })
      );
    }
  };

  const handleSaveReordering = async () => {
    try {
      // Only proceed if at least one type of ordering has changed
      if (!categoriesOrderChanged && !dishesOrderChanged) return;

      const promises = [];

      // Add category reordering if changed
      if (categoriesOrderChanged) {
        const categoryPayload = categories.map((category) => ({
          id: category.id,
          priority: category.priority,
        }));
        promises.push(reorderCategories(categoryPayload));
      }

      // Add dish reordering if changed
      if (dishesOrderChanged) {
        const dishPayload = filteredDishes.map((dish) => ({
          id: dish.id,
          priority: dish.priority,
        }));
        promises.push(reorderDishes(dishPayload));
      }

      // Use Promise.all to handle both requests if needed
      const promise = Promise.all(promises);

      toast.promise(promise, {
        pending: "Reordering menu...",
        success: "Reordered successfully!",
        error: "Error saving menu!",
      }, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });

      const resp = await promise;
      console.log("Reordered successfully:", resp);

      // Reset change tracking states after successful save
      setCategoriesOrderChanged(false);
      setDishesOrderChanged(false);

    } catch (error) {
      console.error("Error saving menu:", error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const syncRest = async () => {
    try {
      console.log("Syncing Prism...");
      const promise = syncRestaurant();
      toast.promise(promise, {
        pending: "Syncing restaurant...",
        success: "Synced successfully! reloading...",
        error: "Error syncing restaurant!",
      }, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      const resp = await promise;
      if (resp) {
        console.log("Synced successfully:", resp);
        //reload after 1 second
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error syncing Prism:", error);
      toast.error(error.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  }

  const handleUpdateMenu = async () => {
    setUpdateMenuModal(true);
    setModalData({ outlets: outlets });
  }

const handleSearch = (e) => {
  const searchValue = e.target.value.toLowerCase();
  if (searchValue === "") {
    setIsSearching(false);
    // If search is cleared, restore dishes based on the active category, if any
    if (activeCategory) {
      // Re-apply category filter, ensuring 'isActive' is set for display
      // This logic mirrors part of handleCategoryClick
      const categoryDishes = dishes
        .filter(dish =>
          dish.categoryId === activeCategory.id &&
          dish.outlets.some(outlet => outlet.isActive) // Standard category filter
        )
        .sort((a, b) => a.priority - b.priority)
        .map(dish => ({
          ...dish,
          isActive: dish.outlets.some(outlet => outlet.inStock) // Set display status for ItemCard
        }));
      setFilteredDishes(categoryDishes);
    } else {
      // No active category and search is empty, so clear dishes
      setFilteredDishes([]);
    }
    setActiveDish(null); // Clear active dish detail
  } else {
    setIsSearching(true);
    
    // Get categories that belong to the active menu group
    const activeMenuGroupCategories = categories.filter(category => 
      category.menuGroupId === activeMenuGroup
    );
    const activeMenuGroupCategoryIds = activeMenuGroupCategories.map(category => category.id);
    
    // Perform search only within dishes from active menu group
    const searchResults = dishes
      .filter(dish => 
        dish.name.toLowerCase().includes(searchValue) &&
        activeMenuGroupCategoryIds.includes(dish.categoryId)
      )
      .map(dish => {
        // Find the category for this dish
        const dishCategory = categories.find(cat => cat.id === dish.categoryId);
        return {
          ...dish,
          // Set isActive for display in ItemCard based on stock status
          isActive: dish.outlets.some(outlet => outlet.inStock),
          // Add category information for search results
          categoryName: dishCategory?.name || 'Unknown Category'
        };
      });
    
    setFilteredDishes(searchResults);
    setActiveDish(null); // Clear active dish detail when search results change
    // Note: activeCategory remains selected, but filteredDishes now shows search results.
    // This means the "Dishes" header might still show the active category name,
    // while the list below shows search results. This is a UI consideration.
  }
};

  const handleCategoryStatusChange = (id, checked) => {
    const updatedCategories = categories.map(category => {
      if (category.id === id) {
        return { ...category, inStock: checked };
      }
      return category;
    });
    setCategories(updatedCategories);
  }

  const handleDishStatusChange = (id, checked) => {
    const updatedDishes = dishes.map(dish => {
      if (dish.id === id) {
        // update inStock of all outlets
        const updatedOutlets = dish.outlets.map(outlet => {
          return { ...outlet, inStock: checked };
        });
        return { ...dish, outlets: updatedOutlets };
      }
      return dish;
    });
    setActiveDish(null); // Clear active dish when status changes
    setDishes(updatedDishes);
  }

  //function to keep only the first letter of the name uppercase and the rest lowercase
  const formatName = (str) => {
    if (!str) {
      return ""; // Return an empty string for falsy inputs
    }
    return str
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  if (loading) {
    return <Loading />;
  }

  const onItemSelected = (id) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((item) => item !== id);
      } else {
        return [...prevSelected, id];
      }
    });
    console.log("Selected items:", selectedItems);
  }

  const handleTypeChange = async (type) => {
    const toastConfig = {
      position: "top-right",
      autoClose: 2000,
      theme: "dark",
    }
    try {
      if (selectedItems.length === 0) {
        throw new Error("Please select at least one dish to assign a type.");
      }
      // Call the API to update the type of selected dishes
      const res = updateDishesType(type, selectedItems);
      const response = await toast.promise(res, {
        pending: "Updating dish type...",
        success: "Dish type updated successfully!",
        error: "Error updating dish type!",
      }, toastConfig);
      if (!response.status) {
        throw new Error(response.message);
      }
      // update dishes state
      setDishes(prevDishes =>
        prevDishes.map(dish => {
          if (selectedItems.includes(dish.id)) {
            return { ...dish, type: type };
          }
          return dish;
        })
      );
      // update filteredDishes state
      setFilteredDishes(prevFilteredDishes =>
        prevFilteredDishes.map(dish => {
          if (selectedItems.includes(dish.id)) {
            return { ...dish, type: type };
          }
          return dish;
        })
      );
    } catch (error) {
      console.error("Error updating dish type:", error);
      toast.error(error.message, toastConfig);    } finally {
      setOpen(false);
      setSelectedItems([]);
    }
  }

  const handleAddOnGroupsClick = () => {
    setActiveDish(null); // Clear any active dish when opening the add-on groups modal
    setAddOnGroupsModal(true);
    setModalData(prevData => ({ 
      ...prevData, 
      addons, 
      addonGroups 
    }));
  };

  return (
    <section className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex w-full justify-between px-[24px] pt-4 py-4">
        <div className="flex w-full items-center gap-4">
          <Tabs tabs={tabs.map( (tab) => formatName(tab) )} activeTabIndex={tabs.indexOf(activeTab)} onTabChange={onTabChange} />
          <>
            <button 
              className="flex p-2 text-sm items-center justify-center rounded-full bg-[#F8F7FA] cursor-pointer hover:bg-gray-200 transition-colors duration-300" 
              onClick={() => { openEditMenuModal() }}
              title="Edit Menu Groups"
              >
              <EditIcon className="text-sm text-[#5C5C7A]" fontSize="small" />
            </button>
            {menuType === "prism" &&
              <button 
                className="flex p-2 text-sm items-center justify-center rounded-full bg-[#F8F7FA] cursor-pointer hover:bg-gray-200 transition-colors duration-300"
                title="Add On Groups"
                onClick={handleAddOnGroupsClick}
                >
                <WidgetsIcon className="text-sm text-[#5C5C7A]" fontSize="small" />
              </button>
            }
            {
              menuType === "petpooja" &&
              <button className="flex p-2 text-sm items-center justify-center rounded-full bg-[#F8F7FA] cursor-pointer hover:bg-gray-200 transition-colors duration-300" onClick={() => { openAddCategoryModal() }}>
                <AddIcon className="text-sm text-[#5C5C7A]" fontSize="medium" />
              </button>
            }
          </>
        </div>

        <div className="flex items-center gap-x-4">

          {(categoriesOrderChanged || dishesOrderChanged) && (
            <button
              className="flex font-medium px-[16px] py-1.5 text-[#4B21E2] text-[14px] border-1 border-[#4B21E2] bg-[#EEEBFA] rounded-[8px] cursor-pointer "
              onClick={handleSaveReordering}
            >
              Save
            </button>
          )}

          <Button variant="secondary" size="small" className="font-medium" onClick={syncRest} >
            <AutorenewIcon /> Sync {menuType === "petpooja" ? "PetPooja" : "Prism"}
          </Button>

          <Button variant="primary" size="small" className="font-medium" onClick={handleUpdateMenu} >
            <AutorenewIcon /> Update Menu
          </Button>

        </div>
      </div>

      {/* Menu Title & Search */}
      <div className="flex w-full h-fit items-center justify-between px-[24px]">
        <div className="flex w-[60%] h-fit items-center justify-between pr-4">
          <h2 className="text-2xl font-medium text-[#201F33]">Menu</h2>
        </div>
        <div className="flex w-[40%] h-full">
          <SearchBar placeholder="Search Dish" className="w-full h-full" onChange={(e) => { handleSearch(e) }} />
        </div>
      </div>

      {/* Categories & Dishes */}
      <div className="flex flex-row w-full h-[calc(100vh-131px)] px-[24px] pt-2">
        <div className={filteredDishes.length > 0 ? "grid grid-cols-2 gap-4 w-[60%] h-full pr-6 border-r-[1px] border-[#E8E6ED] transition-transform duration-300" : "flex w-[30%] h-full pr-6 border-r-[1px] border-[#E8E6ED]"}>

          {/* Categories */}
          <div className="flex flex-col w-full h-full overflow-y-auto">
            <div className="flex flex-col border-b-[1px] border-[#E8E6ED] pb-4 sticky top-0 z-50 bg-white gap-1">
              <span className="text-lg leading-5">Categories</span>
              <span className="text-[#5C5C7A] text-md font-medium leading-5">{formatName(activeTab) || "Select a category"}</span>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={filteredCategories.map(category => category.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2.5 pt-4">
                  {filteredCategories.map((category) => (
                    <SortableCategoryCard
                      key={category.id}
                      id={category.id}
                      checked={category.inStock}
                      name={category.name}
                      active={activeCategory?.id === category.id}
                      onClick={() => handleCategoryClick(category)}
                      onChange={handleCategoryStatusChange}
                      disabled={isSearching}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Dishes */}
          {filteredDishes.length > 0 && (
            <div className="flex flex-col w-full h-full overflow-y-auto sticky top-0 z-50">
              <div className="flex justify-between border-b-[1px] border-[#E8E6ED] sticky top-0 z-50 pb-4 bg-white w-full">
                {
                  open ?
                    <div className="flex gap-4 items-center px-3">
                      <Checkbox
                        checked={selectedItems.length === filteredDishes.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(filteredDishes.map(dish => dish.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="w-4 h-4"
                        sx={{
                          padding: 0,
                          margin: 0,
                          color: "#5C5C7A",
                          "&.Mui-checked": {
                            color: "#5C5C7A",
                          },
                          "& .MuiSvgIcon-root": {
                            margin: 0,
                            fontSize: 20,
                          },
                        }}
                      />
                      <span className="text-[14px] font-normal">Select All</span>
                      <span className='text-[#5C5C7A] text-[14px] flex items-center-safe' title='close' onClick={() => { setOpen(false); setSelectedItems([]) }}>
                        <CloseIcon className='cursor-pointer' title='exit operation' fontSize="small" />
                      </span>
                    </div>
                    :
                    <div className="flex flex-col gap-1">
                      <span className="text-lg leading-5">Dishes</span>
                      <span className="text-[#5C5C7A] text-md font-medium leading-5">{formatName(activeCategory?.name) || "Select a category"}</span>
                    </div>
                }
                <AssignTypeButton onChange={handleTypeChange} onClick={(setIsOpen) =>{ setOpen(true), setIsOpen(true) }} setOpen={setOpen} open={open} />
              </div>

              {!isSearching ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDishDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={filteredDishes}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2.5 pt-4">
                      {
                        open ?
                          filteredDishes.map((dish) => (
                            <TypeSelectionItemCard
                              key={dish.id}
                              id={dish.id}
                              checked={dish.isActive}
                              name={dish.name}
                              type={dish.type}
                              onChange={handleDishStatusChange}
                              onItemSelected={onItemSelected}
                              isSelected={selectedItems.includes(dish.id)}
                            />
                          ))
                          :
                          filteredDishes.map((dish) => (
                            <ItemCard
                              key={dish.id}
                              id={dish.id}
                              checked={dish.isActive}
                              name={dish.name}
                              type={dish.type}
                              active={activeDish?.id === dish.id}
                              onChange={handleDishStatusChange}
                              onClick={() => handleDishClick(dish.id)}
                              categoryName={dish.categoryName}
                            />
                          ))
                      }
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="flex flex-col gap-2.5 pt-4">
                  {
                    open ?
                      filteredDishes.map((dish) => (
                        <TypeSelectionItemCard
                          key={dish.id}
                          id={dish.id}
                          checked={dish.isActive}
                          name={dish.name}
                          type={dish.type}
                          onChange={handleDishStatusChange}
                          onItemSelected={onItemSelected}
                          isSelected={selectedItems.includes(dish.id)}
                          disabled={true}
                        />
                      ))
                      :
                      filteredDishes.map((dish) => (
                        <ItemCard
                          key={dish.id}
                          id={dish.id}
                          checked={dish.isActive}
                          name={dish.name}
                          type={dish.type}
                          active={activeDish?.id === dish.id}
                          onChange={handleDishStatusChange}
                          onClick={() => handleDishClick(dish.id)}
                          categoryName={dish.categoryName}
                          disabled={true}
                        />
                      ))
                  }
                </div>
              )}

            </div>
          )}
        </div>

        {/* Dish Details (Placeholder) */}
        <div className={filteredDishes.length > 0 ? "w-[40%] overflow-scroll" : "w-[70%] h-full"}>
          {activeDish ? (
            <DishDetails dish={activeDish} menuType={menuType} dishes={dishes} tagsList={tagList} outletsData={outlets} addonGroups={addonGroups} />
          ) : (
            <div className="flex flex-col w-full h-full items-center justify-center gap-2 pb-24">
              <img src={pot} alt="Pot" className="" />
              <div className="flex flex-col items-center justify-center text-[#5C5C7A] font-medium">
                <span>Select a dish to see</span>
                <span>more details</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Menu;