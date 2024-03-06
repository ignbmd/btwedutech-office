import React, { createContext, useEffect, useState, useMemo } from "react";
import { Download } from "react-feather";
import { Card, Col, Input, Label, Row, Spinner } from "reactstrap";
import { Column } from "primereact/column";
import moment from "moment-timezone";
//
import { DataTable } from "primereact/datatable";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { FilterMatchMode } from "primereact/api";
import { showToast } from "../../utility/Utils";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const RankingContext = createContext();
const filters = [
  { label: "Nilai Terendah", value: "Nilai Terendah" },
  { label: "Nilai Tertinggi", value: "Nilai Tertinggi" },
  { label: "Nilai Tengah", value: "Nilai Tengah" },
];

const ptnRows = [
  <Column
    field="rank"
    header="Rank"
    frozen
    style={{ minWidth: "50px" }}
    key="rank"
  ></Column>,
  <Column
    field="name"
    header="Name"
    frozen
    style={{ minWidth: "200px" }}
    key="name"
  ></Column>,
  <Column
    field="last_ed_name"
    header="Asal Sekolah"
    key="last_ed_name"
    frozen
    style={{ minWidth: "200px" }}
    body={(rowData) => (
      <div>{rowData.last_ed_name ? rowData.last_ed_name : "-"}</div>
    )}
  ></Column>,
  <Column
    field="school_name"
    key="school_name"
    header="PTN Impian"
    body={(rowData) => (
      <div>
        {rowData.school_name && rowData.major_name
          ? `${rowData.school_name} | ${rowData.major_name}`
          : "-"}
      </div>
    )}
    frozen
    style={{ minWidth: "200px" }}
  ></Column>,
  <Column
    field="start"
    header="Mulai Mengerjakan"
    key="start"
    body={(rowData) =>
      moment(rowData.start).tz("Asia/Jakarta").format("DD/MM/YYYY - HH:mm")
    }
  ></Column>,
  <Column
    field="end"
    key="end"
    header="Selesai Mengerjakan"
    body={(rowData) =>
      moment(rowData.end).tz("Asia/Jakarta").format("DD/MM/YYYY - HH:mm")
    }
  ></Column>,
  <Column
    field="time_exam"
    header="Lama Mengerjakan"
    key="time_exam"
    body={(rowData) => {
      const startTime = moment(rowData.start);
      const endTime = moment(rowData.end);
      const duration = moment.duration(endTime.diff(startTime));

      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      return `${hours} jam ${minutes} menit ${seconds} detik`;
    }}
  ></Column>,
  <Column
    field="penalaran_umum"
    key="penalaran_umum"
    header="Nilai PU"
  ></Column>,
  <Column
    field="pengetahuan_umum"
    key="pengetahuan_umum"
    header="Nilai PPU"
  ></Column>,
  <Column
    field="pemahaman_bacaan"
    key="pemahaman_bacaan"
    header="Nilai PBM"
  ></Column>,
  <Column
    field="pengetahuan_kuantitatif"
    key="pengetahuan_kuantitatif"
    header="Nilai PK"
  ></Column>,
  <Column
    field="literasi_bahasa_indonesia"
    key="literasi_bahasa_indonesia"
    header="Nilai BIND"
  ></Column>,
  <Column
    field="literasi_bahasa_inggris"
    key="literasi_bahasa_inggris"
    header="Nilai BING"
  ></Column>,
  <Column
    field="penalaran_matematika"
    key="penalaran_matematika"
    header="Nilai PM"
  ></Column>,
  <Column field="total" key="total" header="Nilai UTBK"></Column>,
];

