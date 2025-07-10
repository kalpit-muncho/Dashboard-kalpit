import React, { useState } from "react";
import { Star } from "lucide-react";

function ReviewCard({
  name = "Guest",
  review = "",
  rating = 5,
  profile_photo_url = "",
  profileUrl = "",
}) {
  const [showFull, setShowFull] = useState(false);
  let imgSrc = profile_photo_url || profileUrl;
  if (!imgSrc || imgSrc === "") {
    imgSrc = " /Images/Demo/hero.jpeg";
  }
  const MAX_LENGTH = 100;
  const isLong = review.length > MAX_LENGTH;
  const displayReview =
    showFull || !isLong ? review : review.slice(0, MAX_LENGTH) + "...";

  return (
    <div className="w-full bg-[#EBEBEC] flex flex-col justify-center items-start gap-4 rounded-[16px] p-6">
      <div className="w-full flex justify-start items-center gap-1.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            color={i < rating ? "#323232" : "#C0C0C0"}
            fill={i < rating ? "#323232" : "none"}
          />
        ))}
      </div>
      <p className="inter_reg text-black text-[15px]">
        {displayReview || "No review provided."}
        {isLong && !showFull && (
          <button
            className="ml-2 text-[#6C63FF] underline text-xs"
            onClick={() => setShowFull(true)}
          >
            Read more
          </button>
        )}
      </p>

      <div className="w-full flex justify-start items-center gap-2">
        <div className="w-[32px] aspect-square bg-zinc-400 rounded-full shadow-2xl overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={imgSrc}
            alt="img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/32";
            }}
          />
        </div>
        <h4 className="inter_med text-[#050505] text-[20px]">{name}</h4>
      </div>
    </div>
  );
}

export default ReviewCard;
