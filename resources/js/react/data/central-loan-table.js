import {
  Badge,
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import Swal from "sweetalert2";
import { Edit, Trash2, Eye } from "react-feather";
import withReactContent from "sweetalert2-react-content";

import axios from "../utility/http";
import { showToast } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/branch-loan-data";
import { priceFormatter } from "../utility/Utils";

export let data = initialDatatables;

const MySwal = withReactContent(Swal);

export const columns = [
  {
    name: "No",
    sortable: true,
    center: true,
    maxWidth: "50px",
    selector: (row, index) => {
      return index + 1;
    },
  },
  {
    name: "Cabang",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ branch_name }) => (branch_name ? branch_name : "Loading..."),
  },
  {
    name: "Total",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ amount }) => (
      <Badge color="warning" pill>
        {priceFormatter(amount)}
      </Badge>
    ),
  },
];
