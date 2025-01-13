import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/sv";

const localizer = momentLocalizer(moment);

const timeFormats = {
  timeGutterFormat: "HH:mm",
  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
    `Time: ${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
      end,
      "HH:mm",
      culture
    )}`,
};

const MyCalendar = (props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedWeek, setSelectedWeek] = useState(moment().week());

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

  const handleWeekChange = (event) => {
    const selectedWeek = parseInt(event.target.value, 10);
    const newDate = moment(currentDate).week(selectedWeek).toDate();
    setCurrentDate(newDate);
    setSelectedWeek(selectedWeek);
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

  const weekOptions = [];
  for (let week = 1; week <= 52; week++) {
    weekOptions.push({ value: week, label: `Week ${week}` });
  }

  // Update selectedWeek when currentDate changes
  useEffect(() => {
    setSelectedWeek(moment(currentDate).week());
  }, [currentDate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Attach the event listener
    window.addEventListener("resize", handleResize);

    // Call handleResize once to set the initial state
    handleResize();

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`${isMobile ? "h-[50%]" : "h-[729px]"} w-[80%] mx-auto mb-16`}>
      <div
        className={`flex ${
          isMobile ? "flex-col space-y-3" : "flex-row"
        } items-center mb-5`}
      >
        <div>
          <label htmlFor="year-select" className="mr-3">
            Choose year:
          </label>
          <select
            id="year-select"
            value={moment(currentDate).year()}
            onChange={handleYearChange}
            className="p-2 rounded border border-gray-300 mr-3"
          >
            {yearOptions.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month-select" className="mr-3">
            Choose month:
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
        </div>
        {isMobile && (
          <div>
            <label htmlFor="week-select" className="mr-3">
              Choose week:
            </label>
            <select
              id="week-select"
              value={selectedWeek}
              onChange={handleWeekChange}
              className="p-2 rounded border border-gray-300"
            >
              {weekOptions.map((week) => (
                <option key={week.value} value={week.value}>
                  {week.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Calendar
        key={isMobile ? "mobile" : "desktop"} // Force re-render when isMobile changes
        localizer={localizer}
        selectable={props.selectable}
        onSelectSlot={props.onSelectSlot}
        onSelectEvent={props.onSelectEvent}
        eventPropGetter={props.eventPropGetter}
        events={props.events}
        startAccessor="start"
        endAccessor="end"
        defaultView={isMobile ? "day" : "week"}
        views={isMobile ? ["day"] : ["week", "day"]}
        onNavigate={handleNavigate}
        formats={timeFormats}
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 16, 0, 0)}
        date={currentDate}
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
        }}
        className="shadow-md rounded-lg"
      />
    </div>
  );
};

export default MyCalendar;