// ** React Import
import { useEffect, useRef, memo, useContext } from "react";
import { Menu } from "react-feather";

// ** Full Calendar & it's Plugins
import FullCalendar from "@fullcalendar/react";
import listPlugin from "@fullcalendar/list";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// ** Third Party Components
import "./Calendar.css";
import { Card, CardBody } from "reactstrap";
import { CalendarContext } from "../../../../context/CalendarContext";

const Calendar = (props) => {
  const calendarRef = useRef(null);

  const {
    calendarsColor,
    calendarApi,
    setCalendarApi,
    blankEvent,
    selectEvent,
  } = props;

  const { calendar, toggleSidebar, handleAddEventSidebar } =
    useContext(CalendarContext);

  // ** UseEffect checks for CalendarAPI Update
  useEffect(() => {
    if (calendarApi === null) {
      setCalendarApi(calendarRef.current.getApi());
    }
  }, [calendarApi]);

  // ** calendarOptions(Props)
  const calendarOptions = {
    events: calendar.filteredEvents.length ? calendar.filteredEvents : [],
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: "dayGridMonth",
    headerToolbar: {
      start: "sidebarToggle, prev,next, title",
      end: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
    },
    eventResizableFromStart: true,
    dragScroll: true,
    dayMaxEvents: 2,
    navLinks: true,
    eventClassNames({ event: calendarEvent }) {
      // eslint-disable-next-line no-underscore-dangle
      const colorName =
        calendarsColor[calendarEvent._def.extendedProps.calendar];
      return [`bg-light-${colorName}`];
    },

    eventClick({ event: clickedEvent }) {
      selectEvent(clickedEvent);
      handleAddEventSidebar();

      // * Only grab required field otherwise it goes in infinity loop
      // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
      // event.value = grabEventDataFromEventApi(clickedEvent)

      // eslint-disable-next-line no-use-before-define
      // isAddNewEventSidebarActive.value = true
    },

    customButtons: {
      sidebarToggle: {
        text: <Menu className="d-xl-none d-block" />,
        click() {
          toggleSidebar(true);
        },
      },
    },

    dateClick(info) {
      const ev = blankEvent;
      ev.start = info.date;
      ev.end = info.date;
      selectEvent(ev);
      handleAddEventSidebar();
    },
    ref: calendarRef,
  };

  return (
    <Card className="shadow-none border-0 mb-0 rounded-0">
      <CardBody className="pb-0">
        <FullCalendar {...calendarOptions} />{" "}
      </CardBody>
    </Card>
  );
};

export default memo(Calendar);
