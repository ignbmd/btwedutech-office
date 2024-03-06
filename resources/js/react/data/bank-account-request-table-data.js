import axios from "axios";

export const getBankAccountUpdateRequests = async () => {
  const response = await axios.get(
    `/api/affiliates/bank-account-update-requests`
  );
  const data = response.data;
  return data?.data ?? [];
};

export let data = {};

export const columns = [
  {
    name: "No",
    sortable: false,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Nama",
    wrap: true,
    sortable: false,
    selector: "name",
  },
  {
    name: "Email",
    wrap: true,
    sortable: false,
    selector: "email",
  },
  {
    name: "Tipe Bank",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "bank_type",
  },
  {
    name: "No. Rekening Bank",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "bank_number",
  },
  {
    name: "Foto Rekening Bank",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ bank_photo }) => {
      return bank_photo ? (
        <div className="d-flex">
          <a
            href={bank_photo}
            className="btn btn-outline-primary btn-sm"
            target="_blank"
          >
            Lihat Foto
          </a>
        </div>
      ) : (
        "-"
      );
    },
  },
  {
    name: "Aksi",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ affiliate_id }) => {
      return (
        <div className="d-flex">
          <a
            className="btn btn-primary btn-sm"
            href={`/mitra/akun-bank/request-update-rekening/${affiliate_id}/proses`}
          >
            Proses
          </a>
        </div>
      );
    },
  },
];
