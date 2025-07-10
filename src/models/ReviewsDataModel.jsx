import { apiService } from "../services/apiService";

function formatDate(datetimeStr) {
  const date = new Date(datetimeStr);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0'); // JS months are 0-indexed
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format Date object to 'YYYY-MM-DD'
function formatDateObjToYYYYMMDD(dateObj) {
  const year = dateObj.getFullYear();
  const month = `${dateObj.getMonth() + 1}`.padStart(2, '0');
  const dayStr = `${dateObj.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
}

export const normalizeReviewCountsForLastNDays = (apiCounts = [], numberOfDays = 30) => {
  const countsMap = new Map();
  apiCounts.forEach(item => {
    countsMap.set(item.date, item.reviews);
  });

  const result = [];
  const today = new Date();
  for (let i = numberOfDays - 1; i >= 0; i--) { // Loop for specified number of days
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateStr = formatDateObjToYYYYMMDD(date);
    const dayOfMonth = date.getDate().toString();
    
    result.push({
      day: dayOfMonth,
      date: dateStr,
      reviews: countsMap.get(dateStr) || 0,
    });
  }
  return result; // Array of numberOfDays elements, sorted from oldest to newest
};

export const getAllReviews = async () => {
  const restId = localStorage.getItem("restaurantId");
  const res = await apiService.fetchReviews(restId);
  if (!res.status) {
    throw new Error("Failed to fetch reviews");
  }
  return res.data.reviews;
};

export const getReviews = async () => {
  try {
    const restId = localStorage.getItem("restaurantId");
    const res = await apiService.fetchReviews(restId);
    if (!res.status) {
      throw new Error("Failed to fetch reviews");
    }
    const data = res.data.reviews;
    if (!data || data === 0) {
      return { reviews: [], reviewCounts: normalizeReviewCountsForLastNDays([], 25), averageRating: {} };
    }
    const averageRating = getAverageRating(data);
    const rawReviewCounts = res.data.reviewCounts || [];
    const normalizedReviewCounts = normalizeReviewCountsForLastNDays(rawReviewCounts, 25);

    const reviews = data.map((review) => ({
      id: review.id,
      customerName: review.customerName,
      overallRating: review.overallRating,
      foodRating: review.foodRating,
      ambienceRating: review.ambienceRating,
      serviceRating: review.serviceRating,
      date: review.date,
      comment: review.comment,
    }));
    const reviewsRes = {
      reviews: reviews,
      reviewCounts: normalizedReviewCounts,
      averageRating: averageRating,
    };
    console.log("Reviews data:", reviewsRes);
    return reviewsRes;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

export const getDailyReviewCounts = (data) => {
  const reviewCounts = {};

  data.forEach((review) => {
    const date = formatDate(review.date);
    if (!reviewCounts[date]) {
      reviewCounts[date] = { day: null, date, reviews: 0 };
    }
    reviewCounts[date].reviews += 1;
  });

  const sortedDates = Object.keys(reviewCounts).sort();

  return sortedDates.map((date, index) => ({
    day: (index + 1).toString(),
    date,
    reviews: reviewCounts[date].reviews,
  }));
};

export const getAverageRating = (data) => {
  if (!data || data.length === 0) {
    return {
      ambienceAvg: "0.0",
      serviceAvg: "0.0",
      foodAvg: "0.0",
      overallAvg: "0.0",
    };
  }

  const totalAverage = data.reduce(
    (sum, review) => sum + review.overallRating,
    0
  );
  const totalAmbience = data.reduce(
    (sum, review) => sum + review.ambienceRating,
    0
  );
  const totalService = data.reduce(
    (sum, review) => sum + review.serviceRating,
    0
  );
  const totalFood = data.reduce((sum, review) => sum + review.foodRating, 0);

  const ambienceAvg = (totalAmbience / data.length).toFixed(1);
  const serviceAvg = (totalService / data.length).toFixed(1);
  const foodAvg = (totalFood / data.length).toFixed(1);
  const overallAvg = (totalAverage / data.length).toFixed(1);

  return {
    ambienceAvg,
    serviceAvg,
    foodAvg,
    overallAvg,
  };
};