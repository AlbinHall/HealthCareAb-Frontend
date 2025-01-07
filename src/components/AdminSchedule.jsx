import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import MyCalendar from './Calendar';
import axios from "axios";
import { Calendar } from "react-big-calendar";
import moment from "moment";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createAvailability = async (availability) => {
  const response = await axios.post(`${API_BASE_URL}/availability`, availability, {
    withCredentials: true,
  });
  return response.data;
};

function AdminSchedule() {
  const navigate = useNavigate();
  const { authState, setAuthState } = useAuth();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', isSick: false });
  const [timeError, setTimeError] = useState(''); // State for time validation error



  // Function to round time to the nearest 30-minute interval
  const roundToNearest30Minutes = (date) => {
    const minutes = moment(date).minutes();
    const roundedMinutes = minutes < 30 ? 0 : 30;
    return moment(date).minutes(roundedMinutes).seconds(0).toDate();
  };



  // Function to remove events outside 08:00 - 16:00 for each day
  const removeEventsOutsideRange = (events, startDate, endDate) => {
    return events.filter((event) => {
      const eventStart = moment(event.start);
      const eventEnd = moment(event.end);

      // Check if the event is within the allowed time range (08:00 - 16:00) for each day
      const isWithinTimeRange =
        eventStart.hour() >= 8 &&
        eventEnd.hour() <= 16 &&
        eventStart.minute() >= 0 &&
        eventEnd.minute() <= 0;

      // Check if the event is within the selected date range
      const isWithinDateRange =
        eventStart.isBetween(startDate, endDate, null, '[]') ||
        eventEnd.isBetween(startDate, endDate, null, '[]');

      return !(isWithinDateRange && !isWithinTimeRange);
    });
  };



  // Function to split a long event into 30-minute intervals
  const splitEventIntoIntervals = (event) => {
    const { title, start, end, isSick } = event;
    const intervals = [];
    let currentStart = moment(start);

    while (currentStart.isBefore(end)) {
      const currentEnd = moment(currentStart).add(30, 'minutes');
      intervals.push({
        id: intervals.length + 1,
        title,
        start: currentStart.toDate(),
        end: currentEnd.toDate(),
        isSick,
      });
      currentStart = currentEnd;
    }

    return intervals;
  };



  // Custom event style based on isSick
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.isSick ? 'red' : '#3174ad', // Red if sick, default blue otherwise
      borderRadius: '5px',
      color: 'white',
      border: 'none',
    };
    return {
      style,
    };
  };



  // Function to handle time input change and enforce 30-minute intervals
  const handleTimeChange = (field, value) => {
    const date = moment(value);
    const minutes = date.minutes();
    const hour = date.hour();

    // Validate 30-minute intervals
    if (minutes % 30 !== 0) {
      setTimeError('Vänligen välj en tid i 30-minutersintervall (t.ex., 09:00 eller 09:30).');
      return;
    }

    // Validate time range (08:00 - 16:00)
    if (hour < 8 || hour > 16) {
      setTimeError('Tiden måste vara mellan 08:00 och 16:00.');
      return;
    }

    setTimeError(''); // Clear error if time is valid
    setNewEvent((prev) => ({ ...prev, [field]: date.toDate() }));
  };



  const handleSelectSlot = ({ start, end }) => {
    const adjustedStart = roundToNearest30Minutes(start); // Round start time
    const adjustedEnd = roundToNearest30Minutes(end); // Round end time
  
    // Check if the selected time slot is within the allowed range (08:00 - 16:00)
    const startHour = moment(adjustedStart).hour();
    const endHour = moment(adjustedEnd).hour();
  
    if (startHour < 8 || endHour > 16) {
      setTimeError('Tiden måste vara mellan 08:00 och 16:00.');
      return;
    }
  
    setNewEvent({ title: '', start: adjustedStart, end: adjustedEnd, isSick: false });
    setIsModalOpen(true);
    setTimeError(''); // Reset time error
  };



  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      const startHour = moment(newEvent.start).hour();
      const endHour = moment(newEvent.end).hour();

      // Validate time range
      if (startHour < 8 || endHour > 16) {
        setTimeError('Tiden måste vara mellan 08:00 och 16:00.');
        return;
      }

      const splitEvents = splitEventIntoIntervals(newEvent); // Split the event into 30-minute intervals

      // Remove events outside 08:00 - 16:00 for each day in the selected range
      const updatedEvents = removeEventsOutsideRange(
        events,
        moment(newEvent.start).startOf('day'),
        moment(newEvent.end).endOf('day')
      );

      setEvents([...updatedEvents, ...splitEvents]); // Add all intervals to the events list

      // Send availability to the backend
      try {
        const availability = {
          StartTime: newEvent.start,
          EndTime: newEvent.end,
          IsAvailable: true, // Assuming the event is for availability
        };
        await createAvailability(availability);
      } catch (error) {
        console.error('Error creating availability:', error);
      }

      setIsModalOpen(false);
      setNewEvent({ title: '', start: '', end: '', isSick: false });
    }
  };


  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };



  const handleUpdateEvent = (updatedEvent) => {
    setEvents(events.map((ev) => (ev.id === updatedEvent.id ? updatedEvent : ev)));
    setSelectedEvent(null);
  };



  const handleDeleteEvent = () => {
    setEvents(events.filter((ev) => ev.id !== selectedEvent.id));
    setSelectedEvent(null);
  };



  return (
    <>
      {/* Modal för att lägga till nytt event */}
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
              step="1800" // Restrict input to 30-minute intervals
              min={moment(newEvent.start).startOf('day').hour(8).format('YYYY-MM-DDTHH:mm')} // Minimum time: 08:00
              max={moment(newEvent.start).startOf('day').hour(16).format('YYYY-MM-DDTHH:mm')} // Maximum time: 16:00
            />
            <input
              type="datetime-local"
              value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => handleTimeChange('end', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              step="1800" // Restrict input to 30-minute intervals
              min={moment(newEvent.end).startOf('day').hour(8).format('YYYY-MM-DDTHH:mm')} // Minimum time: 08:00
              max={moment(newEvent.end).startOf('day').hour(16).format('YYYY-MM-DDTHH:mm')} // Maximum time: 16:00
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

      {/* Modal för att redigera event */}
      {selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Ändra tillgänglighet</h3>
            <input
              type="text"
              value={selectedEvent.title}
              onChange={(e) =>
                setSelectedEvent({ ...selectedEvent, title: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <label className="block mb-2">Startdatum och tid:</label>
            <input
              type="datetime-local"
              value={moment(selectedEvent.start).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => {
                const newStart = new Date(e.target.value);
                setSelectedEvent({ ...selectedEvent, start: newStart });
              }}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              step="1800" // Restrict input to 30-minute intervals
            />
            <label className="block mb-2">Slutdatum och tid:</label>
            <input
              type="datetime-local"
              value={moment(selectedEvent.end).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => {
                const newEnd = new Date(e.target.value);
                setSelectedEvent({ ...selectedEvent, end: newEnd });
              }}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              step="1800" // Restrict input to 30-minute intervals
            />
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={selectedEvent.isSick || false}
                onChange={(e) =>
                  setSelectedEvent({ ...selectedEvent, isSick: e.target.checked })
                }
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
                onClick={() => handleUpdateEvent(selectedEvent)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Spara
              </button>
            </div>
          </div>
        </div>
      )}



      <MyCalendar
        selectable={true} // Alla användare kan välja tidsluckor
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        events={events}
      />
    </>
  );
}

export default AdminSchedule;