import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import MyCalendar from './Calendar';
import axios from "axios";
import moment from "moment";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// API Functions
const createAvailability = async (availability) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/availability`, availability, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating availability:', error);
    throw error;
  }
};

const getAvailability = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/caretakeravailability/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
}

function AdminSchedule() {
  const { authState } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', isSick: false });
  const [timeError, setTimeError] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (authState.userId) {
        try {
          const availability = await getAvailability(authState.userId);
          console.log("Hämtad tillgänglighet:", availability); // Kontrollera datan
  
          // Mappa API-svaret till rätt format
          const mappedEvents = availability.map((event) => ({
            id: event.slotId, // Använd slotId som id
            title: "Tillgänglig", // Lägg till en titel
            start: new Date(event.startTime), // Använd startTime
            end: new Date(event.endTime), // Använd endTime
            isSick: false, // Standardvärde för isSick
          }));
  
          console.log("Mappade events:", mappedEvents); // Kontrollera mappningen
          setEvents(mappedEvents);
        } catch (error) {
          console.error('Error fetching availability:', error);
          setError('Kunde inte hämta tillgänglighet.');
        }
      }
    };
  
    fetchAvailability();
  }, [authState.userId]);

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

    setNewEvent({ title: '', start: adjustedStart, end: adjustedEnd, isSick: false });
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
        IsSick: newEvent.isSick,
      };
  
      try {
        // 1. Skapa event i backend
        const createdEvent = await createAvailability(availability);
        console.log("Skapad tillgänglighet:", createdEvent);
  
        // 2. Hämta den uppdaterade listan med events från backend
        const updatedAvailability = await getAvailability(authState.userId);
  
        // 3. Mappa och uppdatera events-tillståndet
        const mappedEvents = updatedAvailability.map((event) => ({
          id: event.slotId,
          title: event.Title || "Tillgänglig", // Använd en standardtitel om Title saknas
          start: new Date(event.startTime),
          end: new Date(event.endTime),
          isSick: event.IsSick || false, // Använd standardvärdet false om IsSick saknas
        }));
  
        setEvents(mappedEvents); // Uppdatera events-tillståndet
        setIsModalOpen(false); // Stäng modalen
        setNewEvent({ title: '', start: '', end: '', isSick: false }); // Återställ formuläret
      } catch (error) {
        console.error('Error creating availability:', error);
      }
    }
  };

  // Handle event update
  const handleUpdateEvent = async () => {
    if (selectedEvent) {
      const availability = {
        id: selectedEvent.id,
        StartTime: selectedEvent.start,
        EndTime: selectedEvent.end,
        IsAvailable: true,
        Title: selectedEvent.title,
        IsSick: selectedEvent.isSick,
      };

      try {
        await updateAvailability(availability);
        const updatedEvents = events.map((event) =>
          event.id === selectedEvent.id ? selectedEvent : event
        );
        setEvents(updatedEvents);
        setSelectedEvent(null);
      } catch (error) {
        console.error('Error updating availability:', error);
      }
    }
  };

  // Handle event deletion
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
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={selectedEvent.isSick || false}
                onChange={(e) => setSelectedEvent({ ...selectedEvent, isSick: e.target.checked })}
                className="mr-2"
              />
              <label>Markera som sjuk</label>
            </div>
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
          </div>
        </div>
      )}

      {/* Calendar Component */}
      <MyCalendar
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={(event) => setSelectedEvent(event)}
        events={events}
      />
    </>
  );
}

export default AdminSchedule;