import { Badge } from "reactstrap";
import { ZoomIn } from "react-feather";

import axios from "../utility/http";
import { initialDatatables } from "../api/datatables/medical-checkup-history-data";
import moment from "moment-timezone";

export const getAllMedicalCheckupHistory = async () => {
  const response = await axios.get(`/medical-checkup/record/history/all`);
  const data = response.data;
  return data?.data ?? [];
};

export let data = initialDatatables;

export const columns = [
  {
    name: "No",
    maxWidth: "70px",
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
    grow: 2,
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
    name: "Cabang",
    sortable: false,
    wrap: true,
    style: { height: "unset !important" },
    selector: ({ branch_name }) => (
      branch_name ? branch_name : 'Loading...'
    )
  },
  {
    name: "BMI",
    sortable: false,
    maxWidth: '70px',
    wrap: true,
    center: true,
    style: { height: "unset !important" },
    selector: ({ bmi }) => (
      <Badge pill color="secondary">
        {bmi}
      </Badge>
    ),
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    selector: (row) => (
      <a
        href={`/kesehatan/hasil-pemeriksaan/${row._id}`}
        className="py-50 btn btn-sm bg-gradient-primary"
      >
        <ZoomIn size={14} /> Lihat Detail
      </a>
    ),
  },
];
