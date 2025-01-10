import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/sv";

const localizer = momentLocalizer(moment);

// Custom time formats
const timeFormats = {
  timeGutterFormat: "HH:mm", // Time in the gutter (left side)
  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
    `Time: ${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
      end,
      "HH:mm",
      culture
    )}`, // Event time range
};

const MyCalendar = (props) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // State to control the current date of the calendar

  // Function to handle month change from the dropdown
  const handleMonthChange = (event) => {
    const selectedMonth = parseInt(event.target.value, 10); // Get the selected month (0-11)
    const newDate = moment(currentDate).month(selectedMonth).toDate(); // Update the current date with the selected month
    setCurrentDate(newDate);
  };

  // Function to handle year change from the dropdown
  const handleYearChange = (event) => {
    const selectedYear = parseInt(event.target.value, 10); // Get the selected year
    const newDate = moment(currentDate).year(selectedYear).toDate(); // Update the current date with the selected year
    setCurrentDate(newDate);
  };

  // Function to handle navigation (e.g., next, previous)
  const handleNavigate = (newDate) => {
    setCurrentDate(newDate); // Update the current date when navigating
  };

  // Generate month options for the dropdown
  const monthOptions = moment.months().map((month, index) => ({
    value: index,
    label: month,
  }));

  // Generate year options for the dropdown (e.g., from 2020 to 2030)
  const yearOptions = [];
  const currentYear = moment().year();
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    yearOptions.push({ value: year, label: year });
  }

  return (
    <div style={{ height: "800px", width: "80%", margin: "0 auto" }}>
      {/* Header with Dropdowns and Log Out Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <label htmlFor="month-select" style={{ marginRight: "10px" }}>
            Välj månad:{" "}
          </label>
          <select
            id="month-select"
            value={moment(currentDate).month()} // Set the selected month based on currentDate
            onChange={handleMonthChange}
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginRight: "10px",
            }}
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <label htmlFor="year-select" style={{ marginRight: "10px" }}>
            Välj år:{" "}
          </label>
          <select
            id="year-select"
            value={moment(currentDate).year()} // Set the selected year based on currentDate
            onChange={handleYearChange}
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            {yearOptions.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Component */}
      <Calendar
        localizer={localizer}
        selectable={props.selectable}
        onSelectSlot={props.onSelectSlot}
        onSelectEvent={props.onSelectEvent}
        eventPropGetter={props.eventPropGetter}
        events={props.events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={["week", "day"]}
        onNavigate={handleNavigate} // Handle navigation (next, previous)
        formats={timeFormats} // Use custom time formats
        min={new Date(0, 0, 0, 8, 0, 0)} // Set minimum time to 08:00
        max={new Date(0, 0, 0, 16, 0, 0)} // Set maximum time to 16:00
        date={currentDate} // Control the currently displayed date
        messages={{
          today: "Today",
          previous: "Previous",
          next: "Next",
          month: "Month",
          week: "Week",
          day: "Day",
          agenda: "Agenda",
          date: "Date",
          time: "Time",
          event: "Händelse",
        }} // Customize calendar messages in Swedish
      />
    </div>
  );
};

export default MyCalendar;
