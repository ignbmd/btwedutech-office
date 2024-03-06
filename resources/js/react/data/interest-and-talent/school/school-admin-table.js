import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { deleteSchoolAdmin } from "./school-data";
import { showToast } from "../../../utility/Utils";

const actionElement = (id) => {
  const dom = document.querySelector(`#action-${id}`);
  return dom;
};

const MySwal = withReactContent(Swal);
export const confirmDelete = async (school_id, school_admin_id) => {
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
  const actionButton = actionElement(school_admin_id);
  actionButton.innerHTML = "Menghapus..";
  actionButton.disabled = true;
  const deleteAdmin = await deleteSchoolAdmin(school_id, school_admin_id);
  if (deleteAdmin?.success) {
    showToast({
      type: "success",
      title: "Berhasil",
      message: "Data admin sekolah berhasil dihapus",
    });
    window.location.reload();
  } else {
    console.error(error);
    showToast({
      type: "error",
      title: "Terjadi kesalahan",
      message: "Proses gagal, silakan coba lagi nanti",
    });
  }
};

export const columns = [
  {
    name: "No",
    sortable: false,
    center: true,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Nama",
    wrap: true,
    center: true,
    sortable: false,
    selector: "name",
  },
  {
    name: "Username",
    wrap: true,
    center: true,
    sortable: false,
    selector: "username",
  },
  {
    name: "Email",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "email",
  },
  {
    name: "No Whatsapp",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "phone",
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    style: { height: "unset !important" },
    selector: (row) => (
      <div className="d-flex">
        <button
          id={`action-${row.id}`}
          className="btn btn-outline-danger btn-sm"
          onClick={() => confirmDelete(row.school_id, row.id)}
        >
          Hapus Akun
        </button>
      </div>
    ),
  },
];
