import React, { useEffect, useState, useContext } from "react";
import Button from "../../components/Button";
import UpsellsItemCard from "../../components/UpsellsItemCard";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import AddIcon from "@mui/icons-material/Add";
import { getAllDishes } from "../../models/MenuModel";
import servingDish from "../../assets/images/serving-dish.png";
import SearchBar from "../../components/SearchBar";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import { fetchUniversalUpsells, setUniversalUpsells } from "../../models/MenuModel";
import { useOutletContext } from "react-router-dom";
import DashboardContext from "../../contexts/dashboardContext";

const MAX_UPSELLS = 10;

const Upsells = () => {
    const [upsells, setUpsells] = useState([]);
    const [dishData, setDishData] = useState([]);
    const [upsellingDishes, setUpsellingDishes] = useState([]);
    const [isAddItems, setIsAddItems] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [sortedDishes, setSortedDishes] = useState([]);
    const { restaurant } = useOutletContext();
    const { setUpdateMenuModal, setModalData } = useContext(DashboardContext);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setIsError(false);

            try {
                const dishes = await getAllDishes();
                setDishData(dishes);

                const response = await fetchUniversalUpsells();
                if (!response.status) {
                    throw new Error(response.message);
                }

                const upsellIds = response.data;
                setUpsells(upsellIds);
                setSelectedItems(upsellIds);

                const filteredDishes = dishes.filter(dish => upsellIds.includes(dish.id));
                setUpsellingDishes(filteredDishes);

                // Initialize with sorted dishes (selected items first)
                const initialSorted = [...dishes].sort((a, b) => {
                    const aSelected = upsellIds.includes(a.id);
                    const bSelected = upsellIds.includes(b.id);
                    return bSelected - aSelected;
                });
                setSortedDishes(initialSorted);

            } catch (error) {
                console.error("Error fetching data:", error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCheckboxChange = (id) => {
        if (!selectedItems.includes(id) && selectedItems.length >= MAX_UPSELLS) {
            toast.warn(`Max Limit of ${MAX_UPSELLS} Upsells, please delete an item to add a new one`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }

        setSelectedItems((prevSelected) => {
            const newSelected = prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id)
                : [...prevSelected, id];
            return newSelected;
        });
    };

    const renderFoodList = () => {
        return sortedDishes.map((item) => (
            <div className="flex w-full h-fit" key={item.id}>
                <UpsellsItemCard
                    isOnClick={true}
                    variant="checked"
                    label={formatName(item.name)}
                    type={item.type}
                    checked={selectedItems?.includes(item.id)}
                    onChange={() => handleCheckboxChange(item.id)}
                    onClick={() => setUpsells(upsells.filter(u => u.id !== item.id))}
                />
            </div>
        ));
    };

    const handleAddItems = async (e) => {
        try {
            e.preventDefault();

            if (selectedItems.length > MAX_UPSELLS) {
                toast.warn(`Please select no more than ${MAX_UPSELLS} items`, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                return;
            }

            const promise = setUniversalUpsells(selectedItems);

            toast.promise(promise, {
                pending: "Updating Upsells...",
                success: "Upsells updated successfully!",
                error: "Error adding items",
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

            const response = await promise;
            if (!response.status) {
                throw new Error(response.message);
            }
            if (response.status) {
                const selectedItemsData = dishData.filter((item) => selectedItems.includes(item.id));
                setUpsellingDishes(selectedItemsData);
                setIsAddItems(false);
            }
        } catch (error) {
            console.error("Error adding items:", error);
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

    if (isLoading) {
        return <Loading />;
    }

    const handleUpdateMenu = async () => {
        setUpdateMenuModal(true);
        setModalData({ outlets: restaurant.outlets });
    }

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

    return (
        <main className="flex flex-col w-full h-full">
            <div className="flex flex-col md:flex-row items-center justify-between w-full py-4 px-[24px] gap-4">
                <h1 className="text-2xl md:text-2xl font-medium text-[#201F33]">Upsells</h1>
                <Button variant="primary" size="small" className="font-medium" onClick={handleUpdateMenu} >
                    <AutorenewIcon /> Update Menu
                </Button>
            </div>

            {isError && (
                <div className="flex items-center justify-center w-full h-full px-[24px]">
                    <p className="text-lg text-red-500">Error loading upsells</p>
                </div>
            )}

            {!isError && (
                <div className="flex flex-col md:flex-row w-full h-full md:h-[calc(100vh-70px)] px-[24px] gap-6">
                    <div className="flex flex-col w-full md:w-[40%] gap-4 md:border-r-2 border-[#E8E6ED] md:pr-8 h-full">
                        <div className="flex flex-col gap-4 w-full h-fit text-[#201F33]">
                            <div className="flex flex-col w-full">
                                {/* <p className="text-lg ">Upselling Dishes</p> */}
                                <span className="text-sm text-[#5C5C7A] font-medium">
                                    {upsellingDishes.length} of {MAX_UPSELLS} Items
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap lg:grid lg:grid-cols-2 gap-4 max-h-full overflow-auto pb-1">
                            {upsellingDishes.map((item, index) => (
                                <UpsellsItemCard key={index} label={formatName(item.name)} type={item.type} />
                            ))}
                        </div>
                        <div className="flex justify-center items-center md:pb-12">
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => {
                                    // Sort with selected items first when opening the add items view
                                    const sorted = [...dishData].sort((a, b) => {
                                        const aSelected = selectedItems.includes(a.id);
                                        const bSelected = selectedItems.includes(b.id);
                                        return bSelected - aSelected;
                                    });
                                    setSortedDishes(sorted);
                                    setIsAddItems(true);
                                }}
                                className="mt-4 flex items-center"
                            >
                                <AddIcon /> <span className="ml-1">Add items</span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full md:w-[60%] h-full p-4 md:px-6">
                        {isAddItems ? (
                            <div className="flex flex-col gap-4 w-full h-full">
                                <div className=" flex flex-col gap-4 w-full">
                                    <SearchBar
                                        placeholder="Search Dish and Categories"
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            const newFilteredDishes = dishData?.filter((dish) =>
                                                dish.name.toLowerCase().includes(e.target.value.toLowerCase())
                                            );
                                            // Maintain selected items first when filtering
                                            const newSorted = [...newFilteredDishes].sort((a, b) => {
                                                const aSelected = selectedItems.includes(a.id);
                                                const bSelected = selectedItems.includes(b.id);
                                                return bSelected - aSelected;
                                            });
                                            setSortedDishes(newSorted);
                                        }}
                                    />
                                    <div className="flex items-center justify-between w-full">
                                        <h2 className="text-md font-medium">Select and Add</h2>
                                        <Button
                                            variant="secondary"
                                            size="small"
                                            className="font-medium"
                                            onClick={handleAddItems}
                                            disabled={selectedItems.length > MAX_UPSELLS}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 w-full max-h-full overflow-auto">
                                    {renderFoodList()}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <img src={servingDish} alt="Serving Dish" className="w-full max-w-xs mx-auto" />
                                {/* <div className="flex justify-center items-center md:pb-12">
                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => {
                                            // Sort with selected items first when opening the add items view
                                            const sorted = [...dishData].sort((a, b) => {
                                                const aSelected = selectedItems.includes(a.id);
                                                const bSelected = selectedItems.includes(b.id);
                                                return bSelected - aSelected;
                                            });
                                            setSortedDishes(sorted);
                                            setIsAddItems(true);
                                        }}
                                        className="mt-4 flex items-center"
                                    >
                                        <AddIcon /> <span className="ml-1">Add items</span>
                                    </Button>
                                </div> */}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
};

export default Upsells;