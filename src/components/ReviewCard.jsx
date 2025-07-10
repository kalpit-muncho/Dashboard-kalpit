import React from 'react';
import Rating from '@mui/material/Rating';

const ReviewCard = ({ props }) => {
    const data = props.data;  // Destructure props to get data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).replace(/([A-Za-z]+)/g, match => match.toUpperCase());
    };

    return (
        <div className="flex flex-col gap-8 w-full h-fit border-[1px] border-[#E8E6ED] rounded-2xl p-4 md:p-6">
            {/* Customer Name and Review Date */}
            <div className="flex flex-col gap-1">
                <span className="text-[14px] font-medium text-[#5C5C7A]">{formatDate(data.date)}</span>
                <p className="text-[14px] text-[#5C5C7A]">{data.comment}</p>
            </div>

            {/* Ratings Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-[14px]">{data.customerName}</span>  
                    <Rating value={data.overallRating} readOnly sx={{ "& .MuiRating-iconFilled": { color: "black" } }} />
                </div>               

                <div className="flex flex-wrap md:flex-nowrap gap-4">
                    {[
                        { label: 'Food', value: data.foodRating },
                        { label: 'Service', value: data.serviceRating },
                        { label: 'Ambience', value: data.ambienceRating }
                    ].map((item, index) => (
                        <div key={index} className="flex flex-col gap-1 border-l border-[#E8E6ED] pl-2">
                            <span className="text-[14px] font-medium text-gray-500">{item.label}:</span>
                            <Rating value={item.value} readOnly size="small" sx={{ 
                                "& .MuiRating-iconFilled": { color: "black" } 
                            }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
