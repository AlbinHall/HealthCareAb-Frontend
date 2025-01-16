import { useAuth } from "../hooks/useAuth";
import React, { useEffect, useState } from "react";
import Logo from "../assets/health_care_good_logo.png";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAvailability = async (authState) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/availability/${authState.userId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching availability:", error);
    throw error;
  }
};

const getAppointmentById = async (appointmentId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/appointment/getappointmentbyid/${appointmentId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw error;
  }
};

const isDateInCurrentWeek = (date) => {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const endOfWeek = new Date(now.setDate(now.getDate() + 6));

  return date >= startOfWeek && date <= endOfWeek;
};

function AdminDashboard() {
  const { authState } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const rating = 3;
  const progress = (rating / 5) * 100;

  useEffect(() => {
    if (authState.userId) {
      getAvailability(authState)
        .then((data) => {
          const currentWeekAvailabilities = data.filter((availability) => {
            const startTime = new Date(availability.startTime);
            return isDateInCurrentWeek(startTime) && !availability.isBooked;
          }).slice(0, 20);
          setAvailabilities(currentWeekAvailabilities);

          const bookedAvailabilities = data.filter((availability) => {
            const startTime = new Date(availability.startTime);
            return isDateInCurrentWeek(startTime) && availability.isBooked;
          });

          const fetchAppointments = bookedAvailabilities.map((availability) => {
            return getAppointmentById(availability.appointmentId);
          });

          Promise.all(fetchAppointments)
          .then((appointments) => {
            console.log("Fetched Appointments: ", appointments);
            setAppointments(appointments);
          })
          .catch((error) => {
            console.error("Error fetching appointments:", error);
          });
        })
        .catch((error) => {
          console.error("Error fetching availability:", error);
        });
    }
  }, [authState]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <img src={Logo} alt="Health Care Logo" className="h-80 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

        {/* Card 1 */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-1">Your Appointments</h3>
          <ul className="text-gray-600 mt-4 max-h-64 overflow-y-auto">
          {appointments.length > 0 ? (
  appointments.map((appointment, index) => (
    <li key={index} className="mb-1 p-1 bg-gray-100 rounded-lg">
      <span className="font-medium">
        {appointment.patient.username} - {appointment.caregiver.username}
      </span>
      <span className="block text-sm">
        {new Date(appointment.dateTime).toLocaleString()}
      </span>
      <span className="block text-sm">
        Status: {appointment.status === 0 ? "Scheduled" : "Other"}
      </span>
    </li>
  ))
) : (
  <li className="text-gray-500">No appointments for this week.</li>
)}
          </ul>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-semibold mb-1">This Week Availabilities</h3>
          <ul className="text-gray-600 max-h-64 overflow-y-auto">
            {availabilities.length > 0 ? (
              availabilities.map((availability, index) => (
                <li key={index} className="mb-1 p-2 bg-gray-100 rounded-lg">
                  <span className="font-medium">
                    {new Date(availability.startTime).toLocaleDateString()}
                  </span>
                  <span className="block text-sm">
                    {new Date(availability.startTime).toLocaleTimeString()} - {new Date(availability.endTime).toLocaleTimeString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No availabilities for this day.</li>
            )}
          </ul>
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
                strokeDasharray={`${progress}, 100`}
                strokeDashoffset="0"
                strokeLinecap="round"
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