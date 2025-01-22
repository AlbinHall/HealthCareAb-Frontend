import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Logo from "../assets/health_care_logo.svg";
import { format, set } from "date-fns";
import { bookAppointment } from "./BookingUtils";
import ErrorModal from "./ErrorModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function UserDashboard() {
  const {
    authState: { userId, firstname, lastname },
  } = useAuth();
  const [nextAppointments, setNextAppointments] = useState([]);
  const [historicAppointments, setHistoricAppointments] = useState([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedCaregiverId, setSelectedCaregiverId] = useState(null);
  const [description, setDescription] = useState("");
  const [isBookedModal, setIsBookedModal] = useState(false);

  // Fetch scheduled appointments
  useEffect(() => {
    if (!userId) return;
    const fetchScheduledAppointments = async () => {
      setIsLoadingScheduled(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/Appointment/getscheduledappointments/${userId}`,
          {
            withCredentials: true,
          }
        );

        const sortedAppointments = response.data.sort((a, b) => {
          const timeA = new Date(a.appointmentTime).getTime();
          const timeB = new Date(b.appointmentTime).getTime();
          return timeA - timeB;
        });

        setNextAppointments(sortedAppointments);
      } catch (error) {
        console.error("Error fetching scheduled appointments:", error);
      } finally {
        setIsLoadingScheduled(false);
      }
    };
    fetchScheduledAppointments();
  }, [availableSlots]);

  // Fetch historic appointments
  useEffect(() => {
    if (!userId) return;
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/History/getHistory`, {
          withCredentials: true,
        });
        setHistoricAppointments(response.data);
      } catch (error) {
        console.error("Error fetching history", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  // Fetch available slots
  const getAvailableSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Availability/getuniqueslots`,
        {
          withCredentials: true,
        }
      );

      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredSLots = response.data
        .map((slot) => {
          const start = new Date(slot.startTime);
          const end = new Date(slot.endTime);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.error("Invalid date:", slot.startTime, slot.endTime);
            return null;
          }

          return {
            ...slot,
            start,
            end,
          };
        })
        .filter(Boolean)
        .filter((slot) => {
          const slotDate = new Date(slot.start);
          slotDate.setHours(0, 0, 0, 0);

          // Check if slot is today and not in the past, ToD included
          return slotDate.getTime() === today.getTime() && slot.start > now;
        });

      setAvailableSlots(filteredSLots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
    } finally {
      setIsLoadingSlots(false);
    }
  };
  useEffect(() => {
    if (!userId) return;
    getAvailableSlots();
  }, []);

  const handleBookingClick = (slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleCancelAppointment = async (appointment) => {
    if (!appointment) return;

    setSelectedAppointment(appointment);
    setShowConfirmationModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    setShowConfirmationModal(false);
    try {
      await axios.delete(
        `${API_BASE_URL}/Appointment/deleteappointment/${selectedAppointment.id}`,
        {
          withCredentials: true,
        }
      );

      setNextAppointments((prevAppointments) =>
        prevAppointments.filter((app) => app.id !== selectedAppointment.id)
      );

      setShowModal(false);
      getAvailableSlots();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else if (error.request) {
        setErrorMessage(
          "Server not responding. Check your connection and try again."
        );
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedCaregiverId) {
      setErrorMessage("Select a caregiver.");
      return;
    }

    try {
      await bookAppointment(
        userId,
        selectedSlot,
        selectedCaregiverId,
        description
      );
      setShowModal(false);
      getAvailableSlots();
      setIsBookedModal(true);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else if (error.request) {
        setErrorMessage(
          "Server not responding. Check your connection and try again."
        );
      } else if (error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
      setShowErrorModal(true);
      setDescription("");
      setSelectedCaregiverId(null);
      setShowModal(false);
    }
  };

  const handleConfirmClick = () => {
    setIsBookedModal(false);
    setSelectedCaregiverId(null);
    setErrorMessage("");
    setDescription("");
  };

  const handleAbort = () => {
    setShowModal(false);
    setSelectedCaregiverId(null);
    setErrorMessage("");
  };

  if (isLoadingScheduled || isLoadingHistory || isLoadingSlots) {
    return <div>Loading...</div>;
  }

  const formatTime = (date) => {
    return format(new Date(date), "yyyy-MM-dd - HH:mm");
  };

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <img src={Logo} alt="Health Care Logo" className="h-72 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Upcoming appointments card */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4 sticky top-0 bg-gradient-to-r from-white to-gray-50 py-2 z-10 shadow-sm border-b border-gray-200">
            Your upcoming appointments
          </h3>
          <div className="max-h-80 overflow-y-auto"> {/* Add max-height and overflow-y */}
            {nextAppointments.length === 0 ? (
              <p className="font-bold text-lg mb-4">No upcoming appointments</p>
            ) : (
              <ul>
                {nextAppointments.map((appointment) => (
                  <li
                    key={appointment.id}
                    className="mb-2 p-1 bg-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-200"
                  >
                    <div>
                      <p>
                        <span className="font-semibold">Time:</span>{" "}
                        {formatTime(appointment.appointmentTime)}
                      </p>
                      <p>
                        <span className="font-semibold">Caregiver:</span>{" "}
                        {appointment.caregiverName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancelAppointment(appointment)}
                      className="px-3 py-2 bg-[#ff3f34] text-white rounded hover:bg-[#ff5e57]"
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Today's available appointments card */}
        <div className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-semibold mb-4 sticky top-0 bg-gradient-to-r from-white to-gray-50 py-2 z-10 shadow-sm border-b border-gray-200">
            Today's available times
          </h3>
          <div className="max-h-80 overflow-y-auto"> {/* Add max-height and overflow-y */}
            {availableSlots.length === 0 ? (
              <p className="font-bold text-lg mb-4">No available slots</p>
            ) : (
              <ul>
                {availableSlots.map((slot) => (
                  <li
                    key={slot.id}
                    className="mb-2 p-1 bg-gray-100 rounded-lg flex justify-between items-center hover:bg-gray-200"
                  >
                    <div>
                      <p>
                        <span className="font-semibold">Time:</span>{" "}
                        {formatTime(slot.start)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBookingClick(slot)}
                      className="px-3 py-2 bg-[#057d7a] text-white rounded hover:bg-[#2fadaa]"
                    >
                      Book
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* History card */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4 sticky top-0 bg-gradient-to-r from-white to-gray-50 py-2 z-10 shadow-sm border-b border-gray-200">
            Historic appointments
          </h3>
          <div className="max-h-80 overflow-y-auto"> {/* Add max-height and overflow-y */}
            {historicAppointments.length === 0 ? (
              <p className="font-bold text-lg mb-4">No historic appointments</p>
            ) : (
              <ul>
                {historicAppointments.map((appointment) => (
                  <li
                    key={appointment.id}
                    className="mb-1 p-1 bg-gray-100 rounded-lg"
                  >
                    <p>Caregiver: {appointment.caregiverName}</p>
                    <p>Patient: {appointment.patientName}</p>
                    <p>Time: {formatTime(appointment.dateTime)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {showModal && selectedSlot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className="p-6 rounded-lg shadow-lg w-96"
            style={{ backgroundColor: "#fff" }}
          >
            <h2 className="mb-2">
              Appointment regarding{" "}
              <span className="font-bold">
                {firstname} {lastname}
              </span>
            </h2>
            ToD:{" "}
            <span className="font-bold">
              {format(selectedSlot.start, "HH:mm")} -{" "}
              {format(selectedSlot.end, "HH:mm")}
            </span>
            <p>
              Date:{" "}
              <span className="font-bold">
                {format(selectedSlot.start, "yy-MM-dd")}
              </span>
            </p>
            <div className="mt-5 space-x-2">
              {!selectedCaregiverId && (
                <p className="text-red-600">{errorMessage}</p>
              )}
              <p className="mb-2">
                {selectedSlot.caregivers.length === 1
                  ? "1 doctor available"
                  : `${selectedSlot.caregivers.length} doctors available`}
              </p>
              <select
                className="w-full p-2 border rounded"
                onChange={(e) => setSelectedCaregiverId(Number(e.target.value))}
              >
                <option value="">No doctor selected</option>
                {selectedSlot.caregivers.map((caregiver) => (
                  <option
                    key={caregiver.id}
                    value={caregiver.id}
                    className="font-semibold"
                  >
                    {caregiver.name}
                  </option>
                ))}
              </select>
              <h2 className="m-2">Describe your symptoms</h2>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Symptoms"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAbort}
                className="px-4 py-2 m-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 m-2 text-white bg-[#057d7a] rounded hover:bg-[#2fadaa]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmationModal && selectedAppointment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Confirm cancellation</h3>
            <p className="mb-4">
              Are you sure you want to cancel this appointment?
            </p>
            <div className="space-x-2">
              <p className="font-semibold">Appointment:</p>
              <p>{formatTime(selectedAppointment.appointmentTime)}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mr-2"
              >
                No
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-[#ff3f34] text-white rounded hover:bg-[#ff5e57]"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        {isBookedModal && selectedCaregiverId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="p-6 rounded-lg shadow-lg w-96 bg-gray-100">
              <h2 className="mb-2">
                Confirmation for{" "}
                <span className="font-bold">
                  {firstname} {lastname}
                </span>
              </h2>
              <p>
                <span className="font-bold">Doctor: </span>
                {
                  selectedSlot.caregivers.find(
                    (caregiver) => caregiver.id === Number(selectedCaregiverId)
                  )?.name
                }
              </p>
              <p>
                <span className="font-bold">ToD: </span>
                {format(selectedSlot.start, "HH:mm")} -{" "}
                {format(selectedSlot.end, "HH:mm")}
              </p>
              <p>
                <span className="font-bold">Date: </span>
                {format(selectedSlot.start, "yy-MM-dd")}
              </p>
              <p>
                <span className="font-bold">Description:</span> {description}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleConfirmClick}
                  className="px-4 py-2 mt-3 text-white bg-[#057d7a] rounded hover:bg-[#2fadaa]"
                >
                  Okay!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        {showErrorModal && (
          <ErrorModal
            errorMessage={errorMessage}
            onClose={() => setShowErrorModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
