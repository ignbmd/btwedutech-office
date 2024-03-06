import { ZoomIn } from "react-feather";
import { Badge } from "reactstrap";

import { priceFormatter } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/branch-debt-data";

export const getBranchDebt = async () => {
  const response = await axios.get('/api/finance/pay-and-bill/branch-debt');
  const data = response.data;
  return data?.data ?? {};
}

export const getCentralReceivableHistory = async (status, config = {}) => {
  const filter = status ? { params: { status } } : {};
  const response = await axios.get(
    `/api/finance/pay-and-bill/central-collect-receivable-history`,
    {
      ...filter,
      ...config
    }
  );
  const data = response.data;
  return data?.data ?? [];
};

const getPaymentStatusConfig = (statusValue) => {
  const status = {
    OPEN: { label: "Belum Dibayar", color: "light-secondary" },
    WAITING: {
      label: "Menunggu Konfirmasi",
      color: "light-warning",
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
    sortable: false,
    selector: (row, index) => {
      return index + 1;
    },
  },
  {
    name: "Nominal",
    center: true,
    sortable: false,
    selector: ({ amount }) => `${priceFormatter(amount)}`,
  },
  {
    name: "Status",
    center: true,
    sortable: true,
    selector: ({ status }) => {
      const config = getPaymentStatusConfig(status);
      return <Badge color={config.color}>{config.label}</Badge>;
    },
  },
  {
    name: "Tanggal Penagihan",
    minWidth: "30%",
    center: true,
    sortable: true,
    selector: ({ created_at }) =>
      `${moment(created_at)
        .utcOffset("+0700")
        .format("DD MMMM YYYY • HH:mm")} WIB`,
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    selector: (row) =>
    row.status === "COMPLETED" || row.status === "REJECTED" ? (
        "-"
      ) : (
        <a
          href={`${window.location.href}/cabang/bayar/${row.id}`}
          className="btn btn-sm bg-gradient-primary"
        >
          <ZoomIn size={14} /> {row.status === "OPEN" ? "Bayar" : "Ubah"}
        </a>
      ),
  },
];