const ptkRows = [
  <Column
    field="rank"
    header="Rank"
    key="rank"
    style={{ minWidth: "20px" }}
    frozen
  ></Column>,
  <Column
    field="name"
    header="Name"
    key="name"
    style={{ minWidth: "200px" }}
    frozen
  ></Column>,
  <Column
    field="last_ed_name"
    key="last_ed_name"
    header="Asal Sekolah"
    style={{ minWidth: "200px" }}
    frozen
    body={(rowData) => (
      <div>{rowData.last_ed_name ? rowData.last_ed_name : "-"}</div>
    )}
  ></Column>,
  <Column
    field="school_name"
    header="Instansi Impian"
    key="school_name"
    frozen
    body={(rowData) => (
      <div>
        {rowData.school_name && rowData.major_name
          ? `${rowData.school_name} | ${rowData.major_name}`
          : "-"}
      </div>
    )}
  ></Column>,
  <Column
    field="start"
    header="Mulai Mengerjakan"
    key="start"
    body={(rowData) =>
      moment(rowData.start).tz("Asia/Jakarta").format("DD/MM/YYYY - HH:mm")
    }
  ></Column>,
  <Column
    field="end"
    key="end"
    header="Selesai Mengerjakan"
    body={(rowData) =>
      moment(rowData.end).tz("Asia/Jakarta").format("DD/MM/YYYY - HH:mm")
    }
  ></Column>,
  <Column
    field="time_exam"
    key="time_exam"
    header="Lama Mengerjakan"
    body={(rowData) => {
      const startTime = moment(rowData.start);
      const endTime = moment(rowData.end);
      const duration = moment.duration(endTime.diff(startTime));

      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      return `${hours} jam ${minutes} menit ${seconds} detik`;
    }}
  ></Column>,
  <Column field="twk" key="twk" header="Nilai TWK"></Column>,
  <Column field="tiu" key="tiu" header="Nilai TIU"></Column>,
  <Column field="tkp" key="tkp" header="Nilai TKP"></Column>,
  <Column field="total" key="total" header="Total Nilai"></Column>,
  <Column
    field="is_all_passed"
    header="Status"
    key="is_all_passed"
    alignFrozen="right"
    frozen
    body={(rowData) => {
      return rowData.is_all_passed == true ? "Lulus" : "Tidak Lulus";
    }}
  ></Column>,
];

