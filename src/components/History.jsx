import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Feedback from './Feedback';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const History = () => {
  const [History, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const itemsPerPage = 6;

  const handleFeedbackClick = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsFeedbackModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedAppointmentId(null);
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${apiUrl}/History/getHistory`, {
        withCredentials: true
      });

      setHistory(Array.isArray(response.data) ? response.data : [response.data]);
      setError(null);
    } catch (err) {
      setError(err.response?.data || 'error fetching history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  //Callback function to refetch data after feedback is submitted
  const handleFeedbackSubmit = () => {
    fetchHistory();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = History.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(History.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100%]bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            History
          </h1>
          <p className="mt-2 text-center text-gray-600">
            View your past appointments and submit feedback
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((journal) => (
            <div
              key={journal.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-200 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="bg-[#057d7a] px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  Appointment #{journal.id}
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <span className="font-medium min-w-[100px]">Patient:</span>
                    <span className="text-gray-900">{journal.patientName}</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <span className="font-medium min-w-[100px]">Caregiver:</span>
                    <span className="text-gray-900">{journal.caregiverName}</span>
                  </div>

                  <div className="flex items-center text-gray-700 border-t pt-4">
                    <span className="font-medium min-w-[100px]">Date:</span>
                    <span className="text-gray-900">
                      {new Date(journal.dateTime).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <span className="font-medium min-w-[100px]">Time:</span>
                    <span className="text-gray-900">
                      {new Date(journal.dateTime).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {/*Feedback button*/}
                  <button
                    disabled={journal.hasFeedback}
                    onClick={() => handleFeedbackClick(journal.id)}
                    className="mt-2 px-4 py-2 bg-[#057d7a] text-white rounded-md hover:bg-[#2fadaa] disabled disabled:bg-gray-500">
                    {journal.hasFeedback ? "Feedback Submitted" : "Submit Feedback"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {History.length === 0 && (
          <div className="text-center text-gray-500 mt-8 bg-white p-8 rounded-lg shadow">
            <p className="text-xl">No History For This User.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 rounded-md ${currentPage === index + 1
                  ? 'bg-[#057d7a] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 transition-colors duration-200`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
        {/*Feedback Modal*/}
        {isFeedbackModalOpen && (
          <Feedback
            appointmentId={selectedAppointmentId}
            onClose={handleCloseModal}
            onFeedbackSubmit={handleFeedbackSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default History;
