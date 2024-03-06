import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Download, Edit, Trash2 } from "react-feather";
import { initialDatatables } from "../api/datatables/study-material-document-data";
import { showToast, getLastSegment } from "../utility/Utils";
import axios from "../utility/http";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import CKEditorParser from "../components/core/parser/CKEditorParser";
import { Fragment } from "react";

export const getStudyMaterialDocument = async () => {
  const response = await axios.get(
    `/exam-cpns/study-material/${getLastSegment()}/documents`
  );
  return response?.data ?? [];
};

// const MySwal = withReactContent(Swal);
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

//     if(result.success) {
//       showToast({
//         type: 'success',
//         title: 'Berhasil',
//         message: 'Data paket berhasil dihapus'
//       });
//       setTimeout(() => {
//         window.location.href = "/ujian/paket-soal";
//       }, 2000);
//     } else {
//       showToast({
//         type: 'error',
//         title: 'Terjadi kesalahan',
//         message: 'Proses gagal, silakan coba lagi nanti'
//       });
//     }
//   } catch(error) {
//     console.log(error);
//     showToast({
//       type: 'error',
//       title: 'Terjadi kesalahan',
//       message: 'Proses gagal, silakan coba lagi nanti'
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
    name: "Nama Dokumen",
    grow: 2,
    wrap: true,
    sortable: false,
    selector: "name",
  },
  {
    name: "Tipe Dokumen",
    wrap: true,
    grow: 1,
    sortable: false,
    selector: "type",
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
            {row?.path && row?.path !== "-" ? (
              <DropdownItem href={row.path} tag="a">
                <Download size={15} className="mr-50" /> Unduh Materi Belajar
              </DropdownItem>
            ) : null}
            <DropdownItem
              href={`/ujian-cpns/materi-belajar/dokumen/${getLastSegment()}/edit/${
                row.id
              }`}
              tag="a"
            >
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
