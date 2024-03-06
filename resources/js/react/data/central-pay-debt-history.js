import { Edit, ExternalLink, Trash2, ZoomIn } from "react-feather";
import {
  Badge,
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";

import { priceFormatter } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/central-pay-debt-history";

export const getCentralPayDebtHistory = async (accountId) => {
  const response = await axios.get(
    `/api/finance/pay-and-bill/central/history/PAY/${accountId}`
  );
  const data = response.data;
  return data?.data ?? [];
};

export let data = initialDatatables;

export const columns = [
  {
    name: "No",
    selector: (row, index) => {
      return index + 1;
    },
  },
  {
    name: "Jumlah",
    center: true,
    selector: (row) => {
      return `${priceFormatter(row.amount)}`;
    },
  },
  {
    name: "Tanggal Dibayar",
    center: true,
    minWidth: "200px",
    selector: ({ created_at }) => {
      return `${moment(created_at)
        .utcOffset("+0700")
        .format("DD MMM YYYY • HH:mm")} WIB`;
    },
  },
  {
    name: "Metode Pembayaran",
    center: true,
    minWidth: "300px",
    selector: "payment_method",
  },
  {
    name: "Bukti Pembayaran",
    center: true,
    minWidth: "200px",
    allowOverflow: true,
    selector: ({ proof_file }) =>
      proof_file ? (
        <a target="_blank" rel="noreferrer" href={proof_file}>
          <Badge color="primary" className="cursor-pointer">
            <ExternalLink size={14} /> Lihat
          </Badge>
        </a>
      ) : (
        <Badge color="secondary">-</Badge>
      ),
  },
  // {
  //   name: "Aksi",
  //   center: true,
  //   allowOverflow: true,
  //   selector: (row) => (
  //     <div className="d-flex">
  //       <UncontrolledButtonDropdown>
  //         <DropdownToggle
  //           className="btn-gradient-info"
  //           color="none"
  //           size="sm"
  //           caret
  //         >
  //           Pilihan
  //         </DropdownToggle>
  //         <DropdownMenu>
  //           <DropdownItem href={`/pembelajaran/jadwal/edit/${row._id}`} tag="a">
  //             <Edit size={15} className="mr-50" /> Edit
  //           </DropdownItem>

  //           <DropdownItem
  //             onClick={() => deleteSchedule(row._id)}
  //             tag="a"
  //             className="text-danger"
  //           >
  //             <Trash2 size={15} className="mr-50" /> Delete
  //           </DropdownItem>
  //         </DropdownMenu>
  //       </UncontrolledButtonDropdown>
  //     </div>
  //   ),
  // },
];
