import MyCalendar from "./Calendar";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserSchedule = () => {
  const {
    authState: { user, userId },
  } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isBookedModal, setIsBookedModal] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showNoSlotsModal, setShowNoSlotsModal] = useState(false);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/Availability/getavailableslots`,
          {
            withCredentials: true,
          }
        );
        const availableSlots = response.data.filter((slot) => !slot.isBooked);

        if (availableSlots.length === 0) {
          setShowNoSlotsModal(true);
          return;
        }

        const transformedSlots = availableSlots.map((slot) => ({
          title: "Tillgänglig tid",
          start: new Date(slot.startTime),
          end: new Date(slot.endTime),
          caregiverId: slot.caregiverId,
          color: "#057d7a",
        }));

        setSlots(transformedSlots);
        setBookingCompleted(false);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };
    fetchSlots();
  }, [bookingCompleted]);

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
      caregiverId: selectedSlot.caregiverId,
      appointmentTime: selectedSlot.start,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/Appointment/createappointment`,
        appointmentData,
        {
          withCredentials: true,
        }
      );
      setIsBookedModal(true);
      setBookingCompleted(true);
      setErrorMessage("");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else if (error.request) {
        setErrorMessage(
          "Servern svarar inte. Kontrollera din anslutning och försök igen."
        );
      } else {
        setErrorMessage("Nåt gick fel. Försök igen");
      }
      setShowErrorModal(true);
    }
  };

  const handleNoSlots = () => {
    setShowNoSlotsModal(false);
    setShowModal(false);
    navigate("/user/dashboard", { replace: true });
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
        {showNoSlotsModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="p-6 rounded-lg shadow-lg w-96 bg-white">
              <h2 className="mb-2">Inga tillgängliga tider</h2>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleNoSlots}
                  className="px-4 py-2 m-2 text-white bg-[#057d7a] rounded hover:bg-[#2fadaa]"
                >
                  Stäng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
              className="p-6 rounded-lg shadow-lg w-96"
              style={{ backgroundColor: "#fff" }}
            >
              <h2 className="mb-2">
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
      <div>
        {isBookedModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="p-6 rounded-lg shadow-lg w-96 bg-gray-100">
              <h2 className="mb-2">
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
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsBookedModal(false)}
                  className="px-4 py-2 m-2 text-white bg-[#057d7a] rounded hover:bg-[#2fadaa]"
                >
                  Okej!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        {showErrorModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="p-6 rounded-lg shadow-lg w-96 bg-white">
              <h2 className="mb-2">Fel vid bokning</h2>
              <p className="text-red-600">{errorMessage}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 m-2 text-white bg-[#057d7a] rounded hover:bg-[#2fadaa]"
                >
                  Stäng
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
