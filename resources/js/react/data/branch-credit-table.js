import { ExternalLink, ZoomIn } from "react-feather";
import {
  Badge,
  Button
} from "reactstrap";

import { priceFormatter } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/branch-credit-data";

export const getBranchReceivable = async () => {
  const response = await axios.get('/api/finance/pay-and-bill/branch-receivable');
  const data = response.data;
  return data?.data ?? {};
}

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
    name: "Tanggal Pembayaran",
    minWidth: "30%",
    center: true,
    sortable: true,
    selector: ({ created_at }) =>
      `${moment(created_at)
        .utcOffset("+0700")
        .format("DD MMMM YYYY • HH:mm")} WIB`,
  },
  {
    name: "Metode Pembayaran",
    center: true,
    sortable: true,
    selector: ({ payment_method }) => {
      return payment_method ?? '-';
    },
  },
  {
    name: "Dibuat Oleh",
    center: true,
    sortable: true,
    selector: "created_by"
  },
  {
    name: "Bukti Pembayaran",
    center: true,
    allowOverflow: true,
    selector: ({ proof_file }) =>
      proof_file ? (
        <a target="_blank" rel="noreferrer" href={proof_file}>
          <Badge className="cursor-pointer">
            <ExternalLink size={14} /> Lihat
          </Badge>
        </a>
      ) : (
        <Badge color="light-secondary">-</Badge>
      ),
  },
];
