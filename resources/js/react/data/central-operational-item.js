import {
  Badge,
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Trash2, ZoomIn } from "react-feather";

import axios from "../utility/http";
import { priceFormatter } from "../utility/Utils";

import moment from "moment-timezone";

export const getCentralOperationalItems = async () => {
  const response = await axios.get(`/central-operational-item/`);
  const data = response.data;
  return data?.data ?? [];
};

export let data = {};

export const columns = [
  {
    name: "No",
    sortable: false,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Nama Produk",
    wrap: true,
    sortable: false,
    selector: "items_name",
  },
  {
    name: "Harga Produk",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ amount }) => {
      return `${priceFormatter(amount)}`;
    },
  },
  {
    name: "Kode Produk",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "product_code",
  },
  {
    name: "Jumlah Produk",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "qty",
  },
  {
    name: "Kode Cabang Produk",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ branch_code }) => {
      return branch_code ? (
        <Badge
          color="info"
          role="button"
          onClick={() =>
            (window.location.href = `/cabang/detail/${branch_code}`)
          }
        >
          {branch_code}
        </Badge>
      ) : (
        "-"
      );
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    style: { height: "unset !important" },
    selector: ({ id }) => (
      <div className="d-flex">
        <Button
          className="btn btn-sm btn-warning"
          tag="a"
          href={`/central-operational-item/edit/${id}`}
        >
          Edit
        </Button>
      </div>
    ),
  },
];
