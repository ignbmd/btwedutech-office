import { FileText } from "react-feather";
import { initialDatatables } from "../api/datatables/participant-list-data";
import axios from "axios";
import moment from "moment-timezone";
import { ParticipantContext } from "../context/PsikotestParticipantContex";
import { useContext } from "react";

export const getParticipantsList = async () => {
  const response = await axios.get("/api/psikotest/participant-list");
  const data = response.data;
  return data?.list ?? [];
};

const getStudentResultPDFDownloadLink = async (participant_id) => {
  const response = await axios.get(
    `/api/psikotest/participant-list/${participant_id}/download-link`
  );
  const data = response.data;
  return data?.data ?? null;
};

const handleLinkClick = async (event, participant_id) => {
  event.target.disabled = true;
  const studentResultData = await getStudentResultPDFDownloadLink(
    participant_id
  );

  if (studentResultData) {
    const pdfUrl = `result/${participant_id}/download`;
    // Buka PDF dalam jendela baru
    window.open(pdfUrl, "_blank");
  }

  event.target.disabled = false;
};

export let data = initialDatatables;

export const columns = [
  {
    name: "No",
    sortable: false,
    center: true,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Kode Akses",
    grow: 2,
    wrap: true,
    sortable: false,
    center: true,
    selector: "code",
  },
  {
    name: "Nama",
    grow: 2,
    wrap: true,
    sortable: false,
    center: true,
    selector: "name",
  },
  {
    name: "sekolah",
    grow: 2,
    wrap: true,
    sortable: false,
    center: true,
    selector: "instance_name",
  },
  {
    name: "Email",
    grow: 2,
    wrap: true,
    sortable: false,
    center: true,
    selector: "email",
  },
  {
    name: "No. Telepon",
    grow: 2,
    wrap: true,
    sortable: false,
    center: true,
    selector: "phone_number",
  },
  {
    name: "Tanggal Tes",
    grow: 2,
    wrap: true,
    sortable: false,
    center: true,
    // selector: "date_test",
    cell: (row) => moment(row.date_test).format("DD/MM/YYYY"),
  },
  {
    name: "Hasil",
    center: "true",
    allowOverflow: "true",
    selector: (row) => {
      return (
        <button
          className="d-flex align-items-center btn btn-outline-primary btn-sm"
          onClick={(event) => handleLinkClick(event, row._id)}
        >
          <FileText className="mr-25" />
          PDF
        </button>
      );
    },
  },
  // {
  //   name: "Aksi",
  //   center: true,
  //   allowOverflow: true,
  //   selector: (row) => {
  //     const { setShowPopupEdit } = useContext(ParticipantContext);
  //     return (
  //       <button
  //         type="button"
  //         class="btn btn-outline-primary"
  //         onClick={() => setShowPopupEdit((prev) => !prev)}
  //       >
  //         Edit
  //       </button>
  //     );
  //   },
  // },
];
