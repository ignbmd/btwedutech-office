import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import Swal from "sweetalert2";
import { Edit, Trash2, Eye } from "react-feather";
import withReactContent from "sweetalert2-react-content";

import axios from "../utility/http";
import { showToast } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/location-data";

export const getCompetition = async () => {
  const response = await axios.get(`/competition-map/competition`);
  const data = response.data;
  return data?.data ?? [];
};

export let data = initialDatatables;

const MySwal = withReactContent(Swal);

const deleteCompetition = async (id) => {
  try {
    const url = `/competition-map/competition/${id}`;
    const response = await axios.delete(url);
    const result = await response.data;

    if (result.success) {
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Data kompetisi berhasil dihapus",
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
  deleteCompetition(id);
};

export const columns = [
  {
    name: "No",
    sortable: true,
    center: true,
    maxWidth: "50px",
    selector: "no",
  },
  {
    name: "Nama Prodi",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "study_program.name",
  },
  {
    name: "Sekolah",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "study_program.school.name",
  },
  {
    name: "Lokasi",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "location.name",
  },
  {
    name: "Tahun",
    wrap: true,
    sortable: false,
    selector: "year",
    style: { height: "unset !important" },
  },
  {
    name: "Kuota",
    wrap: true,
    sortable: false,
    selector: "quota",
    style: { height: "unset !important" },
  },
  {
    name: "Terdaftar",
    wrap: true,
    sortable: false,
    selector: "registered",
    style: { height: "unset !important" },
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
            <DropdownItem
              href={`/peta-persaingan/kompetisi/edit/${row.id}`}
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
