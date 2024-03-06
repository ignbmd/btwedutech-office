import React, { createContext, useEffect, useState, useMemo } from "react";
import {
  Card,
  Col,
  Input,
  Label,
  Row,
  Button,
  Badge,
  CardBody,
} from "reactstrap";
import Select from "react-select";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import "primereact/resources/themes/lara-light-indigo/theme.css"; // theme
import { FilterMatchMode, PrimeReactProvider } from "primereact/api";
import { Download, Plus } from "react-feather";
import classnames from "classnames";

const sort = [
  { label: "Siswa Laki-Laki", value: "1" },
  { label: "Siswa Perempuan", value: "0" },
];

const StudentListTable = () => {
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [selectedRow, setSelectedRow] = useState([]);
  const [selectedSort, setSelectedSort] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [isLoadingPDFBulk, setIsLoadingPDFBulk] = useState(false);
  const [clickedRowId, setClickedRowId] = useState(null);

  useEffect(() => {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const path = urlObject.pathname;
    const pathParts = path.split("/");
    const idFromUrl = pathParts[pathParts.length - 1];
    (async () => {
      try {
        const data = await getStudentBySessionId(idFromUrl);
        const dataWithNumber = data.map((item, index) => ({
          no: index + 1,
          ...item,
        }));
        setData(dataWithNumber);
      } catch (error) {
        setData([]);
      }
    })();
  }, []);

  useEffect(() => {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const path = urlObject.pathname;
    const pathParts = path.split("/");
    const idFromUrl = pathParts[pathParts.length - 1];

    (async () => {
      try {
        setIsLoading(true);
        const data = await getStudentBySessionId(idFromUrl);

        // Apply gender filter if selectedSort is present
        const filteredData = selectedSort
          ? data.filter((item) => item.gender.toString() === selectedSort.value)
          : data;

        const dataWithNumber = filteredData.map((item, index) => ({
          no: index + 1,
          ...item,
        }));
        setIsLoading(false);
        setData(dataWithNumber);
      } catch (error) {
        setData([]);
      }
    })();
  }, [selectedSort]);

  const getStudentBySessionId = async (id) => {
    const response = await axios.get(`/api/samapta/students/classroom/${id}`);
    const data = response.data;
    return data ?? [];
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const handleStudentReport = (rowData) => {
    const id = rowData.smartbtw_id;
    window.location.href = `/samapta/rapor-siswa/${id}`;
  };

  const downloadPDF = async (rowData) => {
    const id = rowData.smartbtw_id;
    try {
      setIsLoadingPDF(true);
      setClickedRowId(id);
      const response = await axios.post(
        `/api/samapta/students/download-student-ranking/${id}`
      );

      const data = response?.data;
      const linkDownload = data?.data?.link;

      if (linkDownload) {
        const downloadLink = document.createElement("a");
        downloadLink.href = linkDownload;
        downloadLink.style.display = "none";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        console.error("Link download tidak ditemukan.");
      }
      setIsLoadingPDF(false);
      setClickedRowId(id);
    } catch (error) {
      console.error("Terjadi kesalahan saat mengunduh data:", error);
    } finally {
      setIsLoadingPDF(false);
      setClickedRowId(id);
    }
  };

  const handleDownloadPDF = async () => {
    const selectedIds = selectedRow.map((row) => row.smartbtw_id);
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const path = urlObject.pathname;
    const pathParts = path.split("/");
    const idFromUrl = pathParts[pathParts.length - 1];

    try {
      setIsLoadingPDFBulk(true);
      const response = await axios.post(
        `/api/samapta/students/download-student-ranking-bulk/${idFromUrl}`,
        {
          selectedIds: selectedIds,
        },
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        response?.headers["x-file-name"] ?? "report-zip.zip"
      ); //or any other extension
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
      setIsLoadingPDFBulk(false);
    } catch (error) {
      setIsLoadingPDFBulk(false);
      console.error("Terjadi kesalahan:", error);
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <>
        <Button
          color="outline-primary"
          disabled={isLoadingPDF}
          onClick={() => {
            downloadPDF(rowData);
          }}
        >
          {isLoadingPDF && clickedRowId === rowData.smartbtw_id ? (
            <span>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
              />
              &nbsp; Mendownload...
            </span>
          ) : (
            <>
              <Download size={14} />
            </>
          )}
        </Button>
        <Button
          color="primary"
          style={{ marginLeft: "5px" }}
          onClick={() => {
            handleStudentReport(rowData);
          }}
        >
          Detail
        </Button>
      </>
    );
  };

  return (
    <>
      <div className="d-flex align-items-center">
        <Col md="8" sm="12" className="d-flex align-items-center p-0">
          <div>
            {/* <h2>Daftar Siswa Samapta</h2> */}
            <h4>SAMAPTA - PERGURUAN TINGGI KEDINASAN (PTK)</h4>
          </div>
        </Col>
      </div>
      <div className="d-flex align-items-center mt-2">
        <Col
          className="d-flex align-items-center justify-content-start mb-75 p-0"
          md="12"
          sm="12"
        >
          {/* Search Input */}
          <Input
            className="dataTable-filter"
            type="text"
            id="search-input"
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Cari Siswa"
          />

          {/* Select Input */}
          <Col md="3" sm="12" className="d-flex align-items-center">
            <Select
              options={sort}
              classNamePrefix="select"
              className={classnames("react-select w-100", {})}
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
                control: (provided) => ({
                  ...provided,
                  background: "transparent",
                  border: "1px solid #ccc",
                }),
              }}
              isClearable
              placeholder="Urutkan Berdasarkan"
              onChange={(selectedOption) => setSelectedSort(selectedOption)}
            />
          </Col>

          {/* Buttons */}
          <Col className="ml-auto d-flex justify-content-end p-0">
            {selectedRow.length > 0 && (
              <div className="d-flex align-items-center">
                <h5>{selectedRow.length} data dipilih</h5>
                <Button
                  color="primary"
                  size="md"
                  style={{ marginLeft: "15px" }}
                  disabled={isLoadingPDFBulk}
                  onClick={handleDownloadPDF}
                >
                  {isLoadingPDFBulk ? (
                    <span>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                      &nbsp; Mendownload...
                    </span>
                  ) : (
                    <>Unduh PDF</>
                  )}
                </Button>
              </div>
            )}
          </Col>
        </Col>
      </div>
      <div>
        <Card>
          <PrimeReactProvider>
            <DataTable
              value={data}
              dataKey="no"
              tableStyle={{ minWidth: "50rem" }}
              paginator
              loading={isLoading}
              rows={5}
              rowsPerPageOptions={[5, 10, 25, 50]}
              scrollable
              filters={filters}
              // filterDisplay="row"
              globalFilterFields={["name", "email"]}
              selection={selectedRow}
              showGridlines
              onSelectionChange={(e) => setSelectedRow(e.value)}
            >
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3rem" }}
              ></Column>
              <Column
                field="no"
                header="NO"
                key="no"
                headerStyle={{ width: "3rem" }}
              ></Column>
              <Column field="name" header="NAMA" key="name"></Column>
              <Column
                field="email"
                header="Email"
                key="Email"
                style={{ minWidth: "200px" }}
              ></Column>
              <Column
                field="gender"
                key="gender"
                header="Jenis Kelamin"
                body={(rowData) =>
                  rowData.gender === 1 ? "Laki - Laki" : "Perempuan"
                }
              ></Column>
              <Column
                hidden={selectedRow.length}
                field="Action"
                header="AKSI"
                key="action"
                body={(rowData) => actionBodyTemplate(rowData)}
              ></Column>
            </DataTable>
          </PrimeReactProvider>
        </Card>
      </div>
    </>
  );
};
export default StudentListTable;
