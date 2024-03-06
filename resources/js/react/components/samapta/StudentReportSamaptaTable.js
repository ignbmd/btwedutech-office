import { PrimeReactProvider } from "primereact/api";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { DataTable } from "primereact/datatable";
import moment from "moment";
import ChartStudentSmapata from "./ChartStudentSamapta";
import {
  Button,
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import "primereact/resources/themes/lara-light-blue/theme.css";
import { useEffect, useState } from "react";
import { BarChart2, Download } from "react-feather";
import Select from "react-select";
import classnames from "classnames";

const StudentReportSamaptaTable = () => {
  const [data, setData] = useState([]);
  const [dataClass, setDataClass] = useState([]);
  const [dataWithNumbers, setDataWithNumbers] = useState([]);
  const [isChartModalOpen, setChartModalOpen] = useState(false);
  const sort = [
    { label: "Terbaru", value: "new" },
    { label: "Terlama", value: "old" },
  ];
  const [typeChart, setTypeChart] = useState("");
  const [headerTitle, setHeaderTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getStudent(getSmartBtwIdFromUrl());
        const id = data.record_classroom[0]?.classroom_id;
        const classData = await getClassroom(id);
        const dataWithNumbers = data.record_classroom.map((item, index) => ({
          ...item,
          no: index + 1,
        }));
        setDataClass(classData);
        setDataWithNumbers(dataWithNumbers);
        setData(data);
      } catch (error) {
        setData([]);
      }
    })();
  }, []);
  const getStudent = async (id) => {
    const response = await axios.get(
      `/api/samapta/students/student-by-smartbtw/${id}`
    );
    const data = response.data;
    return data ?? [];
  };
  const getClassroom = async (id) => {
    const response = await axios.get(
      `/api/samapta/students/classroom-by-id/${id}`
    );
    const data = response.data;
    return data ?? [];
  };
  const getSmartBtwIdFromUrl = () => {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const path = urlObject.pathname;
    const pathParts = path.split("/");
    const idFromUrl = pathParts[pathParts.length - 1];
    return idFromUrl;
  };

  const toggleChartModal = (value) => {
    const titleMap = {
      RUN: "Lari - 12 Menit",
      PUSH_UP: "Push Up",
      SIT_UP: "Sit Up",
    };

    const headerTitle = titleMap[value] || "Shuttle Run";

    setHeaderTitle(headerTitle);
    setTypeChart(value);
    setChartModalOpen(!isChartModalOpen);
  };
  const handleSortReport = (sortTerm) => {
    const sortedReport =
      sortTerm == "new"
        ? dataWithNumbers.sort(
            (a, b) =>
              new Date(b.implementation_date) - new Date(a.implementation_date)
          )
        : dataWithNumbers.sort(
            (a, b) =>
              new Date(a.implementation_date) - new Date(b.implementation_date)
          );
    const sortedReportWithNumber = sortedReport.map((report, index) => ({
      ...report,
      no: index + 1,
    }));
    setDataWithNumbers(sortedReportWithNumber);
  };
  const handleDownloadPdf = async () => {
    try {
      setIsLoading(true);
      const id = getSmartBtwIdFromUrl();
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
      setIsLoading(false);
    } catch (error) {
      console.error("Terjadi kesalahan saat mengunduh data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const headerGroup = (
    <ColumnGroup>
      <Row>
        <Column alignHeader="center" header="NO" rowSpan={3} />
        <Column alignHeader="center" header="TGL Pelaksanaan" rowSpan={3} />
        <Column alignHeader="center" header="Test A" colSpan={2} />
        <Column alignHeader="center" header="Test B" colSpan={6} />
        <Column alignHeader="center" header="Nilai" rowSpan={2} />
        <Column
          alignHeader="center"
          header="Nilai Akhir"
          rowSpan={3}
          colSpan={2}
        />
      </Row>
      <Row>
        <Column alignHeader="center" header="Lari 12 Menit" colSpan={2} />
        <Column alignHeader="center" header="Sit Up" colSpan={2} />
        <Column alignHeader="center" header="Push Up" colSpan={2} />
        {/* <Column alignHeader="center" header="Pull Up" colSpan={2} /> */}
        <Column alignHeader="center" header="Shuttle Run" colSpan={2} />
      </Row>
      <Row>
        <Column header="Jarak (Meter)" />
        <Column header="Nilai" />
        <Column header="Jumlah (Kali)" />
        <Column header="Nilai" />
        <Column header="Jumlah (Kali)" />
        {/* <Column header="Nilai" />
        <Column header="Jumlah (Kali)" /> */}
        <Column header="Nilai" />
        <Column header="Waktu (Detik)" />
        <Column header="Nilai" />
        <Column header="Nilai Rata-Rata" />
      </Row>
    </ColumnGroup>
  );
  return (
    <>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Col md="9" className="p-0">
            <h2 style={{ fontWeight: "bold" }}>
              {data?.record_classroom && data.record_classroom[0].name}
            </h2>
            <h3>
              {dataClass?.title} | {dataClass?.year}
            </h3>
          </Col>
          <Col md="3" className="d-flex justify-content-end">
            <Button
              color="primary"
              size="md"
              disabled={isLoading}
              onClick={() => handleDownloadPdf()}
            >
              {isLoading ? (
                <span>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    // aria-hidden={true}
                  />
                  &nbsp; Mendownload...
                </span>
              ) : (
                <>
                  <Download /> Unduh Rapor PDF
                </>
              )}
            </Button>
          </Col>
        </div>
        <h4 style={{ fontWeight: "bold" }}>
          Rata-rata Nilai Samapta & Grafik Perkembangan
        </h4>
        <div
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          }}
        >
          <div>
            <Card>
              <CardBody className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 style={{ fontWeight: "bold" }}>Lari 12 Menit</h5>
                    <h2 style={{ fontWeight: "bold" }}>
                      {data?.run?.mean_run} | {data?.run?.grade}
                    </h2>
                  </div>
                  <div>
                    <Button
                      color="outline-success"
                      size="sm"
                      onClick={() => toggleChartModal("RUN")}
                    >
                      <BarChart2 />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          <div>
            <Card>
              <CardBody className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 style={{ fontWeight: "bold" }}>Sit Up</h5>
                    <h2 style={{ fontWeight: "bold" }}>
                      {data?.sit_up?.mean_sit_up} | {data?.sit_up?.grade}
                    </h2>
                  </div>
                  <div>
                    <Button
                      color="outline-success"
                      size="sm"
                      onClick={() => toggleChartModal("SIT_UP")}
                    >
                      <BarChart2 />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          <div>
            <div>
              <Card>
                <CardBody className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 style={{ fontWeight: "bold" }}>Push Up</h5>
                      <h2 style={{ fontWeight: "bold" }}>
                        {data?.push_up?.mean_push_up} | {data?.push_up?.grade}
                      </h2>
                    </div>
                    <div>
                      <Button
                        color="outline-success"
                        size="sm"
                        onClick={() => toggleChartModal("PUSH_UP")}
                      >
                        <BarChart2 />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
          {/* <div>
            <Card>
              <CardBody className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 style={{ fontWeight: "bold" }}>Pull Up</h5>
                    <h2 style={{ fontWeight: "bold" }}>32 | D</h2>
                  </div>
                  <div>
                    <Button
                      color="outline-success"
                      size="sm"
                      onClick={toggleChartModal}
                    >
                      <BarChart2 />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div> */}
          <div>
            <Card>
              <CardBody className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 style={{ fontWeight: "bold" }}>Shuttle Run</h5>
                    <h2 style={{ fontWeight: "bold" }}>
                      {data?.shuttle?.mean_shuttle} | {data?.shuttle?.grade}
                    </h2>
                  </div>
                  <div>
                    <Button
                      color="outline-success"
                      size="sm"
                      onClick={() => toggleChartModal("SHUTTLE")}
                    >
                      <BarChart2 />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      <div className="d-flex align-items-center mb-2">
        <Col md="9" className="p-0">
          <h4 style={{ fontWeight: "bold" }}>Hasil Samapta Siswa</h4>
        </Col>
        <Col md="3" className="p-0">
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
            onChange={(e) => handleSortReport(e.value)}
            placeholder="Urutkan Berdasarkan"
          />
        </Col>
      </div>
      <Card>
        <PrimeReactProvider>
          <DataTable
            value={dataWithNumbers}
            dataKey="no"
            showGridlines
            scrollable
            tableStyle={{ minWidth: "50rem" }}
            paginator
            loading={false}
            rows={5}
            rowsPerPageOptions={[5, 10, 25, 50]}
            emptyMessage="Data tidak ditemukan"
            headerColumnGroup={headerGroup}
          >
            <Column field="no" header="NO" style={{ width: "3rem" }}></Column>
            <Column
              field="implementation_date"
              header="TGL PELAKSANAAN"
              body={(rowData) =>
                moment(rowData.implementation_date).format("DD MMMM YYYY")
              }
            ></Column>
            <Column
              field="range"
              header="JARAK (Meter)"
              body={(rowData) => {
                return <span>{rowData?.exercise_a?.r_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="score_run"
              header="NILAI"
              body={(rowData) => {
                return <span>{rowData?.exercise_a?.t_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="range"
              header="JUMLAH (Kali)"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[0]?.r_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="score_sit_up"
              header="NILAI"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[0]?.t_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="range"
              header="JUMLAH (Kali)"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[1]?.r_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="score_push_up"
              header="NILAI"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[1]?.t_score || 0}</span>;
              }}
            ></Column>
            {/* <Column field="range" header="JUMLAH (Kali)"></Column>
            <Column field="score_pull_up" header="NILAI"></Column> */}
            <Column
              field="range"
              header="WAKTU (DETIK)"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[2]?.r_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="score_shuttle_run"
              header="NILAI"
              body={(rowData) => {
                return <span>{rowData?.exercise_b[2]?.t_score || 0}</span>;
              }}
            ></Column>
            <Column
              field="average_test_b"
              header="Rata - Rata Test'B'"
              body={(rowData) => {
                return <span>{rowData?.mean_exercise_b || 0}</span>;
              }}
            ></Column>
            <Column
              field="final_score"
              header="NILAI AKHIR"
              body={(rowData) => {
                return <span>{rowData?.total_score?.score || 0}</span>;
              }}
            ></Column>
            <Column
              field="final_score_alphabet"
              header="NILAI AKHIR"
              body={(rowData) => {
                return <span>{rowData?.total_score?.grade || 0}</span>;
              }}
            ></Column>
          </DataTable>
        </PrimeReactProvider>
      </Card>
      <Modal
        isOpen={isChartModalOpen}
        toggle={toggleChartModal}
        centered
        size="lg"
      >
        <ModalBody>
          <div>
            <h3>Perkembangan Samapta - {headerTitle}</h3>
            <h5>
              Grafik Perkembangan berdasarkan 10 pelaksanaan SAMAPTA terakhir
            </h5>
            <Card>
              <CardBody>
                <ChartStudentSmapata
                  smartbtwId={getSmartBtwIdFromUrl()}
                  typeChart={typeChart}
                />
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="outline-primary" onClick={toggleChartModal}>
            Tutup
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
export default StudentReportSamaptaTable;
