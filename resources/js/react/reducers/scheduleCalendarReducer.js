export const FETCH_EVENTS = "FETCH_EVENTS";
export const ADD_EVENT = "ADD_EVENT";
export const UPDATE_EVENT = "UPDATE_EVENT";
export const REMOVE_EVENT = "REMOVE_EVENT";
export const UPDATE_FILTERS = "UPDATE_FILTERS";
export const UPDATE_ALL_FILTERS = "UPDATE_ALL_FILTERS";
export const UPDATE_ALL_CALENDARS = "UPDATE_ALL_CALENDARS";
export const SELECT_EVENT = "SELECT_EVENT";
export const REFRESH_FILTERED_EVENTS = "REFRESH_FILTERED_EVENTS";

export const initialState = {
  events: [],
  filteredEvents: [],
  selectedEvent: {},
  selectedCalendars: [],
  allCalendars: [],
};

export const calenderReducer = (state, action) => {
  let updatedEvents;

  switch (action.type) {
    case FETCH_EVENTS:
      return { ...state, events: action.events };

    case REFRESH_FILTERED_EVENTS:
      const filteredEvents = [...state.events].filter((event) =>
        state.selectedCalendars.includes(event.extendedProps.calendar)
      );
      return { ...state, filteredEvents };

    case ADD_EVENT:
      updatedEvents = [...state.events];
      const { length } = updatedEvents;
      let lastIndex = 0;
      if (length) {
        lastIndex = updatedEvents[length - 1].id;
      }
      action.event.id = lastIndex + 1;
      updatedEvents.push(action.event);

      return { ...state, events: updatedEvents };
    case UPDATE_EVENT:
      const { event: eventData } = action;
      eventData.id = Number(eventData.id);

      updatedEvents = [...state.events];
      const event = updatedEvents.find((ev) => ev.id === Number(eventData.id));
      Object.assign(event, eventData);

      return { ...state, events: updatedEvents };
    case REMOVE_EVENT:
      let { id } = action;
      const eventId = Number(id);

      updatedEvents = [...state.events];
      const eventIndex = updatedEvents.findIndex((ev) => ev.id === eventId);
      updatedEvents.splice(eventIndex, 1);

      return { ...state, events: updatedEvents };

    case UPDATE_FILTERS:
      let result = [];
      const current = state.selectedCalendars.find((v) => v == action.filter);
      if (!current) {
        result = [...state.selectedCalendars, action.filter];
      } else {
        result = state.selectedCalendars.filter((v) => v != action.filter);
      }
      return { ...state, selectedCalendars: result };

    case UPDATE_ALL_FILTERS:
      const value = action.value;
      let selected = [];
      if (value === true) {
        selected = state.allCalendars;
      } else {
        selected = [];
      }
      return { ...state, selectedCalendars: selected };

    case UPDATE_ALL_CALENDARS:
      const allCalendars = Array.isArray(action.value) ? [...action.value] : [];
      return { ...state, allCalendars };

    case SELECT_EVENT:
      return { ...state, selectedEvent: action.event };
    default:
      return state;
  }
};
