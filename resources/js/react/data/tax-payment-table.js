import moment from "moment-timezone";
import "moment/locale/id";
moment.locale("id");

export const getPendingTaxPayment = async () => {
  const response = await axios.get("/api/tax-payment?status=PENDING");
  const data = response.data;
  return data?.data ?? [];
};

export const getProcessedTaxPayment = async () => {
  const response = await axios.get("/api/tax-payment?status=COMPLETE");
  const data = response.data;
  return data?.data ?? [];
};

export let data = {};

export const pendingTaxPaymentColumns = [
  {
    name: "No",
    sortable: false,
    maxWidth: "80px",
    selector: (_, index) => {
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
    name: "Periode Pajak",
    sortable: false,
    wrap: true,
    center: true,
    selector: (row) => {
      const taxDate = row.tax_date;
      if (taxDate) {
        const formattedDate = moment(taxDate).tz("Asia/Jakarta");
        const monthName = formattedDate.format("MMMM"); // Mengambil nama bulan
        const year = formattedDate.format("YYYY"); // Mengambil tahun
        return `${monthName} ${year}`;
      } else {
        return "-";
      }
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    style: { height: "unset !important" },
    cell: (row) => (
      <a
        href={`pembayaran-pajak/${row.id}/proses`}
        className="btn btn-primary btn-sm"
      >
        Proses
      </a>
    ),
  },
];

export const processedTaxPaymentColumns = [
  {
    name: "No",
    sortable: false,
    maxWidth: "80px",
    selector: (_, index) => {
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
    name: "Periode Pajak",
    sortable: false,
    wrap: true,
    center: true,
    selector: (row) => {
      const taxDate = row.tax_date;
      if (taxDate) {
        const formattedDate = moment(taxDate).tz("Asia/Jakarta");
        const monthName = formattedDate.format("MMMM"); // Mengambil nama bulan
        const year = formattedDate.format("YYYY"); // Mengambil tahun
        return `${monthName} ${year}`;
      } else {
        return "-";
      }
    },
  },
  {
    name: "Diproses Pada",
    sortable: false,
    wrap: true,
    center: true,
    selector: (row) => {
      const updatedAt = row.updated_at;
      if (updatedAt) {
        return `${moment(updatedAt)
          .tz("Asia/Jakarta")
          .format("DD MMM YYYY • HH:mm")} WIB`;
      } else {
        return "-";
      }
    },
  },
  {
    name: "Foto Bukti Pembayaran Pajak",
    allowOverflow: true,
    style: { height: "unset !important" },
    cell: (row) => (
      <a
        href={row.tax_photo}
        className="btn btn-primary btn-sm"
        target="__blank"
      >
        Lihat Foto
      </a>
    ),
  },
];
