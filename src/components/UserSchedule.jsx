import MyCalendar from "./Calendar";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../hooks/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserSchedule = () => {
  const {
    authState: { user, userId },
  } = useAuth();
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      const response = await axios.get(
        `${API_BASE_URL}/Availability/getavailableslots`,
        {
          withCredentials: true,
        }
      );

      const transformedSlots = response.data.map((slot) => ({
        title: "Tillgänglig tid",
        start: new Date(slot.startTime),
        end: new Date(slot.endTime),
        color: "#057d7a",
      }));
      setSlots(transformedSlots);
    };
    fetchSlots();
  }, []);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleEventClick = (event) => {
    setSelectedSlot(event);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const appointmentData = {
      patientId: userId,
      caregiverId: 2,
      appointmentTime: selectedSlot.start,
    };

    await axios.post(
      `${API_BASE_URL}/Appointment/createappointment`,
      appointmentData,
      {
        withCredentials: true,
      }
    );
    setShowModal(false);
    setIsBooked(true);
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = event.color || "#fff"; // Standardfärg om ingen färg finns
    let style = {
      backgroundColor,
      borderRadius: "12px",
      opacity: 0.8,
      color: "white",
      border: "1px solid #ddd",
      alignItems: "center",
      marginLeft: "5px",
    };
    return {
      style,
    };
  };

  return (
    <div>
      <MyCalendar
        selectTable={true}
        events={slots}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
      />
      <div>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
              className="p-6 rounded-lg shadow-lg w-96"
              style={{ backgroundColor: "#2fadaa" }}
            >
              <h2>
                Bokning avser <span className="font-bold">{user}</span>
              </h2>
              Tid:{" "}
              <span className="font-bold text-red-600">
                {format(selectedSlot.start, "HH:mm")} -{" "}
                {format(selectedSlot.end, "HH:mm")}
              </span>
              <p>
                Datum:{" "}
                <span className="font-bold text-red-600">
                  {format(selectedSlot.start, "yy-MM-dd")}
                </span>
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Boka
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        {isBooked && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
              className="p-6 rounded-lg shadow-lg w-96"
              style={{ backgroundColor: "#2fadff" }}
            >
              <h2>
                Bekräftelse av tidsbokning för{" "}
                <span className="font-bold">{user}</span>
              </h2>
              Tid:{" "}
              <span className="font-bold text-red-600">
                {format(selectedSlot.start, "HH:mm")} -{" "}
                {format(selectedSlot.end, "HH:mm")}
              </span>
              <p>
                Datum:{" "}
                <span className="font-bold text-red-600">
                  {format(selectedSlot.start, "yy-MM-dd")}
                </span>
              </p>
              <p className="mt-4">(Vid uteblivet besök så dör du)</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsBooked(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Okej!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSchedule;
