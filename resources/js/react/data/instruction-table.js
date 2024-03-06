import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, Trash2 } from "react-feather";

import axios from "../utility/http";
import { initialDatatables } from "../api/datatables/instruction-data";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { showToast } from "../utility/Utils";
import CKEditorParser from "../components/core/parser/CKEditorParser";

export const getInstructions = async () => {
  const response = await axios.get(`/exam/instruction`);
  const data = response.data;
  return data?.data ?? [];
};

const MySwal = withReactContent(Swal);
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
  actionButton.innerHTML = 'Menghapus..';
  actionButton.disabled = true;
  deleteInstruction(id);
};

const deleteInstruction = async (id) => {
  try {
    const url = `/exam/instruction/${id}`;
    const response = await axios.delete(url);
    const result = await response.data;

    if (result.success) {
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Data instruksi berhasil dihapus",
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
}

export let data = initialDatatables;

export const columns = [
  {
    name: "No",
    sortable: false,
    center: true,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Judul",
    grow: 2,
    wrap: true,
    sortable: false,
    selector: "title",
  },
  {
    name: "Instruksi",
    grow: 2,
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ instruction }) => <CKEditorParser mString={instruction} />,
  },
  {
    name: "Program",
    grow: 2,
    wrap: true,
    center: true,
    sortable: false,
    selector: ({ program }) => {
      return <Badge color="light-success">{program.toUpperCase()}</Badge>;
    },
  },
  {
    name: "Aksi",
    center: true,
    allowOverflow: true,
    selector: (row) => (
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
          <DropdownItem href={`/ujian/instruksi/edit/${row.id}`} tag="a">
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
    ),
  },
];
