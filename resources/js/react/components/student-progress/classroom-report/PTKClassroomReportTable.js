import { Card, CardBody, Button } from "reactstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode, PrimeReactProvider } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Search } from "react-feather";
import "primereact/resources/themes/lara-light-blue/theme.css";
import { Fragment, useContext, useState } from "react";
import { ClassroomReportContext } from "../../../context/ClassroomReportContext";
import {
  generateMultipleStudentsProgressReportsDocumentLinks,
  generateStreamStudentProgressReportDocumentLink,
} from "../../../services/student-progress/classroom-report";
import { showToast } from "../../../utility/Utils";

const PTKClassroomReportTable = () => {
  const {
    selectedClassroom,
    selectedUkaType,
    selectedUkaModule,
    classroomResults,
  } = useContext(ClassroomReportContext);
  const [isDownloadingProgressReport, setIsDownloadingProgressReport] =
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
                  !selectedReports?.length || isDownloadingProgressReport
                }
                onClick={() =>
                  handleDownloadStudentProgressReport(selectedReports)
                }
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

  const targetTemplate = (data) => {
    return `${data?.student_target_ptk?.school_name} - ${data?.student_target_ptk?.major_name}`;
  };

  const passPercentageTemplate = (data) => {
    return `${data?.student_target_ptk?.current_target_percent_score}%`;
  };

  const actionBodyTemplate = (data) => {
    return (
      <Button
        color="primary"
        size="sm"
        onClick={() => generateAndRedirectToStudentReportPage(data)}
      >
        Lihat Detail
      </Button>
    );
  };

  const generateAndRedirectToStudentReportPage = (rowData) => {
    window.location.href = `/rapor-performa-belajar/kelas/${selectedClassroom?._id}/siswa/${rowData?.smartbtw_id}/rapor?stage_type=${selectedUkaType?.value}&module_type=${selectedUkaModule?.value}&cid=${selectedClassroom?._id}`;
  };

  const handleDownloadStudentProgressReport = async (selectedReports) => {
    const studentIDs = selectedReports?.map((item) => item.smartbtw_id);
    try {
      setIsDownloadingProgressReport(true);
      if (studentIDs.length == 1) {
        await streamStudentMultipleProgressReport(studentIDs[0]);
        return;
      }
      await downloadStudentMultipleProgressReport(studentIDs);
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: error.message,
        duration: 3000,
      });
    } finally {
      setIsDownloadingProgressReport(false);
    }
  };

  const streamStudentMultipleProgressReport = async (studentID) => {
    const response = await generateStreamStudentProgressReportDocumentLink(
      studentID,
      "ptk",
      selectedUkaType?.value,
      selectedUkaModule?.value,
      true
    );
    const report = response?.data ?? null;
    if (!report) {
      throw new Error(
        "Data rapor perkembangan siswa tidak ditemukan, silakan coba lagi nanti"
      );
    }
    window.open(report.link);
  };

  const downloadStudentMultipleProgressReport = async (studentIDs) => {
    const response = await generateMultipleStudentsProgressReportsDocumentLinks(
      studentIDs,
      "ptk",
      selectedUkaType?.value,
      selectedUkaModule?.value
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

  return (
    <Card>
      <CardBody>
        <PrimeReactProvider>
          <DataTable
            value={classroomResults?.data}
            selectionMode={null}
            selection={selectedReports}
            onSelectionChange={(e) => {
              setSelectedReports(e.value);
            }}
            dataKey="smartbtw_id"
            scrollable
            scrollHeight="500px"
            showGridlines
            header={header}
            filters={filters}
            tableStyle={{ minWidth: "50rem" }}
            emptyMessage="Data rapor tidak ditemukan"
            globalFilterFields={[
              "name",
              "student_target_ptk.school_name",
              "student_target_ptk.major_name",
              "student_target_ptk.target_score",
              "summary.owned",
              "summary.done",
              "summary.score_values.TWK.average_score",
              "summary.score_values.TIU.average_score",
              "summary.score_values.TKP.average_score",
              "summary.average_score",
              "student_target_ptk.current_target_percent_score",
            ]}
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: "3rem" }}
              frozen
            ></Column>
            <Column field="name" header="Nama" frozen sortable></Column>
            <Column
              body={targetTemplate}
              header="Target"
              frozen
              sortable
            ></Column>
            <Column
              field="student_target_ptk.target_score"
              header="Nilai Target Minimum"
              frozen
              sortable
            ></Column>
            <Column
              field="summary.owned"
              header="UKA Diterima"
              frozen
              sortable
            ></Column>
            <Column
              field="summary.done"
              header="UKA Dikerjakan"
              frozen
              sortable
            ></Column>
            <Column
              field="summary.score_values.TWK.average_score"
              header="Nilai rata-rata TWK"
              sortable
            ></Column>
            <Column
              field="summary.score_values.TIU.average_score"
              header="Nilai rata-rata TIU"
              sortable
            ></Column>
            <Column
              field="summary.score_values.TKP.average_score"
              header="Nilai rata-rata TKP"
              sortable
            ></Column>
            <Column
              field="summary.average_score"
              header="Nilai rata-rata SKD"
              sortable
            ></Column>
            <Column
              body={passPercentageTemplate}
              header="Peluang Kelulusan"
              sortable
            ></Column>
            <Column
              body={actionBodyTemplate}
              exportable={false}
              header="Aksi"
            ></Column>
          </DataTable>
        </PrimeReactProvider>
      </CardBody>
    </Card>
  );
};

export default PTKClassroomReportTable;
