import { Card, CardBody } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { FilterMatchMode, PrimeReactProvider } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { useState, useEffect, useContext } from "react";
import { Search } from "react-feather";
import moment from "moment-timezone";
import "primereact/resources/themes/lara-light-blue/theme.css";
import { StudentReportContext } from "../../../context/StudentReportContext";

const PTKStudentPrePostTestReportTable = () => {
  const { studentPrePostTestReportSummary } = useContext(StudentReportContext);
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

  const rowNumber = (rowData, field) => {
    return field.rowIndex + 1;
  };

  const formatPreTestDate = (rowData) => {
    return rowData?.pre_test?.date
      ? `${moment(rowData?.pre_test?.date)
          .utcOffset("+0700")
          .format("DD/MM/YYYY • HH:mm")} WIB`
      : "-";
  };

  const formatPostTestDate = (rowData) => {
    return rowData?.post_test?.date
      ? `${moment(rowData?.post_test?.date)
          .utcOffset("+0700")
          .format("DD/MM/YYYY • HH:mm")} WIB`
      : "-";
  };

  const preTestExamScore = (rowData) => {
    return (
      <div>
        {rowData?.pre_test?.score ?? "-"}{" "}
        <span style={{ color: "#98A2B3" }}>
          {" "}
          / {rowData?.pre_test?.max_score ?? "-"}
        </span>
      </div>
    );
  };

  const postTestExamScore = (rowData) => {
    return (
      <div>
        {rowData?.post_test?.score ?? "-"}{" "}
        <span style={{ color: "#98A2B3" }}>
          {" "}
          / {rowData?.post_test?.max_score ?? "-"}
        </span>
      </div>
    );
  };

  const headerColumnGroup = (
    <ColumnGroup>
      <Row>
        <Column header="No" rowSpan={2}></Column>
        <Column header="Materi" rowSpan={2}></Column>
        <Column header="Kategori Materi" rowSpan={2}></Column>
        <Column header="Pre Test" colSpan={2}></Column>
        <Column header="Post Test" colSpan={2}></Column>
      </Row>
      <Row>
        <Column header="Tanggal Dikerjakan"></Column>
        <Column header="Nilai"></Column>
        <Column header="Tanggal Dikerjakan"></Column>
        <Column header="Nilai"></Column>
      </Row>
    </ColumnGroup>
  );

  return (
    <Card>
      <CardBody>
        <PrimeReactProvider>
          <DataTable
            value={studentPrePostTestReportSummary?.data ?? []}
            dataKey="materi"
            scrollable
            scrollHeight="600px"
            showGridlines
            header={header}
            headerColumnGroup={headerColumnGroup}
            filters={filters}
            tableStyle={{ minWidth: "50rem" }}
            emptyMessage="Data tidak ditemukan"
            globalFilterFields={["category", "materi"]}
          >
            <Column body={rowNumber} header="No"></Column>
            <Column field="materi" header="Materi" sortable></Column>
            <Column field="category" header="Kategori Materi" sortable></Column>
            <Column
              body={formatPreTestDate}
              header="Tgl Dikerjakan"
              sortable
            ></Column>
            <Column body={preTestExamScore} header="Nilai" sortable></Column>
            <Column
              body={formatPostTestDate}
              header="Tgl Dikerjakan"
              sortable
            ></Column>
            <Column body={postTestExamScore} header="Nilai" sortable></Column>
          </DataTable>
        </PrimeReactProvider>
      </CardBody>
    </Card>
  );
};

export default PTKStudentPrePostTestReportTable;
