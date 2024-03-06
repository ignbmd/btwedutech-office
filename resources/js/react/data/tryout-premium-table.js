import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, Trash2, ZoomIn } from "react-feather";

import { priceFormatter } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/tryout-premium-data";

export let data = initialDatatables;

export const getTryoutPremium = async () => {
  const url = "/api/exam/tryout-premium";
  const response = await axios.get(url);
  const data = response.data;
  return data?.data ?? [];
};

export const columns = [
  {
    name: "No",
    sortable: false,
    center: true,
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
    name: "Nama Tryout",
    grow: 2,
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ title }) => {
      return `${title}`;
    },
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
  // {
  //   name: "Pendaftaran Dibuka",
  //   grow: 2,
  //   wrap: true,
  //   center: true,
  //   sortable: false,
  //   style: { height: "unset !important" },
  //   selector: ({ start_date }) => {
  //     return `${moment(start_date)
  //       .utcOffset("+0700")
  //       .format("DD MMM YYYY • HH:mm")} WIB`;
  //   },
  // },
  // {
  //   name: "Pendaftaran Ditutup",
  //   grow: 2,
  //   wrap: true,
  //   center: true,
  //   sortable: false,
  //   style: { height: "unset !important" },
  //   selector: ({ end_date }) => {
  //     return `${moment(end_date)
  //       .utcOffset("+0700")
  //       .format("DD MMM YYYY • HH:mm")} WIB`;
  //   },
  // },
  // {
  //   name: "Waktu Dimulai",
  //   grow: 2,
  //   wrap: true,
  //   center: true,
  //   sortable: false,
  //   style: { height: "unset !important" },
  //   selector: ({ tryout_clusters }) => {
  //     return `${moment(tryout_clusters[0].start_datetime)
  //       .utcOffset("+0700")
  //       .format("DD MMM YYYY • HH:mm")} WIB`;
  //   },
  // },
  // {
  //   name: "Waktu Selesai",
  //   grow: 2,
  //   wrap: true,
  //   center: true,
  //   sortable: false,
  //   style: { height: "unset !important" },
  //   selector: ({ tryout_clusters }) => {
  //     return `${moment(tryout_clusters[0].end_datetime)
  //       .utcOffset("+0700")
  //       .format("DD MMM YYYY • HH:mm")} WIB`;
  //   },
  // },
  {
    name: "Status",
    wrap: true,
    center: true,
    sortable: false,
    allowOverflow: true,
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
            <DropdownItem href={`/ujian/tryout-premium/edit/${row.id}`} tag="a">
              <Edit size={15} className="mr-50" /> Edit
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </div>
    ),
  },
];
