import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, Trash2 } from "react-feather";
import { initialDatatables } from "../api/datatables/package-data";
import { showToast } from "../utility/Utils";
import axios from "../utility/http";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export const getPreTestPackages = async () => {
  const response = await axios.get("/exam/pre-test-package");
  return response?.data ?? [];
};

const MySwal = withReactContent(Swal);
// const confirmDelete = async (id) => {
//   const state = await MySwal.fire({
//     title: "Apakah anda yakin ingin menghapus data ini?",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonText: "Ya",
//     cancelButtonText: "Tidak",
//     customClass: {
//       confirmButton: "btn btn-danger",
//       cancelButton: "btn btn-outline-secondary ml-1",
//     },
//     buttonsStyling: false,
//   });
//   if (state.isDismissed) return;
//   deletePackage(id);
// };

// const deletePackage = async (id) => {
//   try {
//     const url = `/exam/package/${id}`;
//     const response = await axios.delete(url);
//     const result = await response.data;

//     if (result.success) {
//       showToast({
//         type: "success",
//         title: "Berhasil",
//         message: "Data paket berhasil dihapus",
//       });
//       setTimeout(() => {
//         window.location.href = "/ujian/paket-soal";
//       }, 2000);
//     } else {
//       showToast({
//         type: "error",
//         title: "Terjadi kesalahan",
//         message: "Proses gagal, silakan coba lagi nanti",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     showToast({
//       type: "error",
//       title: "Terjadi kesalahan",
//       message: "Proses gagal, silakan coba lagi nanti",
//     });
//   }
// };

export let data = initialDatatables;

export const columns = [
  {
    name: "No",
    center: true,
    sortable: false,
    maxWidth: "80px",
    selector: "no",
  },
  {
    name: "Judul Paket Modul",
    grow: 3,
    wrap: true,
    sortable: false,
    center: true,
    style: { height: "unset !important" },
    selector: "title",
  },
  {
    name: "Modul",
    grow: 2,
    wrap: true,
    center: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ modules }) => {
      return (
        <Badge color="light-primary" pill>
          {modules.module_code}
        </Badge>
      );
    },
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
            className="btn-gradient-primary"
            color="none"
            size="sm"
            caret
          >
            Pilihan
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem href={`/ujian/paket-pre-test/edit/${row.id}`} tag="a">
              <Edit size={15} className="mr-50" /> Edit
            </DropdownItem>
            {/* <DropdownItem onClick={() => confirmDelete(row.id)} tag="a" className="text-danger">
              <Trash2 size={15} className="mr-50" /> Delete
            </DropdownItem> */}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
      </div>
    ),
  },
];
