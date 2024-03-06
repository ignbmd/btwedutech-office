import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, Eye, CheckSquare } from "react-feather";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

import { showToast } from "../utility/Utils";

import axios from "axios";

export const getAffiliates = async () => {
  const response = await axios.get("/api/affiliates");
  const data = response.data;
  return data?.data ?? [];
};

const MySwal = withReactContent(Swal);

const verifiedStatus = {
  VERIFIED: "Sudah Terverifikasi",
  PENDING: "Menunggu Diverifikasi",
  REJECTED: "Verifikasi Ditolak",
  NOT_VERIFIED: "Tidak Terverifikasi",
};

const handleUplinerDraft = async (row) => {
  const state = await MySwal.fire({
    title: `Apakah anda yakin ingin menjadikan ${row.name} sebagai Upliner?`,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    customClass: {
      confirmButton: "btn btn-danger",
      cancelButton: "btn btn-outline-secondary ml-1",
    },
    buttonsStyling: false,
  });
  if (state.isConfirmed) {
    try {
      const response = await axios.post(
        `/api/affiliates/update-to-upliner/${row.id}`
      );
      if (response.data.success) {
        showToast({
          type: "success",
          title: "Berhasil Menjadi Upliner",
          message: "Berhasil Menjadi Upliner",
        });
      } else {
        showToast({
          type: "error",
          title: "Terjadi Kesalahan",
          message: "Gagal Menjadi Upliner",
        });
      }
    } catch (error) {
      console.error(`Terjadi kesalahan: ${error.message}`);
    }
  } else if (state.isDismissed) {
    return;
  }
};

// Fungsi utilitas untuk mendapatkan varian Badge berdasarkan status
function getBadgeVariant(status) {
  switch (status) {
    case "VERIFIED":
      return "success";
    case "PENDING":
      return "warning";
    case "REJECTED":
      return "danger";
    case "NOT_VERIFIED":
      return "secondary";
    default:
      return "primary";
  }
}

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
    name: "Kode Referal",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: (row) => (row.ref_code ? row.ref_code : "-"),
  },
  {
    name: "Tipe",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: (row) => (row.is_upliner ? "UPLINER" : "DOWNLINER"),
  },
  {
    name: "Upliner",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ upliner_name }) => upliner_name || "-",
  },
  {
    name: "Status",
    wrap: true,
    sortable: true,
    style: { height: "unset !important" },
    selector: (row) => {
      const variant = getBadgeVariant(row.verified_status);

      return (
        <Badge color={variant} className="rounded-pill">
          {verifiedStatus[row.verified_status]}
        </Badge>
      );
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
            <DropdownItem href={`/mitra/${row.id}/wallet`} tag="a">
              <Eye size={15} className="mr-50" />
              Lihat Wallet
            </DropdownItem>
            <DropdownItem href={`/mitra/${row.id}/riwayat-transaksi`} tag="a">
              <Eye size={15} className="mr-50" />
              Lihat Riwayat Transaksi
            </DropdownItem>
            {row.is_verified || row.verified_status === "NOT_VERIFIED" ? (
              ""
            ) : (
              <DropdownItem href={`/mitra/${row.sso_id}/verifikasi`} tag="a">
                <CheckSquare size={15} className="mr-50" />
                Verifikasi Akun Mitra
              </DropdownItem>
            )}
            {row.is_upliner || !row.is_verified ? (
              ""
            ) : (
              <DropdownItem onClick={() => handleUplinerDraft(row)} tag="a">
                <CheckSquare size={15} className="mr-50" />
                Jadikan Upliner
              </DropdownItem>
            )}
            <div className="dropdown-divider"></div>
            <DropdownItem href={`/mitra/${row.sso_id}/edit`} tag="a">
              <Edit size={15} className="mr-50" /> Edit
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </div>
    ),
  },
];
