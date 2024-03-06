import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Trash2, ZoomIn } from "react-feather";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import axios from "../utility/http";
import { showToast } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/tryout-free-data";
import moment from "moment-timezone";

export const getTryoutFree = async () => {
  const response = await axios.get(`/exam/tryout-free/all`);
  const data = response.data;
  return data?.data ?? [];
};

export let data = initialDatatables;

const MySwal = withReactContent(Swal);

const deleteTryoutFree = async (id) => {
  try {
    const url = `/exam/tryout-free/${id}`;
    const response = await axios.delete(url);
    const result = await response.data;

    if (result.success) {
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Tryout gratis berhasil dihapus",
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
  deleteTryoutFree(id);
};

export const columns = [
  {
    name: "No",
    sortable: false,
    center: false,
    maxWidth: "40px",
    selector: "no",
  },
  {
    name: "Nama Tryout",
    grow: 2,
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ start_date, end_date, title }) => {
      const nowDate = moment().format("l");
      const startDate = moment(moment(start_date)).format("l");
      const endDate = moment(moment(end_date)).format("l");
      return (
        <>
          {title}{" "}
          <div className="mt-25">
            {startDate <= nowDate && endDate >= nowDate ? (
              <Badge color="light-success">OPEN</Badge>
            ) : (
              <Badge color="light-danger">CLOSED</Badge>
            )}
          </div>
        </>
      );
    },
  },
  {
    name: "Pendaftaran Dibuka",
    grow: 1,
    wrap: true,
    center: false,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ start_date }) => {
      return start_date
        ? `${moment(start_date).utcOffset("+0700").format("DD MMM YYYY")}`
        : "-";
    },
  },
  {
    name: "Pendaftaran Ditutup",
    grow: 1,
    wrap: true,
    center: false,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ end_date }) => {
      return end_date
        ? `${moment(end_date).utcOffset("+0700").format("DD MMM YYYY")}`
        : "-";
    },
  },
  {
    name: "Kode Cabang",
    wrap: true,
    center: false,
    sortable: false,
    style: { height: "unset !important" },
    selector: "branch_code",
  },
  {
    name: "Status",
    grow: 1,
    wrap: true,
    center: false,
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
    name: "Jumlah Sesi",
    wrap: true,
    center: false,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ tryout_clusters }) => {
      return `${tryout_clusters.length} Sesi`;
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
              href={`/ujian/tryout-gratis/detail/${row.id}`}
              tag="a"
            >
              <ZoomIn size={15} className="mr-50" /> Lihat Detail
            </DropdownItem>
            <DropdownItem divider />
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
