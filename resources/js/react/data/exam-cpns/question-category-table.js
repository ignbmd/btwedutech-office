import {
    Badge,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, Trash2 } from "react-feather";

import axios from "../../utility/http";
import { initialDatatables } from "../../api/datatables/instruction-data";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
// import { showToast } from "../utility/Utils";
import { showToast } from "../../utility/Utils";

export const getQuestionCategory = async () => {
    const response = await axios.get(`/exam-cpns/question-category`);
    const data = response.data;
    return data?.data ?? [];
};

const MySwal = withReactContent(Swal);
export const confirmDelete = async (id) => {
    const state = await MySwal.fire({
        title: "Apakah anda yakin menghapus data ini ?",
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
  deleteQuestion(id);
};

const deleteQuestion = async (id) => {
    try{
        const url = `/exam-cpns/question-category/${id}`;
        const response = await axios.delete(url);
        const result = await response.data;

        if(result.success){
            showToast({
                type: "success",
                title: "Berhasil",
                message: "Data kategori soal CPNS berhasil dihapus",
            });
            window.location.reload();
        }else {
            showToast({
                type: "error",
                title: "Gagal",
                message: "Data kategori soal CPNS gagal dihapus",
            });
        }
    }catch(error){
        const actionButton = actionElement(id);
        actionButton.innerHTML = 'Pilihan';
        actionButton.disabled = false;
        console.log(error);
        showToast({
            type: "error",
            title: "Terjadi kesalahan",
            message: "Data kategori soal CPNS gagal dihapus",
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
      name: "Nama Kategori",
      grow: 2,
      wrap: true,
      sortable: false,
      selector: "category",
    },
    {
      name: "Deskripsi",
      grow: 2,
      wrap: true,
      sortable: false,
      selector: "description",
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
      name: "Passing Grade",
      grow: 2,
      wrap: true,
      sortable: false,
      style: { height: "unset !important" },
      selector: ({ passing_grade }) => {
        return passing_grade;
      },
    },
    {
      name: "Urutan Kategori",
      grow: 2,
      wrap: true,
      sortable: false,
      style: { height: "unset !important" },
      selector: ({ default_position }) => {
        return default_position;
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
            <DropdownItem href={`/ujian-cpns/kategori-soal/edit/${row.id}`} tag="a">
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
      ),
    },
  ];