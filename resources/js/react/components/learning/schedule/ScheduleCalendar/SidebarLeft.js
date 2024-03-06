import classnames from "classnames";
import { Fragment, useContext, useEffect, useState } from "react";
import { CardBody, Button, CustomInput } from "reactstrap";

import { Plus } from "react-feather";
// ** illustration import
import { CalendarContext } from "../../../../context/CalendarContext";
import illustration from "../../../../assets/images/calendar-illustration.png";

// ** Filters Checkbox Array
const SidebarLeft = ({ calendarsColor }) => {
  const { calendar, updateFilter, updateAllFilters, refreshFilteredEvent } =
    useContext(CalendarContext);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    const options = Object.entries({ ...calendarsColor }).map(([k, v]) => ({
      label: k,
      value: k,
      color: v,
    }));
    setFilters([...options]);
  }, [calendarsColor]);

  return (
    <Fragment>
      <div className="sidebar-wrapper">
        <CardBody>
          <h5 className="section-label mb-1">
            <span className="align-middle">Pengajar</span>
          </h5>
          <CustomInput
            type="checkbox"
            className="mb-1"
            label="Lihat Semua"
            id="view-all"
            checked={calendar.selectedCalendars.length == filters.length}
            onChange={(e) => {
              updateAllFilters(e.target.checked);
              refreshFilteredEvent();
            }}
          />
          <div className="calendar-events-filter">
            {(filters ?? []).map((filter, i) => {
              return (
                <CustomInput
                  type="checkbox"
                  key={i}
                  id={filter.label}
                  label={filter.label}
                  checked={calendar.selectedCalendars.includes(filter.label)}
                  className={`custom-control-${filter.color}`}
                  onChange={(e) => {
                    updateFilter(filter.label);
                    refreshFilteredEvent();
                  }}
                />
              );
            })}
          </div>
        </CardBody>
      </div>
      <div className="mt-auto">
        <img className="img-fluid" src={illustration} alt="illustration" />
      </div>
    </Fragment>
  );
};

export default SidebarLeft;
