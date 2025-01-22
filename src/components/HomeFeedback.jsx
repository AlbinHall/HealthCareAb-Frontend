import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HomeFeedback() {
    const [feedback, setFeedback] = useState([]);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/Feedback/GetByRating/5`);
                setFeedback(response.data);
            } catch (error) {
                console.error('Error fetching feedback:', error);
            }
        };

        fetchFeedback();
    }, []);

    //Duplicate feedback items for seamless looping if it's greater than 5, else show 5 statically.
    const duplicatedFeedback = feedback.length > 5 ? [...feedback, ...feedback] : feedback;

    return (
        <div className="relative overflow-hidden py-8 w-[75%]">
            <div className={`flex overflow-x-hidden ${feedback.length <= 5 ? 'justify-center' : ''}`}>
                <div className="flex animate-scroll">
                    {duplicatedFeedback.map((item, index) => (
                        <div key={index} className="flex-shrink-0 w-64 p-6 bg-gray-200 rounded-xl shadow-xl mx-2">
                            <div className="flex items-center mb-4">
                                <div className="text-yellow-400 text-2xl">★★★★★</div>
                            </div>
                            <p className="text-gray-600 mb-4">{item.comment}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/*Scroll animation, sadly couldn't achieve with tailwind...*/}
            {feedback.length > 5 && (
            <style>
                {`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .animate-scroll {
                    animation: scroll ${feedback.length * 5}s linear infinite;
                    display: flex;
                }
                `}
            </style>)}
        </div>
    );
}