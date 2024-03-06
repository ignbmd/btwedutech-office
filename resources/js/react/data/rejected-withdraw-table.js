import moment from "moment-timezone";

export const getRejectedWithdraws = async () => {
  const response = await axios.get("/api/withdraw?status=REJECTED");
  const data = response.data;
  return data?.data ?? [];
};

export let data = {};

export const columns = [
  {
    name: "No",
    sortable: false,
    maxWidth: "80px",
    selector: (row, index) => {
      return index + 1;
    },
  },
  {
    name: "Nama",
    sortable: false,
    wrap: true,
    selector: "affiliate.name",
  },
  {
    name: "Email",
    sortable: false,
    wrap: true,
    selector: "affiliate.email",
  },
  {
    name: "Nominal",
    sortable: false,
    wrap: true,
    cell: (row) => {
      const formattedAmount = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(row.amount);
      return formattedAmount;
    },
  },
  {
    name: "Tanggal Withdraw",
    sortable: false,
    wrap: true,
    selector: (row) =>
      row.created_at
        ? `${moment(row.created_at)
            .tz("Asia/Jakarta")
            .format("DD/MM/YYYY - HH:mm")} WIB`
        : "-",
  },
  {
    name: "Alasan Withdraw Ditolak",
    wrap: true,
    style: { height: "unset !important" },
    selector: "reason",
  },
];
