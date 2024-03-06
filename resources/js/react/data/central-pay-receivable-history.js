import { Edit, Edit2, ExternalLink, Trash2, ZoomIn } from "react-feather";
import {
  Badge,
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";

import { priceFormatter } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/central-collect-receivable-history";

export const getCentralCollectReceivableHistory = async (accountId) => {
  const response = await axios.get(
    `/api/finance/pay-and-bill/central/history/BILL/${accountId}`
  );
  const data = response.data;
  return data?.data ?? [];
};
const getPaymentStatusConfig = (statusValue) => {
  const status = {
    OPEN: { label: "Belum Dibayar", color: "light-secondary" },
    WAITING: {
      label: "Menunggu Konfirmasi",
      color: "light-primary",
    },
    REJECTED: { label: "Ditolak", color: "light-danger" },
    COMPLETED: { label: "Diterima", color: "light-success" },
  };

  return status[statusValue] ?? { label: "-", color: "light-secondary" };
};

export let data = initialDatatables;

export const columns = [
  {
    name: "No",
    maxWidth: "70px",
    selector: (row, index) => {
      return index + 1;
    },
  },
  {
    name: "Nominal",
    center: true,
    selector: (row) => {
      return `${priceFormatter(row.amount)}`;
    },
  },
  {
    name: "Tanggal Diperbarui",
    center: true,
    selector: ({ updated_at }) => {
      const date = moment(updated_at)
        .utcOffset("+0700")
        .format("DD MMM YYYY • HH:mm");
      return <span title={date}>{date} WIB</span>;
    },
  },
  {
    name: "Metode Pembayaran",
    center: true,
    minWidth: "150px",
    selector: ({ payment_method }) => {
      const methods = {
        MANUAL_TF_BCA: "Transfer Manual Bank BCA",
        MANUAL_TF_BNI: "Transfer Manual Bank BNI",
        MANUAL_TF_BRI: "Transfer Manual Bank BRI",
        CASH: "Cash",
      };

      return (
        <span title={methods[payment_method] ?? payment_method}>
          {methods[payment_method] ?? payment_method}
        </span>
      );
    },
  },
  {
    name: "Status",
    center: true,
    selector: ({ status }) => {
      const statusConfig = getPaymentStatusConfig(status);

      return <Badge color={statusConfig.color}>{statusConfig.label}</Badge>;
    },
  },
  {
    name: "Bukti Pembayaran",
    center: true,
    allowOverflow: true,
    selector: ({ proof_file }) => {
      return proof_file ? (
        <a target="_blank" href={proof_file}>
          <Badge className="cursor-pointer">
            <ExternalLink size={14} /> Lihat
          </Badge>
        </a>
      ) : (
        <Badge color="light-secondary">-</Badge>
      )
    }
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    selector: (row) =>
      row.status == "COMPLETED" || row.status == "REJECTED" ? (
        <Badge color="light-secondary">-</Badge>
      ) : (
        <a
          href={`/bayar-dan-tagih/tagih/cabang/ubah/${row.id}`}
          className="py-50 btn btn-sm bg-gradient-primary"
        >
          <Edit2 size={14} /> Perbarui
        </a>
      ),
  },
];
