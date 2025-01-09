import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import MyCalendar from './Calendar';
import axios from "axios";
import moment from "moment";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API Functions
const createAvailability = async (availability) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/availability/createavailibility`, availability, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating availability:', error);
    throw error;
  }
};
const getAvailability = async (authState) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/availability/${authState.userid}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
};
const updateAvailability = async (id, availability) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/availability/Updateavailability/${id}`, { id, ...availability }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating availability:', error);
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
    console.error('Error deleting availability:', error);
    throw error;
  }
};

const getAppointmentById = async (appointmentId) => {
  console.log("Appointment ID:", appointmentId); // Debugging line
  try {
    const response = await axios.get(`${API_BASE_URL}/appointment/getappointmentbyid/${appointmentId}`, {
      withCredentials: true,
    });
    console.log("Fetched Appointment:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
};


function AdminSchedule() {
  const { authState } = useAuth(); // Correctly destructure authState
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: ''});
  const [timeError, setTimeError] = useState('');
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (authState?.userid) {
        try {
          const availability = await getAvailability(authState);
  
          if (Array.isArray(availability) && availability.length > 0) {
            const mappedEvents = availability.map((event) => ({
              id: event.id,
              title: "Tillgänglig",
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
          console.error('Error fetching availability:', error);
          setError('Kunde inte hämta tillgänglighet.');
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
            patient: appointmentInfo.patient.username,
            caregiver: appointmentInfo.caregiver.username,
          },
        });
      } catch (error) {
        setError('Kunde inte hämta bokningsinformation. Vänligen försök igen.');
      }
    } else {
      setSelectedEvent(event);
    }
  };
  
  const eventPropGetter = (event) => {
    const style = {
      backgroundColor: event.isBooked ? 'green' : 'blue',
      color: 'white',
      borderRadius: '5px',
      border: 'none',
    };
  
    return {
      style,
    };
  };
  // Round time to the nearest 30-minute interval
  const roundToNearest30Minutes = (date) => {
    const minutes = moment(date).minutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    return moment(date).minutes(roundedMinutes).seconds(0).toDate();
  };

  // Handle time input change
  const handleTimeChange = (field, value) => {
    const date = moment(value);
    const roundedDate = roundToNearest30Minutes(date.toDate());
    const roundedMinutes = moment(roundedDate).minutes();
    const roundedHour = moment(roundedDate).hour();

    if (roundedMinutes % 30 !== 0) {
      setTimeError('Vänligen välj en tid i 30-minutersintervall (t.ex., 09:00 eller 09:30).');
      return;
    }

    if (roundedHour < 8 || roundedHour > 16) {
      setTimeError('Tiden måste vara mellan 08:00 och 16:00.');
      return;
    }

    setTimeError('');
    setNewEvent((prev) => ({ ...prev, [field]: roundedDate }));
  };

  // Handle slot selection
  const handleSelectSlot = ({ start, end }) => {
    const adjustedStart = roundToNearest30Minutes(start);
    const adjustedEnd = roundToNearest30Minutes(end);

    const startHour = moment(adjustedStart).hour();
    const endHour = moment(adjustedEnd).hour();

    if (startHour < 8 || endHour > 16) {
      setTimeError('Tiden måste vara mellan 08:00 och 16:00.');
      return;
    }

    setNewEvent({ title: '', start: adjustedStart, end: adjustedEnd});
    setIsModalOpen(true);
    setTimeError('');
  };

  // Handle event creation
  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      const startHour = moment(newEvent.start).hour();
      const endHour = moment(newEvent.end).hour();
  
      if (startHour < 8 || endHour > 16) {
        setTimeError('Tiden måste vara mellan 08:00 och 16:00.');
        return;
      }
  
      const availability = {
        StartTime: newEvent.start,
        EndTime: newEvent.end,
        IsAvailable: true,
        Title: newEvent.title,
      };
  
      try {
        // 1. Skapa event i backend
        const createdEvent = await createAvailability(availability);
  
        // 2. Hämta den uppdaterade listan med events från backend
        const updatedAvailability = await getAvailability(authState);
  
        // 3. Mappa och uppdatera events-tillståndet
        const mappedEvents = updatedAvailability.map((event) => ({
          id: event.id,
          title: event.Title || "Tillgänglig", // Använd en standardtitel om Title saknas
          isBooked: event.isBooked || false, // Ensure isBooked is correctly set
          start: new Date(event.startTime),
          end: new Date(event.endTime),
          appointmentId: event.appointmentId || null, // Ensure appointmentId is correctly set
        }));
  
        setEvents(mappedEvents); // Uppdatera events-tillståndet
        setIsModalOpen(false); // Stäng modalen
        setNewEvent({ title: '', start: '', end: '' }); // Återställ formuläret
      } catch (error) {
        console.error('Error creating availability:', error);
      }
    }
  };

  const handleUpdateEvent = async () => {
    if (selectedEvent) {
  
      const availability = {
        StartTime: selectedEvent.start,
        EndTime: selectedEvent.end,
        IsAvailable: true,
        Title: selectedEvent.title,
      };
  
      try {
        // Call the update API
        const updatedEvent = await updateAvailability(selectedEvent.id, availability);
  
        // Update the events state
        const updatedEvents = events.map((event) =>
          event.id === selectedEvent.id ? { ...event, ...selectedEvent } : event
        );
  
        setEvents(updatedEvents); // Update the events state
        setSelectedEvent(null); // Close the modal
      } catch (error) {
        console.error('Error updating availability:', error);
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        await deleteAvailability(selectedEvent.id);
        const updatedEvents = events.filter((event) => event.id !== selectedEvent.id);
        setEvents(updatedEvents);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error deleting availability:', error);
      }
    }
  };

  return (
    <>
      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Lägg till tillgänglighet</h3>
            <input
              type="text"
              placeholder="Titel"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <label className="block mb-2">Startdatum och tid:</label>
            <input
              type="datetime-local"
              value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => handleTimeChange('start', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              step="1800"
              min={moment(newEvent.start).startOf('day').hour(8).format('YYYY-MM-DDTHH:mm')}
              max={moment(newEvent.start).startOf('day').hour(16).format('YYYY-MM-DDTHH:mm')}
            />
            <input
              type="datetime-local"
              value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => handleTimeChange('end', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              step="1800"
              min={moment(newEvent.end).startOf('day').hour(8).format('YYYY-MM-DDTHH:mm')}
              max={moment(newEvent.end).startOf('day').hour(16).format('YYYY-MM-DDTHH:mm')}
            />
            {timeError && <p className="text-red-500 text-sm mb-4">{timeError}</p>}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Avbryt
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Lägg till
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
{selectedEvent && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      {selectedEvent.isBooked && selectedEvent.appointmentInfo ? (
        <>
          <h4 className="text-lg font-semibold mb-2">Bokad tid</h4>
          <p><strong>Patient:</strong> {selectedEvent.appointmentInfo.patient}</p>
          <p><strong>Vårdgivare:</strong> {selectedEvent.appointmentInfo.caregiver}</p>
          <p><strong>Starttid:</strong> {moment(selectedEvent.start).format('YYYY-MM-DD HH:mm')}</p>
          <p><strong>Sluttid:</strong> {moment(selectedEvent.end).format('YYYY-MM-DD HH:mm')}</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setSelectedEvent(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Stäng
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-xl font-bold mb-4">Ändra tillgänglighet</h3>
          <input
            type="text"
            value={selectedEvent.title}
            onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <label className="block mb-2">Startdatum och tid:</label>
          <input
            type="datetime-local"
            value={moment(selectedEvent.start).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setSelectedEvent({ ...selectedEvent, start: new Date(e.target.value) })}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            step="1800"
          />
          <label className="block mb-2">Slutdatum och tid:</label>
          <input
            type="datetime-local"
            value={moment(selectedEvent.end).format('YYYY-MM-DDTHH:mm')}
            onChange={(e) => setSelectedEvent({ ...selectedEvent, end: new Date(e.target.value) })}
            className="w-full p-2 border border-gray-300 rounded mb-4"
            step="1800"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setSelectedEvent(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Avbryt
            </button>
            <button
              onClick={handleDeleteEvent}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Ta bort
            </button>
            <button
              onClick={handleUpdateEvent}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Spara
            </button>
          </div>
        </>
      )}
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