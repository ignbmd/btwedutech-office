import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit } from "react-feather";
import { initialDatatables } from "../api/datatables/package-data";
import axios from "../utility/http";
import moment from "moment-timezone";

export const getPackages = async () => {
  const response = await axios.get("/exam/assessment-package");
  return response?.data ?? [];
};

export let data = initialDatatables;

export const columns = [
  {
    name: "No",
    center: true,
    sortable: false,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Kode Produk",
    grow: 2,
    wrap: true,
    center: true,
    sortable: false,
    selector: ({ product_code }) => {
      return product_code ? <Badge color="success">{product_code}</Badge> : "-";
    },
  },
  {
    name: "Judul Paket Modul",
    grow: 3,
    wrap: true,
    sortable: false,
    center: true,
    style: { height: "unset !important" },
    selector: "title",
  },
  {
    name: "Modul",
    grow: 2,
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ modules }) => {
      return (
        <Badge color="light-primary" pill>
          {modules.module_code}
        </Badge>
      );
    },
  },
  {
    name: "Tanggal Mulai",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ start_date }) => {
      return start_date
        ? `${moment(start_date)
            .tz("Asia/Jakarta")
            .format("DD MMM YYYY • HH:mm")} WIB`
        : "-";
    },
  },
  {
    name: "Tanggal Selesai",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ end_date }) => {
      return end_date
        ? `${moment(end_date)
            .tz("Asia/Jakarta")
            .format("DD MMM YYYY • HH:mm")} WIB`
        : "-";
    },
  },
  {
    name: "Status",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ status }) => {
      return (
        <>
          {status ? (
            <Badge color="light-success">Aktif</Badge>
          ) : (
            <Badge color="light-danger">Tidak Aktif</Badge>
          )}
        </>
      );
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    selector: (row) => (
      <div className="d-flex">
        <UncontrolledButtonDropdown>
          <DropdownToggle
            className="btn-gradient-primary"
            color="none"
            size="sm"
            caret
          >
            Pilihan
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem
              href={`/ujian/paket-assessment/edit/${row.id}`}
              tag="a"
            >
              <Edit size={15} className="mr-50" /> Edit
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </div>
    ),
  },
];
