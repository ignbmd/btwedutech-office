import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, Eye, Trash2 } from "react-feather";

import axios from "axios";
import { priceFormatter, getUserBranchCode, showToast } from "../utility/Utils";

import moment from "moment-timezone";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { nanoid } from "nanoid";

const MySwal = withReactContent(Swal);
const userBranchCode = getUserBranchCode();

const getDiscountCodeId = () => {
  const pathname = window.location.pathname;
  const segments = pathname.split("/");
  const secondSegment = segments[2];
  return secondSegment;
};

export const getDiscountCode = async () => {
  const url =
    userBranchCode === "PT0000"
      ? "/api/discount-code"
      : `/api/discount-code/identifier/${userBranchCode}`;
  const response = await axios.get(url);
  const data = response.data;
  return data?.data ?? [];
};

export const getDiscountCodeUsage = async () => {
  const response = await axios.get(
    `/api/discount-code/${getDiscountCodeId()}/usages`
  );
  const data = response.data;
  return data?.data ?? [];
};

const deleteDiscountCode = async (id) => {
  try {
    const url = `/api/discount-code/${id}`;
    const response = await axios.delete(url);
    const result = await response.data;

    if (result.success) {
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Kode diskon berhasil dihapus",
      });
      window.location.reload();
    } else {
      showToast({
        type: "error",
        title: "Terjadi kesalahan",
        message: "Proses gagal, silakan coba lagi nanti",
      });
    }
  } catch (error) {
    console.log(error);
    showToast({
      type: "error",
      title: "Terjadi kesalahan",
      message: "Proses gagal, silakan coba lagi nanti",
    });
  }
};

const actionElement = (id) => {
  const dom = document.querySelector(`#action-${id}`);
  return dom;
};

export const confirmDelete = async (id) => {
  const state = await MySwal.fire({
    title: "Apakah anda yakin ingin menghapus data ini?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    customClass: {
      confirmButton: "btn btn-danger",
      cancelButton: "btn btn-outline-secondary ml-1",
    },
    buttonsStyling: false,
  });
  if (state.isDismissed) return;
  const actionButton = actionElement(id);
  actionButton.innerHTML = "Menghapus..";
  actionButton.disabled = true;
  deleteDiscountCode(id);
};

export let data = {};

export const canShowDiscountCodeUsage = () => {
  const dom = document.getElementById("canShowDiscountCodeUsage");
  return dom.innerText == "1";
};

export const canCreateDiscountCode = () => {
  const dom = document.getElementById("canCreateDiscountCode");
  return dom.innerText == "1";
};

export const canEditDiscountCode = () => {
  const dom = document.getElementById("canEditDiscountCode");
  return dom.innerText == "1";
};

export const canDeleteDiscountCode = () => {
  const dom = document.getElementById("canDeleteDiscountCode");
  return dom.innerText == "1";
};

export const columns = [
  {
    name: "No",
    sortable: false,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Kode Diskon",
    wrap: true,
    sortable: false,
    selector: "code",
  },
  {
    name: "Tipe Penggunaan",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ identifier_type, usage_type }) =>
      identifier_type == "AFFILIATE" ? identifier_type : usage_type || "-",
  },
  {
    name: "Penggunaan Maksimal",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ max_usage }) => {
      return max_usage === 0 ? "-" : `${max_usage} kali`;
    },
  },
  {
    name: "Nominal Diskon",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ amount, amount_type }) => {
      return amount_type === "PERCENT"
        ? `${amount}%`
        : `${priceFormatter(amount)}`;
    },
  },
  {
    name: "Tanggal Kadaluarsa",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ expired_at }) => {
      return expired_at ? moment.utc(expired_at).format("YYYY-MM-DD") : "-";
    },
  },
  {
    name: "Bisa Digunakan Admin",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "system_only",
    cell: (row) =>
      row.system_only ? "Tidak bisa digunakan" : "Bisa digunakan",
  },
  {
    name: "Tag",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "tags",
    cell: (row) => (
      <div>
        {row.tags && row.tags.length > 0 ? (
          row.tags.map((tag, _) => (
            <Badge key={nanoid()} className="badge badge-info mr-25 mb-25">
              {tag}
            </Badge>
          ))
        ) : (
          <p>Tidak Ada Tag</p>
        )}
      </div>
    ),
  },
  {
    name: "Kode Cabang",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ identifier, identifier_type }) => {
      return ["CENTRAL", "BRANCH"].includes(identifier_type) ? identifier : "-";
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
            {canShowDiscountCodeUsage() ? (
              <>
                <DropdownItem
                  href={`/kode-diskon/${row.id}/penggunaan`}
                  tag="a"
                >
                  <Eye size={15} className="mr-50" />
                  Riwayat Penggunaan Kode Diskon
                </DropdownItem>
              </>
            ) : null}
            {canShowDiscountCodeUsage() &&
            (canEditDiscountCode() || canDeleteDiscountCode()) ? (
              <div className="dropdown-divider"></div>
            ) : null}
            {canEditDiscountCode() && row?.identifier_type !== "AFFILIATE" ? (
              <>
                <DropdownItem href={`/kode-diskon/${row.id}/edit`} tag="a">
                  <Edit size={15} className="mr-50" /> Edit
                </DropdownItem>
              </>
            ) : null}
            {canDeleteDiscountCode() && row?.identifier_type !== "AFFILIATE" ? (
              <>
                <DropdownItem
                  onClick={() => confirmDelete(row.id)}
                  tag="a"
                  className="text-danger"
                >
                  <Trash2 size={15} className="mr-50" /> Delete
                </DropdownItem>
              </>
            ) : null}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </div>
    ),
  },
];

export const discountCodeUsageColumns = [
  {
    name: "No",
    sortable: false,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Nama Siswa",
    wrap: true,
    sortable: false,
    selector: "bill_to",
  },
  {
    name: "Email Siswa",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "email",
  },
  {
    name: "Judul Transaksi",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ id, title }) => {
      return <a href={`/tagihan/detail/${id}`}>{title}</a>;
    },
  },
  {
    name: "Tanggal Transaksi",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ created_at }) => {
      return moment(created_at).format("YYYY-MM-DD HH:mm:ss");
    },
  },
];
