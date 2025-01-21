import MyCalendar from "./Calendar";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { bookAppointment } from "./BookingUtils";
import ErrorModal from "./ErrorModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserSchedule = () => {
  const {
    authState: { userId, firstname, lastname },
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
  const [selectedCaregiverId, setSelectedCaregiverId] = useState(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/Availability/getuniqueslots`,
          {
            withCredentials: true,
          }
        );

        const availableSlots = response.data;

        if (availableSlots.length === 0) {
          setShowNoSlotsModal(true);
          return;
        }

        const transformedSlots = availableSlots.map((slot) => ({
          title: "Available",
          start: new Date(slot.startTime),
          end: new Date(slot.endTime),
          caregiverId: slot.caregiverId,
          caregivers: slot.caregivers,
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
    if (!selectedCaregiverId) {
      setErrorMessage("Select a caregiver");
      return;
    }

    try {
      await bookAppointment(
        userId,
        selectedSlot,
        selectedCaregiverId,
        description
      );
      setIsBookedModal(true);
      setBookingCompleted(true);
      setErrorMessage("");
      setShowModal(false);
      setDescription("");
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else if (error.request) {
        setErrorMessage(
          "Server not responding. Check your connection and try again."
        );
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
      setShowErrorModal(true);
      setShowModal(false);
    }
  };

  const handleAbort = () => {
    setShowModal(false);
    setSelectedCaregiverId(null);
    setErrorMessage("");
  };

  const handleNoSlots = () => {
    setShowNoSlotsModal(false);
    setShowModal(false);
    navigate("/user/dashboard", { replace: true });
  };

  const handleConfirmClick = () => {
    setIsBookedModal(false);
    setSelectedCaregiverId(null);
    setErrorMessage("");
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
              <h2 className="mb-2">No available slots</h2>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleNoSlots}
                  className="px-4 py-2 m-2 text-white bg-[#057d7a] rounded hover:bg-[#2fadaa]"
                >
                  Cancel
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
                Appointment regarding{" "}
                <span className="font-bold">
                  {firstname} {lastname}
                </span>
              </h2>
              ToD{" "}
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
                  {selectedSlot.caregivers.length} doctor available
                </p>
                <select
                  className="w-full p-2 border rounded"
                  onChange={(e) =>
                    setSelectedCaregiverId(Number(e.target.value))
                  }
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
                <h2 className="mb-2">Beskrivning av bokning</h2>
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="Beskrivning"
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
      </div>
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
                Doctor:{" "}
                <span className="font-bold">
                  {
                    selectedSlot.caregivers.find(
                      (caregiver) =>
                        caregiver.id === Number(selectedCaregiverId)
                    )?.name
                  }
                </span>
              </p>
              <p>
                ToD:{" "}
                <span className="font-bold">
                  {format(selectedSlot.start, "HH:mm")} -{" "}
                  {format(selectedSlot.end, "HH:mm")}
                </span>
              </p>
              <p>
                Date:{" "}
                <span className="font-bold">
                  {format(selectedSlot.start, "yy-MM-dd")}
                </span>
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleConfirmClick}
                  className="px-4 py-2 m-2 text-white bg-[#057d7a] rounded hover:bg-[#2fadaa]"
                >
                  Confirm
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
};

export default UserSchedule;
