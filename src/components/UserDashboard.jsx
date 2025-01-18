import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import Logo from "../assets/health_care_logo.svg";
import { format, set } from "date-fns";
import { bookAppointment } from "./BookingUtils";

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
  const [selectedCaregiverId, setSelectedCaregiverId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

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
        setNextAppointments(response.data);
      } catch (error) {
        console.error("Error fetching scheduled appointments:", error);
      } finally {
        setIsLoadingScheduled(false);
      }
    };
    fetchScheduledAppointments();
  }, []);

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

      // Filter for today's date
      const today = new Date().toISOString().split("T")[0]; // yyyy-MM-dd
      const filteredSLots = response.data.filter((slot) => {
        const slotDate = new Date(slot.startTime).toISOString().split("T")[0];
        return slotDate === today;
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
    console.log("Slot: ", slot);
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedCaregiverId) {
      setErrorMessage("Du måste välja en läkare.");
      return;
    }
    console.log("Selected slot: ", selectedSlot);
    try {
      await bookAppointment(userId, selectedSlot, selectedCaregiverId);
      setShowModal(false);
      getAvailableSlots();
    } catch (error) {
      setErrorMessage(error.message);
    }
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
    <div className="flex flex-col items-center justify-center p-4">
      <img src={Logo} alt="Health Care Logo" className="h-80 mb-6" />
      <div className="card-container flex justify-evenly w-full mt-8">
        <div className="upcoming-card max-w-sm rounded px-2 overflow-hidden shadow-lg h-80 min-w-[30%] bg-gradient-to-r from-white to-gray-50 overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4 sticky top-0 bg-gradient-to-r from-white to-gray-50 py-2 z-10 shadow-sm border-b border-gray-200">
            Upcoming appointments
          </h3>
          {nextAppointments.length === 0 ? (
            <p className="font-bold text-lg mb-4">No upcoming appointments</p>
          ) : (
            <ul>
              {nextAppointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="mb-2 p-1 bg-gray-100 rounded-lg"
                >
                  <p>
                    <span className="font-semibold">Time:</span>{" "}
                    {formatTime(appointment.appointmentTime)}
                  </p>
                  <p>
                    <span className="font-semibold">Caregiver:</span>{" "}
                    {appointment.caregiverName}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="slots-card max-w-sm rounded px-2 overflow-hidden shadow-lg h-80 min-w-[30%] bg-gradient-to-r from-white to-gray-50 overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4 sticky top-0 bg-gradient-to-r from-white to-gray-50 py-2 z-10 shadow-sm border-b border-gray-200">
            Today's available times
          </h3>
          {availableSlots.length === 0 ? (
            <p className="font-bold text-lg mb-4">No available slots</p>
          ) : (
            <ul>
              {availableSlots.map((slot) => (
                <li key={slot.id} className="mb-2 p-1 bg-gray-100 rounded-lg">
                  <p>
                    <span className="font-semibold">Time:</span>{" "}
                    {formatTime(slot.startTime)}
                  </p>
                  <p>
                    <span className="font-semibold">Caregiver:</span>{" "}
                    {slot.caregivers[0].name}
                  </p>
                  <button
                    onClick={() => handleBookingClick(slot)}
                    className="mt-2 px-4 py-2 bg-[#057d7a] text-white rounded hover:bg-[#2fadaa]"
                  >
                    Book
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="history-card max-w-sm rounded px-2 overflow-hidden shadow-lg h-80 min-w-[30%] bg-gradient-to-r from-white to-gray-50 overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4 sticky top-0 bg-gradient-to-r from-white to-gray-50 py-2 z-10 shadow-sm border-b border-gray-200">
            Historic appointments
          </h3>
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
      {showModal && selectedSlot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className="p-6 rounded-lg shadow-lg w-96"
            style={{ backgroundColor: "#fff" }}
          >
            <h2 className="mb-2">
              Bokning avser{" "}
              <span className="font-bold">
                {firstname} {lastname}
              </span>
            </h2>
            Tid:{" "}
            <span className="font-bold">
              {format(selectedSlot.startTime, "HH:mm")} -{" "}
              {format(selectedSlot.endTime, "HH:mm")}
            </span>
            <p>
              Datum:{" "}
              <span className="font-bold">
                {format(selectedSlot.startTime, "yy-MM-dd")}
              </span>
            </p>
            <div className="mt-5 space-x-2">
              {!selectedCaregiverId && (
                <p className="text-red-600">{errorMessage}</p>
              )}
              <p className="mb-2">
                Välj läkare: (
                {selectedSlot.caregivers.length > 1
                  ? `${selectedSlot.caregivers.length} tillgängliga`
                  : `${selectedSlot.caregivers.length} tillgänglig`}
                )
              </p>
              <select
                className="w-full p-2 border rounded"
                onChange={(e) => setSelectedCaregiverId(Number(e.target.value))}
              >
                <option value="">Välj här</option>
                {selectedSlot.caregivers.map((caregiver) => (
                  <option key={caregiver.id} value={caregiver.id}>
                    {caregiver.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAbort}
                className="px-4 py-2 m-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Avbryt
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 m-2 text-white bg-[#057d7a] rounded hover:bg-[#2fadaa]"
              >
                Boka
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
