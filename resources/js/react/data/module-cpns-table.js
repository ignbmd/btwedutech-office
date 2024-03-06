import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, Trash2 } from "react-feather";

import axios from "../utility/http";
import { showToast } from "../utility/Utils";
import { initialDatatables } from "../api/datatables/module-data";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

export const getModules = async ({ pages, limit, search = "" }) => {
  try {
    const response = await axios.get(
      `/exam-cpns/module?search=${search}&limit=${limit}&pages=${pages}`
    );
    const data = response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

const MySwal = withReactContent(Swal);
const confirmDelete = async (id) => {
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
  deleteModule(id);
};

const deleteModule = async (id) => {
  try {
    const url = `/exam-cpns/module/${id}`;
    const response = await axios.delete(url);
    const result = await response.data;

    if (result.success) {
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Data modul berhasil dihapus",
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
    name: "Kode Modul",
    grow: 1.5,
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ module_code }) => {
      return <Badge color="success">{module_code}</Badge>;
    },
  },
  {
    name: "Nama Modul",
    grow: 2,
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: "name",
  },
  {
    name: "Program",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ program }) => {
      return <Badge color="light-success">{program}</Badge>;
    },
  },
  {
    name: "Total Soal",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ question_count }) => {
      return <Badge color="light-success">{question_count}</Badge>;
    },
  },
  {
    name: "Akses Cabang",
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ allowed_branch }) => {
      return (
        <>
          {allowed_branch ? (
            <Badge color="light-success">Ya</Badge>
          ) : (
            <Badge color="light-danger">Tidak</Badge>
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
              href={`/ujian-cpns/modul/pratinjau-soal/${row.module_code}`}
              tag="a"
            >
              <img
                src="https://btw-cdn.com/assets/btw-edutech/logo/btw-edutech-logo.svg"
                alt="Smart BTW Icon"
                width={16}
                className="mr-50"
              />{" "}
              Pratinjau Soal
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem
              href={`/ujian-cpns/modul/edit/${row.module_code}`}
              tag="a"
            >
              <Edit size={15} className="mr-50" /> Edit
            </DropdownItem>
            {/* <DropdownItem
              onClick={() => confirmDelete(row.id)}
              tag="a"
              className="text-danger"
            >
              <Trash2 size={15} className="mr-50" /> Delete
            </DropdownItem> */}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </div>
    ),
  },
];
