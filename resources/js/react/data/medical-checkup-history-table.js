import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, Trash2, ZoomIn } from "react-feather";

import axios from "../utility/http";
import { initialDatatables } from "../api/datatables/medical-checkup-history-data";
import moment from "moment-timezone";

export const getMedicalCheckupHistory = async (studentId) => {
  const response = await axios.get(
    `/medical-checkup/record/history/${studentId}`
  );
  const data = response.data;
  return data?.data ?? [];
};

export let data = initialDatatables;

export const columns = [
  {
    name: "No",
    maxWidth: "100px",
    center: true,
    sortable: false,
    selector: "no",
  },
  {
    name: "Tanggal Pemeriksaan",
    grow: 2,
    sortable: false,
    wrap: true,
    style: { height: "unset !important" },
    selector: ({ createdAt }) =>
      `${moment(createdAt).format("DD MMM YYYY • HH:mm:ss")} WIB`,
  },
  {
    name: "Nama",
    grow: 2,
    sortable: false,
    wrap: true,
    style: { height: "unset !important" },
    selector: "name",
  },
  {
    name: "Jenis Kelamin",
    sortable: false,
    wrap: true,
    center: true,
    style: { height: "unset !important" },
    selector: ({ gender }) => {
      return (
        <Badge pill color={gender ? "primary" : "success"}>
          {gender ? "Laki-Laki" : "Perempuan"}
        </Badge>
      );
    },
  },
  {
    name: "BMI",
    sortable: false,
    wrap: true,
    center: true,
    style: { height: "unset !important" },
    selector: ({ bmi }) => (
      <Badge pill color="secondary">{bmi}</Badge>
    ),
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    selector: (row) => (
      <a
        href={`/kesehatan/hasil-pemeriksaan/${row._id}/${row.smartbtw_id}`}
        className="py-50 btn btn-sm bg-gradient-primary"
      >
        <ZoomIn size={14} /> Lihat Detail
      </a>
    ),
  },
];
