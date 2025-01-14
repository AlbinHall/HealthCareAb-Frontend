import { useAuth } from "../hooks/useAuth";
import React, { useEffect, useState } from "react";
import Logo from "../assets/health_care_good_logo.png";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Existing function to fetch a single appointment by ID
const getAppointmentById = async (appointmentId) => {
  console.log("Appointment ID:", appointmentId); // Debugging line
  try {
    const response = await axios.get(
      `${API_BASE_URL}/appointment/getappointmentbyid/${appointmentId}`,
      {
        withCredentials: true,
      }
    );
    console.log("Fetched Appointment:", response.data); // Debugging line
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw error;
  }
};

// New function to fetch the user's appointments
const getUserAppointments = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/appointment/getappointmentsbyuserid/${userId}`,
      {
        withCredentials: true,
      }
    );
    console.log("Fetched Appointments:", response.data); // Debugging line
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

function AdminDashboard() {
  const { authState } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const rating = 3; // Dynamiskt betyg, ändra detta värde för att representera din användares betyg (1-5).
  const progress = (rating / 5) * 100; // Beräkna procentsats för cirkeln
  const {
    authState: { user },
  } = useAuth();
  console.log("User object from useAuth:", authState.user); // Debugging line

  useEffect(() => {
    if (user?.id) {
      getUserAppointments(user.id)
        .then((data) => {
          // Assuming the API returns all appointments, we slice to get the first 5
          setAppointments(data.slice(0, 5));
        })
        .catch((error) => {
          console.error("Error fetching user appointments:", error);
        });
    }
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <img src={Logo} alt="Health Care Logo" className="h-80 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

        {/* Card 1 */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Your Appointments</h3>
          <p className="text-gray-600">
            Here you can see some of your upcoming appointments.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">This Week Availabilities</h3>
          <p className="text-gray-600">
            View detailed reports and analytics to monitor system performance.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Your Personal Rating</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle
                className="text-gray-200"
                strokeWidth="4.5"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.915"
              />
              {/* Filled circle */}
              <circle
                className="text-blue-500 progress-circle"
                strokeWidth="4.5"
                strokeDasharray={`${progress}, 100`} // Dynamic fill value
                strokeDashoffset="0" // Set to 0 to ensure full fill
                strokeLinecap="round" // Make the edges rounded
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.915"
              />
            </svg>
            {/* Text in the center */}
            <p className="absolute text-xl font-bold text-gray-800">
              {rating}/5
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS for animation */}
      <style>
        {`
          @keyframes progress {
            from {
              stroke-dasharray: 0, 100;
            }
            to {
              stroke-dasharray: ${progress}, 100;
            }
          }

          .progress-circle {
            animation: progress 1s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}

export default AdminDashboard;