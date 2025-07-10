import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";

// components
import DishesCard from "./Components/DishesCard";
import TabHeading from "../Common/TabHeading";
import apiService from "../../services/apiService";
import {
  fetchUserDishes,
  addUserDish,
  deleteUserDish,
} from "../../services/websiteTemplate";

import { getUserId } from "../../utils/user";

const RESTAURANT_ID = 16;

type Dish = {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
};

const USER_ID = getUserId();

export default function Dishes() {
  const [allDishes, setAllDishes] = useState<Dish[]>([]); // All dishes from API
  const [selectedDishes, setSelectedDishes] = useState<Dish[]>([]); // User's custom list
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const controls = useAnimation();
  const x = useMotionValue(0);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<{ stoppedAt: number }>({ stoppedAt: 0 });

  useEffect(() => {
    setLoading(true);
    apiService
      .fetchMenu(RESTAURANT_ID)
      .then((data) => {
        setAllDishes(data.data?.dishes || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch menu");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!USER_ID) return;
    fetchUserDishes(USER_ID)
      .then((res) => {
        const normalized = (res.data || []).map((dish: any) => ({
          id: dish.id || dish.dishId || dish._id,
          name: dish.name,
          description: dish.description,
          imageUrl: dish.imageUrl,
        }));
        setSelectedDishes(normalized);
      })
      .catch(() => {});
  }, []);

  const filteredDishes = allDishes.filter(
    (dish) =>
      dish.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedDishes.some((d) => d.id === dish.id)
  );

  console.log("search:", search, "filteredDishes:", filteredDishes);

  const handleAddDish = (dish: Dish) => {
    if (!selectedDishes.some((d) => d.id === dish.id)) {
      setSelectedDishes([...selectedDishes, dish]);
    }
  };

  const handleRemoveDish = async (id: number) => {
    if (!id) {
      console.error("Attempted to delete dish with undefined/null id");
      return;
    }
    try {
      await fetch(
        `https://backend-template-eight.vercel.app/api/dish/user/${USER_ID}/${id}`,
        {
          method: "DELETE",
        }
      );
      const res = await fetchUserDishes(USER_ID);
      const normalized = (res.data || []).map((dish: any) => ({
        id: dish.id || dish.dishId || dish._id,
        name: dish.name,
        description: dish.description,
        imageUrl: dish.imageUrl,
      }));
      setSelectedDishes(normalized);
    } catch (e) {
      console.error("Failed to delete dish from backend", e);
    }
  };

  const handleSaveDishes = async () => {
    if (!USER_ID) {
      alert("User ID not found. Please log in again.");
      console.error("USER_ID is missing. Cannot save dishes.");
      return;
    }
    try {
      const response = await fetch(
        "https://backend-template-eight.vercel.app/api/dish/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: USER_ID,
            dishes: selectedDishes.map(
              ({ id, name, description, imageUrl }) => ({
                dishId: id,
                name,
                description,
                imageUrl,
              })
            ),
          }),
        }
      );
      const data = await response.json();
      if (data && data.status) {
        alert("Dishes saved successfully!");
      } else {
        alert("Failed to save dishes");
      }
    } catch (e) {
      alert("Failed to save dishes");
      console.error("Save error:", e);
    }
  };

  const infiniteDishes =
    selectedDishes.length > 0 ? [...selectedDishes, ...selectedDishes] : [];

  useEffect(() => {
    if (selectedDishes.length === 0) return;
    if (!isPaused) {
      controls.start({
        x: [animationRef.current.stoppedAt, -selectedDishes.length * 240],
        transition: {
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear",
          duration: selectedDishes.length * 8 || 24, //Speed Control
        },
      });
    } else {
      controls.stop();
    }
  }, [isPaused, selectedDishes.length]);

  const handlePause = () => {
    setIsPaused(true);
    animationRef.current.stoppedAt = x.get();
  };
  const handleResume = () => {
    setIsPaused(false);
  };

  return (
    <div className="w-full h-full min-h-fit flex flex-col justify-start items-center gap-10 overflow-hidden relative pb-20">
      <TabHeading title={"Dishes Card"} />
      <div className="w-full min-h-fit relative ">
        {/* Texts */}
        <div className="w-full flex flex-col justify-center items-center leading-7">
          <h1 className="inter_med text-black text-[32px] tracking-[-2px]">
            Dishes
          </h1>
          <h4 className="inter_reg text-[#4D4D4D] text-[12px]">
            Select and add dishes to your custom list
          </h4>
        </div>
        {/* Search Bar */}
        <div className="w-full flex justify-center mt-4 mb-2">
          <input
            className="border p-2 rounded w-1/2"
            placeholder="Search dishes by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Search Results */}
        {search.trim() !== "" && (
          <div className="w-full flex flex-wrap justify-center items-center gap-3">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : filteredDishes.length > 0 ? (
              filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex flex-col items-center border rounded p-2 bg-gray-50"
                >
                  <DishesCard
                    name={dish.name}
                    description={dish.description || ""}
                    image={dish.imageUrl}
                  />
                  <button
                    className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleAddDish(dish)}
                  >
                    Add
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No dishes found</div>
            )}
          </div>
        )}
        <button
          className="mb-6 px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition-colors font-semibold self-start"
          onClick={handleSaveDishes}
        >
          Save
        </button>
        {/* Selected Dishes Cards - Infinite Scroll with Framer Motion */}
        <div className="w-full overflow-x-hidden mt-10 pb-4 relative">
          {selectedDishes.length > 0 ? (
            <motion.div
              className="flex flex-row items-start gap-10"
              animate={controls}
              style={{ x }}
            >
              {infiniteDishes.map((dish, idx) => (
                <div
                  key={dish.id + "-" + idx}
                  className="relative group min-w-[220px] mr-6"
                  onMouseEnter={handlePause}
                  onMouseLeave={handleResume}
                >
                  <div className="relative">
                    {/* Small red cross button above image (only for first set) */}
                    {idx < selectedDishes.length && (
                      <button
                        className="absolute top-1 -right-14 z-30 bg-red-500 border border-red-500 rounded-full w-6 h-6 flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-colors text-base shadow group-hover:scale-110"
                        onClick={() => handleRemoveDish(dish.id)}
                        aria-label="Remove"
                        style={{ lineHeight: 1 }}
                      >
                        ×
                      </button>
                    )}
                    <DishesCard
                      name={dish.name}
                      description={dish.description || ""}
                      image={dish.imageUrl}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="text-gray-400">No dishes added to your list</div>
          )}
        </div>
      </div>
    </div>
  );
}
