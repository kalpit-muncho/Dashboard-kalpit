import React, { useState, useEffect } from 'react';
import BarChart from '../../components/BarChart';
import Loading from '../../components/Loading';
import { getReviews } from '../../models/ReviewsDataModel';
import StatsWithIcon from '../../components/StatsWithIcon';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import FastfoodOutlinedIcon from '@mui/icons-material/FastfoodOutlined';
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined';
import DeckOutlinedIcon from '@mui/icons-material/DeckOutlined';
import ReviewCard from '../../components/ReviewCard';
import { toast } from 'react-toastify';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState({
        overallAvg: "0.0",
        foodAvg: "0.0",
        serviceAvg: "0.0",
        ambienceAvg: "0.0"
    });
    const [reviewCounts, setReviewCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const reviewsData = await getReviews();
                setReviews(reviewsData.reviews || []);
                setAverageRating(reviewsData.averageRating || averageRating);
                setReviewCounts(reviewsData.reviewCounts || reviewCounts);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                toast.error('Error fetching reviews: ' + (error.message || 'Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const handleStatClick = (index) => {
        setSelectedIndex(index);
    };

    const averageData = [
        { icon: <StarBorderOutlinedIcon />, value: averageRating.overallAvg || 0, title: 'Overall' },
        { icon: <FastfoodOutlinedIcon />, value: averageRating.foodAvg || 0, title: 'Food' },
        { icon: <RoomServiceOutlinedIcon />, value: averageRating.serviceAvg || 0, title: 'Service' },
        { icon: <DeckOutlinedIcon />, value: averageRating.ambienceAvg || 0, title: 'Ambience' },
    ];

    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (loading) {
        return (
            <main className='flex items-center justify-center w-full h-full'>
                <Loading />
            </main>
        );
    }

    return (
        <main className='w-full h-full px-[24px] flex flex-col'>
            <div className='flex flex-col gap-2 pt-4'>
                <h1 className='text-2xl font-medium text-[#201F33]'>Reviews</h1>
                <div className='flex flex-col w-full gap-1 text-[#201F33]'>
                    <p className='text-[14px] font-normal'>Total Reviews</p>
                    <span className='text-5xl font-normal'>{formatNumber(reviews.length || 0)}</span>
                </div>
            </div>
            <div className='w-full flex flex-col'>
                {reviewCounts && reviewCounts.length > 0 && (
                    <div className='flex w-full h-[150px] border-b-2 border-[#E8E6ED] overflow-x-auto min-w-0 pt-4'>
                        <BarChart data={reviewCounts} />
                    </div>
                )}

                <div className='flex w-full justify-between pt-8 gap-4'>
                    {averageData.map((item, index) => (
                        <StatsWithIcon
                            key={index}
                            props={{ ...item, isHighlighted: index === selectedIndex }}
                            onClick={() => handleStatClick(index)}
                        />
                    ))}
                </div>
            </div>
            <div className='w-full flex-1 flex flex-col pt-4'>
                <div className='w-full bg-white sticky top-0 z-50'>
                    <h2 className='text-md font-medium py-3'>Recent Reviews</h2>
                </div>
                <div className='flex flex-col gap-4 w-full'>
                    {Array.isArray(reviews) && reviews.length > 0 ? (
                        reviews.slice(0, 10).map((review, index) => (
                            <ReviewCard key={index} props={{ data: review }} />
                        ))
                    ) : (
                        <p>No reviews available</p>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Reviews;