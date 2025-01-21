import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import MyCalendar from "./Calendar";
import axios from "axios";
import moment from "moment";
import { se } from "date-fns/locale";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API Functions
const createAvailability = async (availability) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/availability/createavailibility`,
      availability,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating availability:", error);
    throw error;
  }
};
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
const updateAvailability = async (id, availability) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/availability/Updateavailability/${id}`,
      { id, ...availability },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating availability:", error);
    throw error;
  }
};
const deleteAvailability = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/availability/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting availability:", error);
    throw error;
  }
};

const getAppointmentById = async (appointmentId) => {
  console.log("Appointment ID:", appointmentId); // Debugging line
  try {
    const response = await axios.get(
      `${API_BASE_URL}/appointment/getappointmentbyid/${appointmentId}`,
      {
        withCredentials: true,
      }
    );
    console.log("Fetched Appointment:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw error;
  }
};
const updateAppointment = async (appointmentId, caregiverid, newavailabilityid, oldavailabilityid, newStartTime) => {
  const payload = {
    AppointmentId: appointmentId,
    caregiverid: caregiverid,
    newavailabilityid: newavailabilityid,
    oldavailabilityid: oldavailabilityid,
    appointmenttime: newStartTime,
    Status: 0,
  };

  console.log("Payload being sent:", payload); // Debugging line

  try {
    const response = await axios.put(
      `${API_BASE_URL}/appointment/updateappointment`,
      payload,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating appointment time:", error);
    throw error;
  }
};
function AdminSchedule() {
  const { authState } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "" });
  const [timeError, setTimeError] = useState("");
  const [error, setError] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedNewAvailability, setSelectedNewAvailability] = useState(null);
  const [appointmentStatus, setAppointmentStatus] = useState("");

  useEffect(() => {
    const fetchAvailability = async () => {
      if (authState?.userId) {
        try {
          const availability = await getAvailability(authState);

          if (Array.isArray(availability) && availability.length > 0) {
            const mappedEvents = availability.map((event) => ({
              id: event.id,
              title: event.isBooked ? "Booked" : "Available",
              isBooked: event.isBooked,
              start: new Date(event.startTime),
              end: new Date(event.endTime),
              appointmentId: event.appointmentId, // Ensure this is included
            }));
            setEvents(mappedEvents);
          } else {
            setEvents([]);
          }
        } catch (error) {
          console.error("Error fetching availability:", error);
          setError("Kunde inte hämta tillgänglighet.");
          setEvents([]);
        }
      } else {
        console.error("userid is undefined. User might not be authenticated.");
      }
    };
    fetchAvailability();
  }, [authState]);
  const handleSelectEvent = async (event) => {
    if (event.isBooked && event.appointmentId) {
      try {
        const appointmentInfo = await getAppointmentById(event.appointmentId);
        setSelectedEvent({
          ...event,
          appointmentInfo: {
            patient: appointmentInfo.patient.firstname + " " + appointmentInfo.patient.lastname,
            caregiver: appointmentInfo.caregiver.firstname + " " + appointmentInfo.caregiver.lastname,
            description: appointmentInfo.description,
            appointmentStatus: appointmentInfo.status,
          },
          appointmentStatus: statusMap[appointmentInfo.Status], // Map integer to string status
        });
      } catch (error) {
        setError("Kunde inte hämta bokningsinformation. Vänligen försök igen.");
      }
    } else {
      setSelectedEvent({
        ...event,
        appointmentStatus: "Scheduled", // Default status for non-booked events
      });
    }
    console.log("Selected Event:", event); // Debug log
  };
  useEffect(() => {
    console.log("Selected Event Updated:", selectedEvent); // Debug log
  }, [selectedEvent]);

  const eventPropGetter = (event) => {
    const style = {
      backgroundColor: event.isBooked ? "#057d7a" : "darkgray",
      color: "white",
      borderRadius: "5px",
      border: "none",
    };

    return {
      style,
    };
  };

  const roundToNearest30Minutes = (date) => {
    const minutes = moment(date).minutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    return moment(date).minutes(roundedMinutes).seconds(0).toDate();
  };

  const handleTimeChange = (field, value) => {
    const date = moment(value);
    const roundedDate = roundToNearest30Minutes(date.toDate());
    const roundedMinutes = moment(roundedDate).minutes();
    const roundedHour = moment(roundedDate).hour();

    if (roundedMinutes % 30 !== 0) {
      setTimeError(
        "Vänligen välj en tid i 30-minutersintervall (t.ex., 09:00 eller 09:30)."
      );
      return;
    }

    if (roundedHour < 8 || roundedHour > 16) {
      setTimeError("Tiden måste vara mellan 08:00 och 16:00.");
      return;
    }

    setTimeError("");
    setNewEvent((prev) => ({ ...prev, [field]: roundedDate }));
  };

  const handleSelectSlot = ({ start, end }) => {
    const adjustedStart = roundToNearest30Minutes(start);
    const adjustedEnd = roundToNearest30Minutes(end);

    const startHour = moment(adjustedStart).hour();
    const endHour = moment(adjustedEnd).hour();

    if (startHour < 8 || endHour > 16) {
      setTimeError("Time has to be between 08:00 och 16:00.");
      return;
    }

    setNewEvent({ title: "Available", start: adjustedStart, end: adjustedEnd });
    setIsModalOpen(true);
    setTimeError("");
  };

  const handleAddEvent = async () => {
    if (newEvent.start && newEvent.end) {
      const startHour = moment(newEvent.start).hour();
      const endHour = moment(newEvent.end).hour();

      if (startHour < 8 || endHour > 16) {
        setTimeError("Time has to be between 08:00 och 16:00.");
        return;
      }

      const availability = {
        StartTime: newEvent.start,
        EndTime: newEvent.end,
        IsAvailable: true,
      };

      try {
        // 1. Skapa event i backend
        const createdEvent = await createAvailability(availability);

        // 2. Hämta den uppdaterade listan med events från backend
        const updatedAvailability = await getAvailability(authState);

        // 3. Mappa och uppdatera events-tillståndet
        const mappedEvents = updatedAvailability.map((event) => ({
          id: event.id,
          title: "Available", // Använd en standardtitel om Title saknas
          isBooked: event.isBooked || false, // Ensure isBooked is correctly set
          start: new Date(event.startTime),
          end: new Date(event.endTime),
          appointmentId: event.appointmentId || null, // Ensure appointmentId is correctly set
        }));

        setEvents(mappedEvents); // Uppdatera events-tillståndet
        setIsModalOpen(false); // Stäng modalen
        setNewEvent({ start: "", end: "" }); // Återställ formuläret
      } catch (error) {
        console.error("Error creating availability:", error);
      }
    }
  };

  const handleUpdateEvent = async () => {
    if (selectedEvent) {
      const availability = {
        StartTime: selectedEvent.start,
        EndTime: selectedEvent.end,
        IsAvailable: true,
      };

      try {
        // Call the update API
        const updatedEvent = await updateAvailability(
          selectedEvent.id,
          availability
        );

        // Update the events state
        const updatedEvents = events.map((event) =>
          event.id === selectedEvent.id ? { ...event, ...selectedEvent } : event
        );

        setEvents(updatedEvents); // Update the events state
        setSelectedEvent(null); // Close the modal
      } catch (error) {
        console.error("Error updating availability:", error);
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await deleteAvailability(selectedEvent.id);
        const updatedEvents = events.filter(
          (event) => event.id !== selectedEvent.id
        );
        setEvents(updatedEvents);
        setSelectedEvent(null);
      } catch (error) {
        console.error("Error deleting availability:", error);
      }
    }
  };

  const handleUpdateBookedEvent = async () => {
    if (!selectedEvent || !selectedEvent.appointmentId) {
      console.error("No selected event or appointment ID found.");
      return;
    }
  
    try {
      // Fetch the user's availabilities
      const availabilityList = await getAvailability(authState);
      const availableSlots = availabilityList.filter((slot) => !slot.isBooked);
  
      // Update the availabilities state
      setAvailabilities(availableSlots);
      setIsChangeModalOpen(true);
    } catch (error) {
      console.error("Error fetching availabilities:", error);
    }
  };
  
  const handleSaveNewAppointmentTime = async () => {
    if (!selectedNewAvailability || !selectedEvent) {
      setError("Please select a new time slot.");
      return;
    }
  
    try {
      // Call the updateAppointmentTime function
      await updateAppointment(
        selectedEvent.appointmentId, //appointmentId
        authState.userId, //caregiverid
        selectedNewAvailability.id,
        selectedEvent.id, //oldavailabilityid
        selectedNewAvailability.startTime,
      );
      // Fetch the updated availability list
      const updatedAvailability = await getAvailability(authState);
  
      // Map and update the events state
      const mappedEvents = updatedAvailability.map((event) => ({
        id: event.id,
        title: event.isBooked ? "Booked" : "Available",
        isBooked: event.isBooked,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        appointmentId: event.appointmentId,
      }));
  
      // Update the events state
      setEvents(mappedEvents);
  
      // Close the modal and reset states
      setIsChangeModalOpen(false);
      setSelectedEvent(null);
      setSelectedNewAvailability(null);
    } catch (error) {
      console.error("Error updating booked event:", error);
      setError("Failed to update the appointment. Please try again.");
    }
  };

  const handleUpdateAppointmentStatus = async () => {
    if (!selectedEvent || !selectedEvent.appointmentId) {
      console.error("No selected event or appointment ID found.");
      return;
    }

    // Map the frontend status to the backend enum values
    const statusMap = {
      Scheduled: 0,
      Completed: 1,
      Cancelled: 2,
    };

    const payload = {
      AppointmentId: selectedEvent.appointmentId,
      caregiverid: authState.userId,
      newavailabilityid: selectedEvent.id, 
      oldavailabilityid: selectedEvent.id, 
      appointmenttime: selectedEvent.start.toISOString(),
      Status: statusMap[selectedEvent.appointmentStatus],
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointment/updateappointment`,
        payload,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      if (error.response) {
        console.error("Backend response:", error.response.data); 
      }
      throw error;
    }
  };
  const handleSaveAndClose = async () => {
    try {
      await handleUpdateAppointmentStatus();

      // Close the modal
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error saving and closing:", error);
      setError("Failed to save the appointment status. Please try again.");
    }
  };

  const statusMap = {
    0: "Scheduled",
    1: "Completed",
    2: "Cancelled",
  };
  
  return (
    <>
      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Add availability</h3>
            <label className="block mb-2">Start date and time:</label>
            <input
              type="datetime-local"
              value={moment(newEvent.start).format("YYYY-MM-DDTHH:mm")}
              onChange={(e) => handleTimeChange("start", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              step="1800"
              min={moment(newEvent.start)
                .startOf("day")
                .hour(8)
                .format("YYYY-MM-DDTHH:mm")}
              max={moment(newEvent.start)
                .startOf("day")
                .hour(16)
                .format("YYYY-MM-DDTHH:mm")}
            />
            <input
              type="datetime-local"
              value={moment(newEvent.end).format("YYYY-MM-DDTHH:mm")}
              onChange={(e) => handleTimeChange("end", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              step="1800"
              min={moment(newEvent.end)
                .startOf("day")
                .hour(8)
                .format("YYYY-MM-DDTHH:mm")}
              max={moment(newEvent.end)
                .startOf("day")
                .hour(16)
                .format("YYYY-MM-DDTHH:mm")}
            />
            {timeError && (
              <p className="text-red-500 text-sm mb-4">{timeError}</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-100">
            {selectedEvent.isBooked && selectedEvent.appointmentInfo ? (
              <>
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold mb-2">Booked time</h4>
                  <button className="mr-2" onClick={() => setSelectedEvent(null)}>❌</button>
                </div>
                <p>
                  <strong>Caretaker:</strong>{" "}
                  {selectedEvent.appointmentInfo.patient}
                </p>
                <p>
                  <strong>Caregiver:</strong>{" "}
                  {selectedEvent.appointmentInfo.caregiver}
                </p>
                <p>
                  <strong>Start time:</strong>{" "}
                  {moment(selectedEvent.start).format("YYYY-MM-DD HH:mm")}
                </p>
                <p>
                  <strong>End time:</strong>{" "}
                  {moment(selectedEvent.end).format("YYYY-MM-DD HH:mm")}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedEvent.appointmentInfo.description}
                </p>
                <div className="flex justify-end mt-4 space-x-1">
                <button
                  onClick={handleSaveAndClose} // Save and close
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save and Close
                </button>
                  <button
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                  <button
                    onClick={handleUpdateBookedEvent}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Change
                  </button>
                  <select
                    value={selectedEvent?.appointmentStatus}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        appointmentStatus: e.target.value, // Update the status in state
                      })
                    }
                    className="block px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4">Change availability</h3>
                <label className="block mb-2">Start date and time:</label>
                <input
                  type="datetime-local"
                  value={moment(selectedEvent.start).format("YYYY-MM-DDTHH:mm")}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      start: new Date(e.target.value),
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  step="1800"
                />
                <label className="block mb-2">End date and time:</label>
                <input
                  type="datetime-local"
                  value={moment(selectedEvent.end).format("YYYY-MM-DDTHH:mm")}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      end: new Date(e.target.value),
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  step="1800"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                  <button
                    onClick={handleUpdateEvent}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
 {isChangeModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h3 className="text-xl font-bold mb-4">Change Appointment Time</h3>
      <select
        value={selectedNewAvailability ? selectedNewAvailability.id : ""}
        onChange={(e) => {
          const selectedId = e.target.value;
          const selected = availabilities.find(
            (avail) => avail.id === Number(selectedId)
          );
          setSelectedNewAvailability(selected);
        }}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      >
        <option value="">Select a new time slot</option>
        {availabilities.map((avail) => (
          <option key={avail.id} value={avail.id}>
            {moment(avail.startTime).format("YYYY-MM-DD HH:mm")} -{" "}
            {moment(avail.endTime).format("HH:mm")}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => {
            setIsChangeModalOpen(false);
            setSelectedNewAvailability(null); // Reset selected availability
            setError(null); // Clear any errors
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveNewAppointmentTime}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
      {/* Calendar Component */}
      <MyCalendar
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent} // Ensure this is correctly wired
        events={events}
        eventPropGetter={eventPropGetter} // Pass the eventPropGetter function here
      />
    </>
  );
}

export default AdminSchedule;