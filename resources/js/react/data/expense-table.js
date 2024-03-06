import moment from "moment";
import { Edit, File } from "react-feather";
import {
  UncontrolledButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Badge,
} from "reactstrap";

import { initialDatatables } from "../api/datatables/expense-data";
import { priceFormatter } from "../utility/Utils";

export let data = initialDatatables;

export const columns = [
  {
    name: "Tanggal",
    sortable: true,
    minWidth: "100px",
    selector: (row) => (
      <div className="user-info text-truncate">
        <span className="d-block font-weight-bold text-truncate">
          {moment(row?.transaction_date).format("DD-MM-YYYY")}
        </span>
      </div>
    ),
  },
  {
    name: "Nomor",
    sortable: false,
    selector: ({ ref_number, id }) => {
      const number = `Biaya #${ref_number}`;
      return (
        <a title={number} href={`/biaya/detail/${id}`}>
          {number}
        </a>
      );
    },
  },
  {
    name: "Kategori",
    selector: (row) => {
      const output = (row?.tags ?? []).map((label, index) => (
        <Badge key={index} color="light-primary" style={{ marginRight: "4px" }}>
          {label}
        </Badge>
      ));
      return output;
    },
    sortable: true,
  },
  {
    name: "Penerima",
    sortable: false,
    minWidth: "150px",
    selector: (row) => row.contact_name,
  },
  {
    name: "Total",
    sortable: false,
    selector: (row) => priceFormatter(row.amount),
  },
  {
    name: "Actions",
    allowOverflow: true,
    selector: (row) => {
      return (
        <div className="d-flex">
          <UncontrolledButtonDropdown>
            <DropdownToggle
              className="btn-gradient-info"
              color="none"
              size="sm"
              caret
            >
              Pilihan
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem href={`/biaya/detail/${row.id}`} tag="a">
                <File size={15} className="mr-50" /> Detail
              </DropdownItem>

              <DropdownItem href={`/biaya/edit/${row.id}`} tag="a">
                <Edit size={15} className="mr-50" /> Edit
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </div>
      );
    },
  },
];
