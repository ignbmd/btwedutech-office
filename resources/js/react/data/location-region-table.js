import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import Swal from "sweetalert2";
import { Edit, Trash2 } from "react-feather";
import withReactContent from "sweetalert2-react-content";

import axios from "../utility/http";
import { getLastSegment, showToast } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/location-data";

export const getLocation = async () => {
  const parent_id = getLastSegment();
  const response = await axios.get(`/competition-map/location/location-parent/${parent_id}`);
  const data = response.data;
  return data?.data ?? [];
};

export let data = initialDatatables;

const MySwal = withReactContent(Swal);

const deleteLocation = async (id) => {
  try {
    const url = `/competition-map/location/${id}`;
    const response = await axios.delete(url);
    const result = await response.data;

    if (result.success) {
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Lokasi berhasil dihapus",
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
  deleteLocation(id);
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
    name: "Nama",
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "name",
  },
  {
    name: "Tipe",
    wrap: true,
    sortable: false,
    selector: "type",
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
              href={`/peta-persaingan/lokasi/edit/${row.id}`}
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