const RankingTable = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState([]);
  const [UKAData, setUKAData] = useState([]);
  const [legacyTaskIds, setLegacyTaskIds] = useState("");
  const [isCalculated, setIsCalculated] = useState(false);
  const [tryoutCode, setTryoutCode] = useState("");
  const [programs, setPrograms] = useState("");
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  useEffect(() => {
    const currentUrl = window.location.href;
    const url = new URL(currentUrl);
    const program = url.pathname.split("/")[3];
    const legacyTaskId = url.pathname.split("/")[5];
    const tryoutCode = url.pathname.split("/")[7];
    setLegacyTaskIds(legacyTaskId);
    setPrograms(program);
    setTryoutCode(tryoutCode);
    (async () => {
      try {
        setIsLoading(true);
        const data = await getStudentRanking(program, legacyTaskId);
        setData(data);
        const singleData = await getSingleUkaList(program, legacyTaskId);
        setUKAData(singleData);
        setIsLoading(false);
      } catch (error) {
        setData([]);
        setIsLoading(false);
      }
    })();
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const getStudentRanking = async (programs, legacyTaskId) => {
    let program = programs;
    const taskId = legacyTaskId;
    if (program === "skd") {
      program = "ptk";
    } else if (program === "utbk") {
      program = "ptn";
    }
    const response = await axios.get(
      `/api/new-ranking/${program}/task-id/${taskId}`
    );
    const data = response.data;
    return data?.data?.ranking_data ?? [];
  };

  const getSingleUkaList = async (programs, legacyTaskId) => {
    let program = programs;
    const taskId = legacyTaskId;
    if (program === "skd") {
      program = "ptk";
    } else if (program === "utbk") {
      program = "ptn";
    }
    const response = await axios.get(
      `/api/new-ranking/get-uka-by/${program}/task-id/${taskId}`
    );
    const data = response.data;
    return data?.data ?? [];
  };

  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };

  const contextProviderValue = useMemo(
    () => ({
      data,
      currentPage,
      handlePagination,
      filters,
    }),
    [data, filters, currentPage]
  );

  const downloadPDF = async () => {
    try {
      setButtonDisabled(true);
      const response = await axios.post(
        `/api/new-ranking/download/program/${programs}/task-id/${legacyTaskIds}`
      );
      const body = response.data.data;
      const fileURL = body.link;
      const namePdf = body.file_name;

      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `${namePdf}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setButtonDisabled(false);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const renderDataTable = (programs) => {
    if (programs === "skd") {
      programs = "ptk";
    } else if (programs === "utbk") {
      programs = "ptn";
    }
    switch (programs) {
      case "ptn":
        return ptnRows;
      case "cpns":
        return ptkRows;
      default:
        return ptkRows;
    }
  };

  const handleRecalculateIRT = async () => {
    try {
      setIsCalculated(true);
      const response = await recalculateIrt(tryoutCode);
      setIsCalculated(false);
      if (response && response.calculation_status === "GENERATING") {
        showToast({
          type: "info",
          title: "Sedang di Kalkulasi",
          message: "Proses kalkulasi sedang berlangsung. Mohon tunggu...",
        });
      } else {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "UKA Sedang Dikalkulasi",
        });
      }
    } catch (error) {
      console.error("Error during recalculation:", error);
      showToast({
        type: "error",
        title: "Gagal",
        message: "Terjadi kesalahan selama proses kalkulasi.",
      });
    }
  };

  const recalculateIrt = async (tryoutCode) => {
    const response = await axios.get(`/api/new-ranking/get-irt/${tryoutCode}`);
    const data = response.data;
    return data?.data ?? [];
  };

  const MySwal = withReactContent(Swal);
  const confirmSession = async (id) => {
    setIsCalculated(true);
    const state = await MySwal.fire({
      title: "Silahkan Pilih Sesi yang ingin dikalkulasi",
      icon: "warning",
      input: "select",
      inputOptions: {
        Sesi: {
          1: "Sesi 1",
          2: "Sesi 2",
          3: "Sesi 3",
        },
      },
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-outline-danger ml-1",
      },
      buttonsStyling: false,
    });
    if (state.isDismissed) {
      setIsCalculated(false);
      return;
    }

    const selectedSesi = state.value;
    handleRecalculateIRTStages(id, selectedSesi);
    setIsCalculated(false);
  };

  const handleRecalculateIRTStages = async (id, selectedSesi) => {
    const response = await axios.get(
      `/api/new-ranking/get-irt-uka-stage/${id}/session/${selectedSesi}`
    );
    const data = response.data;
    showToast({
      type: "success",
      title: "Berhasil",
      message: "UKA Sedang Dikalkulasi",
    });
    return data?.data ?? [];
  };

  return (
    <RankingContext.Provider value={contextProviderValue}>
      <h2
        style={{ marginLeft: "10px", marginTop: "15px", marginBottom: "15px" }}
      >
        {UKAData.package_type === "WITH_CODE" && (
          <p>UKA Kode | {UKAData.title}</p>
        )}
        {UKAData.package_type === "PREMIUM_TRYOUT" && (
          <p>UKA Stage | {UKAData.title}</p>
        )}
      </h2>
      <Card>
        <div>
          <Row className="justify-content-start mx-0">
            <Col
              className="d-flex align-items-center justify-content-start mt-1"
              md="6"
              sm="12"
            >
              {data?.length ? (
                <button
                  className="btn btn-primary mb-3"
                  onClick={downloadPDF}
                  disabled={isButtonDisabled}
                >
                  {isButtonDisabled ? (
                    <>
                      <Spinner size="sm" color="light" />{" "}
                      <span className="ml-1">Mohon Tunggu</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} /> Unduh PDF Ranking
                    </>
                  )}
                </button>
              ) : (
                ""
              )}
              {data?.length &&
              programs === "utbk" &&
              (UKAData.package_type === "PREMIUM_TRYOUT" ||
                UKAData.package_type === "WITH_CODE") ? (
                <button
                  className="btn btn-success mb-3 ml-2"
                  onClick={() =>
                    UKAData.package_type === "WITH_CODE"
                      ? handleRecalculateIRT()
                      : confirmSession(UKAData.id)
                  }
                  disabled={isCalculated}
                >
                  {isCalculated ? "Sedang Rekalkulasi" : "Rekalkulasi IRT"}
                </button>
              ) : (
                ""
              )}
            </Col>
          </Row>
        </div>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center justify-content-start flex-grow-1">
            <Col
              md="6"
              sm="12"
              className="d-flex align-items-center justify-content-start mb-75"
            >
              <Label className="mr-1" for="search-input">
                Search
              </Label>
              <Input
                className="dataTable-filter w-100"
                type="text"
                bsSize="sm"
                id="search-input"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
              />
              {/* <Col md="6" sm="12" className="d-flex">
                <Select
                options={filters}
                classNamePrefix="select"
                className={classnames("react-select w-100", {})}
                styles={{
                  menu: (provided) => ({ ...provided, zIndex: 9999 }),
                }}
                placeholder="Urutkan Berdasarkan..."
              />
              </Col> */}
            </Col>
          </div>
        </div>
        <div>
          <DataTable
            value={data}
            dataKey="rank"
            tableStyle={{ minWidth: "50rem" }}
            paginator
            loading={isLoading}
            rows={6}
            rowsPerPageOptions={[5, 10, 25, 50]}
            scrollable
            filters={filters}
            filterDisplay="row"
            globalFilterFields={[
              "name",
              "last_ed_name",
              "school_name",
              "start",
              "end",
              "time_exam",
              "penalaran_umum",
              "pengetahuan_umum",
              "pemahaman_bacaan",
              "pengetahuan_kuantitatif",
              "literasi_bahasa_indonesia",
              "literasi_bahasa_inggris",
              "penalaran_matematika",
              "total",
              "tiu",
              "tkp",
              "twk",
              "major_name",
            ]}
          >
            {renderDataTable(programs)}
          </DataTable>
        </div>
      </Card>
    </RankingContext.Provider>
  );
};

export default RankingTable;
