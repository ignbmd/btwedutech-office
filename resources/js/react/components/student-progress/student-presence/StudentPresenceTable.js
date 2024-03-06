import {
  Card,
  CardBody,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { FilterMatchMode, PrimeReactProvider } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Fragment, useState, useEffect, useContext } from "react";
import { Search } from "react-feather";

import "primereact/resources/themes/lara-light-blue/theme.css";
import moment from "moment-timezone";
import { StudentReportContext } from "../../../context/StudentReportContext";

const StudentPresenceTable = () => {
  const { studentPresenceSummary } = useContext(StudentReportContext);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-start align-items-center">
        <span className="p-input-icon-left">
          <Search size={14} className="ml-25" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Cari"
          />
        </span>
      </div>
    );
  };
  const header = renderHeader();
  const formatDateTemplate = (rowData) => {
    return `${moment(rowData.created_at)
      .utcOffset("+0700")
      .format("DD/MM/YYYY • HH:mm")} WIB`;
  };

  useEffect(() => {
    return () => {
      clearTimeout();
    };
  }, []);

  return (
    <Card>
      <CardBody>
        <PrimeReactProvider>
          <DataTable
            value={studentPresenceSummary?.absent_presences ?? []}
            dataKey="_id"
            scrollable
            scrollHeight="500px"
            showGridlines
            header={header}
            filters={filters}
            tableStyle={{ minWidth: "50rem" }}
            emptyMessage="Data tidak ditemukan"
            globalFilterFields={[
              "schedule_topic",
              "created_at",
              "created_by_name",
            ]}
          >
            <Column body={formatDateTemplate} header="Tanggal & Waktu"></Column>
            <Column field="schedule_topic" header="Materi" sortable></Column>
            <Column
              field="created_by_name"
              header="Penanggung Jawab"
              sortable
            ></Column>
          </DataTable>
        </PrimeReactProvider>
      </CardBody>
    </Card>
  );
};

export default StudentPresenceTable;
