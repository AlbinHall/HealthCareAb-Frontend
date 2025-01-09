import { useState } from "react";
import axios from "axios";

export default function Feedback({ appointmentId, onClose, onFeedbackSubmit }) {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const feedbackData = {
            appointmentId: appointmentId,
            comment: comment,
            rating: rating,
        };

        await axios.post(
            `${API_BASE_URL}/Feedback/Create`,
            feedbackData,
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        // Reset the form
        setComment('');
        setRating(1);

        alert("Feedback submitted successfully!");

        onFeedbackSubmit(); //Refetch data in History page after feedback is submitted

        onClose(); //Close the modal after submission
    }

    // Close the modal when clicking outside of it
    const handleOutsideClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={handleOutsideClick}>
            <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Leave Feedback</h1>
                <form onSubmit={handleSubmit}>
                    {/* Input for comment */}
                    <div className="mb-4">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                            Your Comment
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            rows="4"
                            placeholder="Enter your feedback here..."
                            required
                        />
                    </div>

                    {/* Rating (1-5) */}
                    <div className="mb-6">
                        <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                            Rating (1-5)
                        </label>
                        <input
                            type="number"
                            id="rating"
                            value={rating}
                            onChange={(e) => {
                                const value = Math.min(Math.max(parseInt(e.target.value, 10), 1), 5); // Ensure rating is between 1 and 5
                                setRating(value || 1);
                            }}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                            max="5"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Submit Feedback
                    </button>
                </form>
                <button
                    onClick={onClose}
                    className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                    Close
                </button>
            </div>
        </div>
    );
}