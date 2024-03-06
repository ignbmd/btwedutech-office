import { Badge } from "reactstrap";
import { ZoomIn } from "react-feather";

import { priceFormatter } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/stakes-data";

export const getCentralDebts = async () => {
  const response = await axios.get('/api/finance/pay-and-bill/central/piutang');
  const data = response.data;
  return data?.data ?? [];
}

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
    name: "Kode Akun",
    center: true,
    sortable: false,
    selector: "account_code",
  },
  {
    name: "Nama Cabang",
    minWidth: '30%',
    selector: "branch_name",
    center: true,
    sortable: true,
    selector: ({ branch_name }) => (
      branch_name ? branch_name : 'Loading...'
    )
  },
  {
    name: "Jumlah Hutang",
    minWidth: '30%',
    center: true,
    sortable: false,
    selector: ({ amount }) => (
      <Badge color="warning" pill>
        {priceFormatter(amount)}
      </Badge>
    ),
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    selector: (row) => (
      <a
        href={`/bayar-dan-tagih/bayar/cabang/${row.branch_code}?account_id=${row.account_id}`}
        className="py-50 btn btn-sm bg-gradient-primary"
      >
        <ZoomIn size={14} /> Lihat Detail
      </a>
    ),
  },
];
