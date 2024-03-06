import React, { createContext, useEffect, useReducer, useState } from "react";
import {
  calenderReducer,
  initialState,
  FETCH_EVENTS,
  SELECT_EVENT,
  UPDATE_ALL_FILTERS,
  UPDATE_FILTERS,
  ADD_EVENT,
  UPDATE_EVENT,
  REMOVE_EVENT,
  UPDATE_ALL_CALENDARS,
  REFRESH_FILTERED_EVENTS,
} from "../reducers/scheduleCalendarReducer";
import axios from "axios";

export const CalendarContext = createContext({
  calendar: {},
  addSidebarOpen: false,
  leftSidebarOpen: false,
  addEvent: () => {},
  updateEvent: () => {},
  removeEvent: () => {},
  fetchEvents: () => {},
  selectEvent: () => {},
  updateFilter: () => {},
  toggleSidebar: () => {},
  updateAllFilters: () => {},
  handleAddEventSidebar: () => {},
});

const CalendarContextProvider = (props) => {
  const [addSidebarOpen, setAddSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [calendarState, dispatch] = useReducer(calenderReducer, initialState);

  const handleAddEventSidebar = () => setAddSidebarOpen(!addSidebarOpen);

  const toggleSidebar = (val) => setLeftSidebarOpen(val);

  const getClassroomId = () => {
    const url = window.location.href;
    const splitted = url.split("/");
    return splitted[splitted.length - 1];
  };

  const fetchEvents = async () => {
    const response = axios.get("/api/learning/schedule/calendar", {
      params: { classroom_id: getClassroomId() },
    });
    const schedules = await (await response).data;
    const formatted = schedules.map((event) => ({
      ...event,
      id: event._id,
      title: event.title,
      start: event.start_date,
      end: event.end_date,
      allDay: false,
      extendedProps: { calendar: event.teacher_name },
    }));

    // Set Teachers
    const teachers = [
      ...new Set(formatted.map((v) => v.extendedProps.calendar)),
    ];
    updateAllCalendars(teachers);
    updateAllFilters(true);
    const selectedEvents = formatted.filter((event) => {
      return teachers.includes(event.extendedProps.calendar);
    });
    dispatch({
      type: FETCH_EVENTS,
      events: selectedEvents,
    });
    refreshFilteredEvent();
  };

  const getRandomColor = () => {
    const colors = ["success", "danger", "primary", "warning"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const addEvent = (event) => {
    dispatch({
      type: ADD_EVENT,
      event,
    });
  };

  const updateEvent = (updatedEvent) => {
    dispatch({
      type: UPDATE_EVENT,
      event: updatedEvent,
    });
  };

  const refreshFilteredEvent = () => {
    dispatch({ type: REFRESH_FILTERED_EVENTS });
  };

  const selectEvent = (event) => {
    dispatch({
      type: SELECT_EVENT,
      event,
    });
  };

  const updateFilter = (filter) => {
    dispatch({
      type: UPDATE_FILTERS,
      filter,
    });
  };

  const updateAllCalendars = (value) => {
    dispatch({
      type: UPDATE_ALL_CALENDARS,
      value,
    });
  };

  const updateAllFilters = (value) => {
    dispatch({
      type: UPDATE_ALL_FILTERS,
      value,
    });
  };

  // ** remove Event
  const removeEvent = (id) => {
    dispatch({
      type: REMOVE_EVENT,
      id,
    });
  };

  return (
    <CalendarContext.Provider
      value={{
        calendar: calendarState,
        addSidebarOpen,
        leftSidebarOpen,

        addEvent,
        updateEvent,
        removeEvent,
        fetchEvents,
        selectEvent,
        updateFilter,
        toggleSidebar,
        updateAllFilters,
        updateAllCalendars,
        handleAddEventSidebar,
        getRandomColor,
        refreshFilteredEvent,
      }}
    >
      {props.children}
    </CalendarContext.Provider>
  );
};

export default CalendarContextProvider;
