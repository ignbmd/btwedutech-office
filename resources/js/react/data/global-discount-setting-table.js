import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit } from "react-feather";
import { formatNum } from "../utility/Utils";

import axios from "axios";

export const getGlobalDiscountSetting = async () => {
  const url = "/api/global-discount-setting";
  const response = await axios.get(url);
  const data = response.data;
  return data?.data ?? [];
};

export const getAllProduct = async () => {
  const url = "/api/product/by-query";
  const response = await axios.get(url);
  const data = response.data;
  return data?.data ?? [];
}

export let data = {};

export const columns = [
  {
    name: "No",
    sortable: false,
    center: true,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Nama Produk",
    wrap: true,
    sortable: false,
    center: true,
    selector: ({ title, product_code }) => {
      const maxTitleLength = 20; 
      
      if (title === undefined) {
        return `(${product_code})`;
      } else if (title.length > maxTitleLength) {
        return `${title.substring(0, maxTitleLength)}... (${product_code})`;
      } else {
        return `${title} (${product_code})`;
      }
    },
    
  },
  {
    name: "Tipe Diskon",
    wrap: true,
    sortable: false,
    center: true,
    selector: "amount_type",
  },
  {
    name: "Nominal Diskon",
    wrap: true,
    sortable: false,
    center: true,
    selector: ({ amount_type, amount }) => {
      return amount_type === "FIXED" ? `${formatNum(amount)}` : amount;
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    style: { height: "unset !important" },
    selector: (row) => (
      <div className="d-flex">
        <UncontrolledButtonDropdown>
          <DropdownToggle
            id={`action-${row.id}`}
            className="btn-gradient-primary"
            color="none"
            size="sm"
            caret
          >
            Pilihan
          </DropdownToggle>
          <DropdownMenu>
            <div className="dropdown-divider"></div>
            <DropdownItem
              href={`/pengaturan-diskon/global/${row.id}/edit`}
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
