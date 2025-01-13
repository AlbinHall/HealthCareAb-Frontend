import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/sv";

const localizer = momentLocalizer(moment);

const timeFormats = {
  timeGutterFormat: "HH:mm",
  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
    `klockan ${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
      end,
      "HH:mm",
      culture
    )}`,
};

const MyCalendar = (props) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleMonthChange = (event) => {
    const selectedMonth = parseInt(event.target.value, 10);
    const newDate = moment(currentDate).month(selectedMonth).toDate();
    setCurrentDate(newDate);
  };

  const handleYearChange = (event) => {
    const selectedYear = parseInt(event.target.value, 10);
    const newDate = moment(currentDate).year(selectedYear).toDate();
    setCurrentDate(newDate);
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const monthOptions = moment.months().map((month, index) => ({
    value: index,
    label: month,
  }));

  const yearOptions = [];
  const currentYear = moment().year();
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    yearOptions.push({ value: year, label: year });
  }

  return (
    <div className="h-[800px] w-[80%] mx-auto">
      <div className="flex justify-between items-center mb-5">
        <div>
          <label htmlFor="month-select" className="mr-3">
            Välj månad:
          </label>
          <select
            id="month-select"
            value={moment(currentDate).month()}
            onChange={handleMonthChange}
            className="p-2 rounded border border-gray-300 mr-3"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <label htmlFor="year-select" className="mr-3">
            Välj år:
          </label>
          <select
            id="year-select"
            value={moment(currentDate).year()}
            onChange={handleYearChange}
            className="p-2 rounded border border-gray-300"
          >
            {yearOptions.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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
        onNavigate={handleNavigate}
        formats={timeFormats}
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 16, 0, 0)}
        date={currentDate}
        messages={{
          today: "Idag",
          previous: "Föregående",
          next: "Nästa",
          month: "Månad",
          week: "Vecka",
          day: "Dag",
          agenda: "Agenda",
          date: "Datum",
          time: "Tid",
          event: "Händelse",
        }}
        className="shadow-md rounded-lg"
      />
    </div>
  );
};

export default MyCalendar;