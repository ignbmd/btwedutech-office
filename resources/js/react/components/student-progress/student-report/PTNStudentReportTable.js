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
import { Search, Download, Send } from "react-feather";
import { Fragment, useContext, useState, useEffect } from "react";
import { StudentReportContext } from "../../../context/StudentReportContext";
import { getStudentID } from "../../../utility/student-report";
import { showToast } from "../../../utility/Utils";

import "primereact/resources/themes/lara-light-blue/theme.css";
import axios from "axios";

const studentID = getStudentID();

const PTNStudentReportTable = () => {
  const {
    studentResult,
    toggleShowSendDocumentModal,
    setSendDocumentModalType,
  } = useContext(StudentReportContext);
  const [isDownloadingMultipleReports, setIsDownloadingMultipleReports] =
    useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [selectedReports, setSelectedReports] = useState(null);

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
        <div
          className="d-flex align-items-center ml-auto"
          style={{ gap: "10px" }}
        >
          {selectedReports?.length ? (
            <Fragment>
              {selectedReports.length} data dipilih
              <Button
                color="primary"
                disabled={
                  !selectedReports?.length || isDownloadingMultipleReports
                }
                onClick={() => handleDownloadMultipleStudentUkaReport()}
              >
                Unduh Rapor
              </Button>
            </Fragment>
          ) : null}
        </div>
      </div>
    );
  };
  const header = renderHeader();

  const getIRTFormattedAverageScore = (number, precision = 1) => {
    if (number == "-") return number;
    const ratio = Math.pow(10, precision);
    const average = (number * ratio) / ratio;
    return Math.round(average * 1000) / 1000;
  };

  const averagePUScore = () => {
    let average = 0;
    let total = 0;
    for (let data of studentResult?.histories ?? []) {
      total += data.category.pu.score;
    }
    average = studentResult?.histories?.length
      ? total / studentResult?.histories?.length
      : "-";
    return getIRTFormattedAverageScore(average);
  };

  const averagePPUScore = () => {
    let average = 0;
    let total = 0;
    for (let data of studentResult?.histories ?? []) {
      total += data.category.ppu.score;
    }
    average = studentResult?.histories?.length
      ? total / studentResult?.histories?.length
      : "-";
    return getIRTFormattedAverageScore(average);
  };

  const averagePBMScore = () => {
    let average = 0;
    let total = 0;
    for (let data of studentResult?.histories ?? []) {
      total += data.category.pbm.score;
    }
    average = studentResult?.histories?.length
      ? total / studentResult?.histories?.length
      : "-";
    return getIRTFormattedAverageScore(average);
  };

  const averagePKScore = () => {
    let average = 0;
    let total = 0;
    for (let data of studentResult?.histories ?? []) {
      total += data.category.pk.score;
    }
    average = studentResult?.histories?.length
      ? total / studentResult?.histories?.length
      : "-";
    return getIRTFormattedAverageScore(average);
  };

  const averageLBINDScore = () => {
    let average = 0;
    let total = 0;
    for (let data of studentResult?.histories ?? []) {
      total += data.category.lbind.score;
    }
    average = studentResult?.histories?.length
      ? total / studentResult?.histories?.length
      : "-";
    return getIRTFormattedAverageScore(average);
  };

  const averageLBINGScore = () => {
    let average = 0;
    let total = 0;
    for (let data of studentResult?.histories ?? []) {
      total += data.category.lbing.score;
    }
    average = studentResult?.histories?.length
      ? total / studentResult?.histories?.length
      : "-";
    return getIRTFormattedAverageScore(average);
  };

  const averagePMScore = () => {
    let average = 0;
    let total = 0;
    for (let data of studentResult?.histories ?? []) {
      total += data.category.pm.score;
    }
    average = studentResult?.histories?.length
      ? total / studentResult?.histories?.length
      : "-";
    return getIRTFormattedAverageScore(average);
  };

  const averageTotalScore = () => {
    let average = 0;
    let total = 0;
    for (let data of studentResult?.histories ?? []) {
      total += data.total;
    }
    average = studentResult?.histories?.length
      ? total / studentResult?.histories?.length
      : "-";
    return getIRTFormattedAverageScore(average);
  };

  const passPercentage = () => {
    return (
      <div className="d-flex align-items-center">
        <div className="d-flex flex-column" style={{ flexGrow: 1 }}>
          <div>Persentase</div>
          <div>Kelulusan</div>
        </div>
        <div style={{ flexGrow: 1 }}>
          {studentResult?.summary?.passing_percentage
            ? `${studentResult?.summary?.passing_percentage}%`
            : "-"}
        </div>
      </div>
    );
  };

  const footerGroup = (
    <ColumnGroup>
      <Row>
        <Column
          footer="Nilai Rata-rata:"
          colSpan={4}
          footerStyle={{ textAlign: "center" }}
        />
        <Column footer={averagePUScore} />
        <Column footer={averagePPUScore} />
        <Column footer={averagePBMScore} />
        <Column footer={averagePKScore} />
        <Column footer={averageLBINDScore} />
        <Column footer={averageLBINGScore} />
        <Column footer={averagePMScore} />
        <Column footer={averageTotalScore} />
        <Column footer={passPercentage} colSpan={2} />
      </Row>
    </ColumnGroup>
  );

  const showSendDocumentModal = (data) => {
    const customEvent = new CustomEvent("report.selected", {
      detail: { report: data },
    });
    document.dispatchEvent(customEvent);
    setSendDocumentModalType("STUDENT_UKA_STAGE_REPORT");
    toggleShowSendDocumentModal();
  };

  const handleDownloadMultipleStudentUkaReport = async () => {
    try {
      setIsDownloadingMultipleReports(true);
      const task_ids = selectedReports?.map((report) => report.task_id);
      if (task_ids.length == 1) {
        const exam_name = selectedReports[0].exam_name;
        await streamStudentMultipleUkaReport({
          task_ids: task_ids,
          uka_name: exam_name,
        });
        return;
      }
      await downloadStudentMultipleUkaReport({
        task_ids: task_ids,
        uka_name: "",
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: error.message,
        duration: 3000,
      });
    } finally {
      setIsDownloadingMultipleReports(false);
    }
  };

  const handleDownloadSingleStudentUkaReport = async (rowIndex, data) => {
    const dropdownButton = document.getElementById(`dropdown-${rowIndex}`);
    try {
      dropdownButton.setAttribute("disabled", true);
      await streamStudentMultipleUkaReport({
        task_ids: [data?.task_id],
        uka_name: data?.exam_name,
      });
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: error.message,
        duration: 3000,
      });
    } finally {
      dropdownButton.removeAttribute("disabled");
    }
  };

  const streamStudentMultipleUkaReport = async ({ task_ids, uka_name }) => {
    const response = await axios.post("/api/student-uka-report/document-link", {
      smartbtw_id: studentID,
      program: "PTN",
      task_ids: task_ids,
      uka_name: uka_name,
      stream_file: true,
    });
    const reports = response?.data?.data ?? [];
    if (!reports.length) {
      throw new Error(
        "Data rapor uka stage siswa tidak ditemukan, silakan coba lagi nanti"
      );
    }
    const report = reports[0];
    window.open(report.link);
  };

  const downloadStudentMultipleUkaReport = async ({ task_ids, uka_name }) => {
    const response = await axios.post(
      "/api/student-uka-report/multiple-student/document-link",
      {
        smartbtw_id: studentID,
        program: "PTN",
        task_ids: task_ids,
        uka_name: uka_name,
      },
      {
        responseType: "blob",
      }
    );
    if (response.status != 200) {
      throw new Error(
        "Tidak ada data rapor siswa yang bisa di unduh. Silakan coba lagi nanti"
      );
    }
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
  };

  const actionBodyTemplate = (data, row) => {
    return (
      <UncontrolledButtonDropdown>
        <DropdownToggle
          className="btn-gradient-info"
          color="none"
          disabled={Boolean(selectedReports?.length)}
          id={`dropdown-${row.rowIndex}`}
          caret
        >
          PDF
        </DropdownToggle>
        <DropdownMenu className="w-100">
          <DropdownItem
            className="w-100"
            onClick={() =>
              handleDownloadSingleStudentUkaReport(row.rowIndex, data)
            }
          >
            <Download size={14} className="mr-50" />
            Unduh PDF
          </DropdownItem>
          <DropdownItem
            className="w-100"
            onClick={() => showSendDocumentModal(data)}
          >
            <Send size={14} className="mr-50" />
            Kirim PDF
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
    );
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
            value={studentResult?.histories}
            selectionMode={null}
            selection={selectedReports}
            onSelectionChange={(e) => {
              setSelectedReports(e.value);
            }}
            dataKey="task_id"
            scrollable
            scrollHeight="500px"
            showGridlines
            header={header}
            filters={filters}
            footerColumnGroup={footerGroup}
            tableStyle={{ minWidth: "50rem" }}
            emptyMessage="Data rapor tidak ditemukan"
            globalFilterFields={[
              "exam_name",
              "date_formatted",
              "duration_formatted",
              "category.pu.score",
              "category.ppu.score",
              "category.pbm.score",
              "category.pk.score",
              "category.lbind.score",
              "category.lbinng.score",
              "category.pm.score",
              "total",
            ]}
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: "3rem" }}
            ></Column>
            <Column
              field="exam_name"
              header="Modul"
              style={{ width: "30%" }}
              sortable
            ></Column>
            <Column
              field="date_formatted"
              header="Tanggal Mengerjakan"
              sortable
            ></Column>
            <Column
              field="duration_formatted"
              header="Durasi Mengerjakan"
              sortable
            ></Column>
            <Column
              field="category.pu.score"
              header="Nilai PU"
              sortable
            ></Column>
            <Column
              field="category.ppu.score"
              header="Nilai PPU"
              sortable
            ></Column>
            <Column
              field="category.pbm.score"
              header="Nilai PBM"
              sortable
            ></Column>
            <Column
              field="category.pk.score"
              header="Nilai PK"
              sortable
            ></Column>
            <Column
              field="category.lbind.score"
              header="Nilai LBIND"
              sortable
            ></Column>
            <Column
              field="category.lbing.score"
              header="Nilai LBING"
              sortable
            ></Column>
            <Column
              field="category.pm.score"
              header="Nilai PM"
              sortable
            ></Column>
            <Column field="total" header="Nilai Total" sortable></Column>
            <Column
              body={actionBodyTemplate}
              exportable={false}
              header="Aksi"
              style={{ width: "30%" }}
            ></Column>
          </DataTable>
        </PrimeReactProvider>
      </CardBody>
    </Card>
  );
};

export default PTNStudentReportTable;
