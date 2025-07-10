import React, { useState, useEffect } from "react";

import TabHeading from "../Common/TabHeading";
import ReviewCard from "./Components/ReviewCard";
import {
  fetchReviews,
  postReviews,
  updateReview,
  deleteReview,
  searchGooglePlaces,
} from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";
import Spinner from "../Common/Spinner";

function Reviews() {
  const userId = getUserId && getUserId();
  const [reviews, setReviews] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editInput, setEditInput] = useState({
    name: "",
    review: "",
    rating: 5,
  });
  const [loading, setLoading] = useState(true);
  const [hasReviewDoc, setHasReviewDoc] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [googleReviews, setGoogleReviews] = useState([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        if (!userId) throw new Error("No userId");
        const data = await fetchReviews(userId);
        if (data && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
          setHasReviewDoc(true);
        } else {
          setReviews([]);
          setHasReviewDoc(false);
        }
      } catch (err) {
        setReviews([]);
        setHasReviewDoc(false);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
    // eslint-disable-next-line
  }, [userId]);

  // Handlers
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditInput({ ...reviews[index] });
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditInput((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };
  const handleEditSave = async (index) => {
    try {
      if (!hasReviewDoc) {
        // Create the review doc first
        const newReviews = [...reviews];
        newReviews[index] = { ...editInput };
        await postReviews(userId, newReviews);
        setReviews(newReviews);
        setHasReviewDoc(true);
      } else {
        await updateReview(userId, index, editInput);
        const updated = [...reviews];
        updated[index] = { ...editInput };
        setReviews(updated);
      }
      setEditingIndex(null);
    } catch (err) {
      // Optionally show error
    }
  };
  const handleEditCancel = () => {
    setEditingIndex(null);
  };
  const handleDeleteReview = async (index) => {
    try {
      if (!hasReviewDoc) {
        // Nothing to delete from backend
        setReviews((prev) => prev.filter((_, i) => i !== index));
      } else {
        await deleteReview(userId, index);
        setReviews((prev) => prev.filter((_, i) => i !== index));
      }
      setEditingIndex(null);
    } catch (err) {
      // Optionally show error
    }
  };
  const handleAddReview = () => {
    setReviews((prev) => [
      ...prev,
      { name: "New Guest", review: "", rating: 5 },
    ]);
    setEditingIndex(reviews.length);
    setEditInput({ name: "New Guest", review: "", rating: 5 });
  };
  // Google Places API search (using backend)
  const handlePlaceSearch = async () => {
    setPlaceLoading(true);
    setPlaceError("");
    setGoogleReviews([]);
    try {
      // Use the imported searchGooglePlaces function
      const data = await searchGooglePlaces(placeQuery);
      if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
        // Map backend reviews to your review format, include profile_photo_url
        const mappedReviews = data.reviews.map((r) => ({
          name: r.author_name || r.name || "Guest",
          review: r.text || r.review || "",
          rating: r.rating || 5,
          profile_photo_url: r.profile_photo_url || "",
        }));
        setGoogleReviews(mappedReviews);
      } else {
        setPlaceError("No reviews found for this place");
      }
    } catch (err) {
      setPlaceError("Error fetching place reviews");
    } finally {
      setPlaceLoading(false);
    }
  };
  const handleSaveAll = async () => {
    try {
      let reviewsToSave = reviews;
      if (googleReviews.length > 0) {
        reviewsToSave = [...reviews, ...googleReviews];
        setReviews(reviewsToSave);
        setGoogleReviews([]); // Clear after save
      }
      await postReviews(userId, reviewsToSave);
      setHasReviewDoc(true);
      // Optionally show success
    } catch (err) {
      // Optionally show error
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );

  return (
    <div className="w-full h-full min-h-fit flex flex-col justify-start items-center gap-10 overflow-hidden relative pb-20">
      <TabHeading
        title={"Reviews Card"}
        description={"You can Search place of your choice and add reviews"}
      />

      {/* Google Places Search Bar */}
      <div className="w-full flex flex-col items-center gap-2 mb-4">
        <input
          className="border rounded px-2 py-1 text-sm w-1/2"
          type="text"
          placeholder="Search for a place (e.g. Taj Mahal)"
          value={placeQuery}
          onChange={(e) => setPlaceQuery(e.target.value)}
        />
        <button
          className="bg-[#6C63FF] text-white rounded px-3 py-1.5 text-xs mt-1"
          onClick={handlePlaceSearch}
          disabled={placeLoading || !placeQuery}
        >
          {placeLoading ? "Searching..." : "Search Google Reviews"}
        </button>
        {placeError && (
          <span className="text-red-500 text-xs">{placeError}</span>
        )}
      </div>
      {/* Show Google Reviews if any */}
      {googleReviews.length > 0 && (
        <div className="w-full flex flex-col items-center gap-2 mb-4">
          <h4 className="inter_reg text-[#4D4D4D] text-[14px]">
            Google Reviews Found:
          </h4>
          <div className="w-full h-fit grid grid-cols-3 gap-5 mt-2">
            {googleReviews.map((review, idx) => (
              <ReviewCard
                key={"google-" + idx}
                name={review.name}
                review={review.review}
                rating={review.rating}
                profile_photo_url={
                  review.profile_photo_url || review.profileUrl || ""
                }
                profileUrl={review.profile_photo_url || review.profileUrl || ""}
              />
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex flex-col justify-center items-center gap-3">
        <div className="w-full flex flex-col justify-center items-center leading-7">
          <h1 className="inter_med text-black text-[32px] tracking-[-2px]">
            What our guests are saying
          </h1>
          <h4 className="inter_reg text-[#4D4D4D] text-[12px]">
            Check out our most recent reviews!
          </h4>
        </div>

        <div className="w-full h-fit grid grid-cols-3 gap-5 mt-6">
          {reviews.map((review, idx) => {
            const data = editingIndex === idx ? editInput : review;
            return (
              <ReviewCard
                key={idx}
                name={data.name}
                review={data.review}
                rating={data.rating}
                profile_photo_url={
                  data.profile_photo_url || data.profileUrl || ""
                }
                profileUrl={data.profile_photo_url || data.profileUrl || ""}
              />
            );
          })}
        </div>
      </div>
      {/* Edit Section */}
      <div className="w-full h-full flex flex-col justify-center items-start gap-3 overflow-hidden relative mt-10">
        <div className="w-full h-fit flex justify-between items-center gap-3">
          <h3 className="poppins_med text-[#201F33] text-[14px]">Edit</h3>
          <button
            className="bg-[#6C63FF] text-white rounded px-3 py-1.5 text-xs"
            onClick={handleSaveAll}
          >
            Save
          </button>
        </div>
        <div className="w-full h-fit grid grid-cols-3 gap-2">
          {reviews.map((review, index) => (
            <div key={index} className="flex flex-col gap-1">
              {editingIndex === index ? (
                <div className="flex flex-col gap-1 bg-[#F5F5F7] p-2 rounded">
                  <input
                    className="border rounded px-2 py-1 text-sm mb-1"
                    name="name"
                    value={editInput.name}
                    onChange={handleEditInputChange}
                    placeholder="Guest Name"
                  />
                  <textarea
                    className="border rounded px-2 py-1 text-sm mb-1"
                    name="review"
                    value={editInput.review}
                    onChange={handleEditInputChange}
                    placeholder="Review"
                  />
                  <input
                    className="border rounded px-2 py-1 text-sm mb-1"
                    name="rating"
                    type="number"
                    min={1}
                    max={5}
                    value={editInput.rating}
                    onChange={handleEditInputChange}
                    placeholder="Rating (1-5)"
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-[#6C63FF] text-white rounded px-2 py-1 text-xs"
                      onClick={() => handleEditSave(index)}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-200 text-black rounded px-2 py-1 text-xs"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-red-500 text-white rounded px-2 py-1 text-xs"
                      onClick={() => handleDeleteReview(index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <span
                  className="cursor-pointer poppins_reg text-black text-[14px]"
                  onClick={() => handleEditClick(index)}
                  title={review.review}
                >
                  {review.name}: {review.review.slice(0, 30)}
                  {review.review.length > 30 ? "..." : ""}
                </span>
              )}
            </div>
          ))}
          {/* Add Review Button */}
          <button
            onClick={handleAddReview}
            className="w-fit flex items-center gap-2 p-2 rounded-[8px] hover:bg-[#EEEBFA] cursor-pointer border border-[#D6D6D6] self-end"
          >
            <span className="poppins_reg text-black text-[14px]">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reviews;
