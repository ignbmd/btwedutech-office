// ** React Imports
import React, { Fragment, useState, useEffect, useContext } from "react";

// ** Third Party Components
import classnames from "classnames";
import { Row, Col } from "reactstrap";

// ** Calendar App Component Imports
import Calendar from "./Calendar";
import SidebarLeft from "./SidebarLeft";
import { CalendarContext } from "../../../../context/CalendarContext";
import AddEventSidebar from "./AddEventSidebar";
import {
  getUserAllowedRoleFromBlade,
  getUserFromBlade,
} from "../../../../utility/Utils";

const ScheduleCalendar = () => {
  const [calendarApi, setCalendarApi] = useState(null);
  const {
    calendar,
    toggleSidebar,
    leftSidebarOpen,
    selectEvent,
    fetchEvents,
    getRandomColor,
  } = useContext(CalendarContext);
  const [calendarsColor, setCalendarsColor] = useState([]);
  const [userRole] = useState(getUserAllowedRoleFromBlade());
  const [user] = useState(getUserFromBlade());

  // ** Blank Event Object
  const blankEvent = {
    title: "",
    start: "",
    end: "",
    allDay: false,
    url: "",
    extendedProps: {
      calendar: "",
    },
  };

  // ** refetchEvents
  const refetchEvents = () => {
    if (calendarApi !== null) {
      calendarApi.refetchEvents();
    }
  };

  useEffect(() => {
    fetchEvents(calendar.selectedCalendars);
    if (isMentor()) toggleSidebar(false);
  }, []);

  useEffect(() => {
    let colors = {};
    calendar.allCalendars.forEach((v) => {
      colors[v] = getRandomColor();
    });
    setCalendarsColor(colors);
  }, [calendar.allCalendars]);

  const isMentor = () => {
    return user?.roles?.includes("mentor");
  };

  return (
    <Fragment>
      <div className="app-calendar overflow-hidden border mb-0">
        <Row noGutters>
          {!isMentor() && (
            <Col
              id="app-calendar-sidebar"
              className={classnames(
                "col app-calendar-sidebar flex-grow-0 overflow-hidden d-flex flex-column",
                {
                  show: leftSidebarOpen,
                }
              )}
            >
              <SidebarLeft calendarsColor={calendarsColor} />
            </Col>
          )}
          <Col className="position-relative">
            <Calendar
              blankEvent={blankEvent}
              calendarApi={calendarApi}
              selectEvent={selectEvent}
              calendarsColor={calendarsColor}
              setCalendarApi={setCalendarApi}
            />
          </Col>
          <div
            className={classnames("body-content-overlay", {
              show: leftSidebarOpen === true,
            })}
            onClick={() => toggleSidebar(false)}
          ></div>
        </Row>
      </div>
      {["*", "create", "edit"].some((r) => userRole.includes(r)) && (
        <AddEventSidebar
          calendarStore={calendar}
          selectEvent={selectEvent}
          calendarApi={calendarApi}
          refetchEvents={refetchEvents}
          calendarsColor={calendarsColor}
        />
      )}
    </Fragment>
  );
};

export default React.memo(ScheduleCalendar);
