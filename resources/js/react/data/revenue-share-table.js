import {
  Badge,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Trash2, Edit } from "react-feather";
import { priceFormatter } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/revenue-share-data";
import { deleteBranchEarningById } from "../data/finance-branch-earning";

export let data = initialDatatables;

const handleDelete = async (id) => {
  const isConfirmed = confirm("Delete?");
  if (!isConfirmed) return;
  const result = await deleteBranchEarningById(id);
  if (result?.success) {
    window.location.reload();
    return;
  }
  toastr.error(result?.message, "Hapus data gagal!", {
    closeButton: true,
    tapToDismiss: false,
    timeOut: 3000,
  });
};

export const columns = [
  {
    name: "No",
    sortable: false,
    selector: (row, index) => {
      return index + 1;
    },
  },
  {
    name: "Kode Cabang",
    center: true,
    sortable: false,
    selector: "branch_code",
  },
  {
    name: "Tipe",
    selector: "earning_type",
    center: true,
    sortable: true,
  },
  {
    name: "Nominal Fee",
    center: true,
    sortable: false,
    selector: ({ amount, amount_type }) => {
      const isPercent = amount_type == "PERCENT";
      return (
        <Badge color="warning" pill>
          {isPercent ? `${amount} %` : priceFormatter(amount)}
        </Badge>
      );
    },
  },
  {
    name: "Kode Produk",
    center: true,
    sortable: false,
    selector: ({ product_code }) => {
      const isExist = !!product_code;
      return (
        <Badge color={`light-${isExist ? "primary" : "secondary"}`} pill>
          {isExist ? product_code : "Tidak Ada"}
        </Badge>
      );
    },
  },
  {
    name: "Untuk",
    center: true,
    sortable: false,
    selector: ({ earning_position }) => {
      const isCentral = earning_position == "CENTRAL";
      return (
        <Badge color={`light-${isCentral ? "primary" : "warning"}`} pill>
          {isCentral ? "Pusat" : "Cabang"}
        </Badge>
      );
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    selector: (row) =>
      row.earning_type == "DEFAULT" ? (
        <span>-</span>
      ) : (
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
            <DropdownItem href={`/porsi-pendapatan/edit/${row.id}`} tag="a">
              <Edit size={15} className="mr-50" /> Edit
            </DropdownItem>

            <DropdownItem
              onClick={() => handleDelete(row.id)}
              tag="a"
              className="text-danger"
            >
              <Trash2 size={15} className="mr-50" /> Delete
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      ),
  },
];
