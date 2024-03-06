import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, Trash2 } from "react-feather";

import { initialDatatables } from "../api/datatables/cluster-tryout-free-data";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { getLastSegment, showToast } from "../utility/Utils";

export let data = initialDatatables;

const MySwal = withReactContent(Swal);

const deleteClusterTryoutFree = async (id) => {
  try {
    const url = `/api/exam/tryout-free/clusters/${id}`;
    const response = await axios.delete(url);
    const result = await response.data;

    if (result.success) {
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Sesi berhasil dihapus",
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

const idTryoutFree = getLastSegment();

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
  deleteClusterTryoutFree(id);
};

export const columns = [
  {
    name: "Judul",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "title",
  },
  {
    name: "Waktu Mulai",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ start_datetime }) => {
      return start_datetime != null
        ? `${moment(start_datetime)
            .utcOffset("+0700")
            .format("DD MMM YYYY • HH:mm")} WIB` ?? "-"
        : "-";
    },
  },
  {
    name: "Waktu Selesai",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ end_datetime }) => {
      return end_datetime != null
        ? `${moment(end_datetime)
            .utcOffset("+0700")
            .format("DD MMM YYYY • HH:mm")} WIB` ?? "-"
        : "-";
    },
  },
  {
    name: "Kapasitas Maksimal",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ max_capacity }) => (
      <Badge color="light-primary" pill>
        {max_capacity}
      </Badge>
    ),
  },
  {
    name: "Jumlah Pendaftar",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "tryout_participants",
    selector: ({ max_capacity, tryout_participants }) => (
      <Badge
        color={
          tryout_participants.length === max_capacity
            ? "light-danger"
            : "light-warning"
        }
        pill
      >
        {tryout_participants.length}
      </Badge>
    ),
  },
  {
    name: "Status",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ status }) => {
      return (
        <>
          {status ? (
            <Badge color="light-success">Aktif</Badge>
          ) : (
            <Badge color="light-danger">Tidak Aktif</Badge>
          )}
        </>
      );
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
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
            <DropdownItem
              href={`/ujian/tryout-gratis/${idTryoutFree}/edit-sesi/${row.id}`}
              tag="a"
            >
              <Edit size={15} className="mr-50" /> Edit
            </DropdownItem>
            <DropdownItem
              onClick={() => confirmDelete(row.id)}
              tag="a"
              className="text-danger"
            >
              <Trash2 size={15} className="mr-50" /> Delete
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </div>
    ),
  },
];
