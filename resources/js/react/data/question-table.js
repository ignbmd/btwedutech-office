import {
  Badge,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { Edit, GitPullRequest, Trash2, ZoomIn } from "react-feather";

import axios from "../utility/http";
import { initialDatatables } from "../api/datatables/question-data";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { showToast } from "../utility/Utils";
import CKEditorParser from "../components/core/parser/CKEditorParser";

export const getQuestions = async ({
  pages,
  limit,
  search = "",
  type = "",
}) => {
  try {
    const response = await axios.get(
      `/exam/question?search=${search}&limit=${limit}&pages=${pages}&type=${type}`
    );
    const data = response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getQuestionBySearch = async ({ pages, limit, search = "" }) => {
  try {
    const response = await axios.get(
      `/exam/question?search_id=${search}&limit=${limit}&pages=${pages}`
    );
    const data = response.data;
    return data;
  } catch (error) {
    throw error;
  }
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
  actionButton.innerHTML = "Menghapus..";
  actionButton.disabled = true;
  deleteQuestion(id);
};

const deleteQuestion = async (id) => {
  try {
    const url = `/exam/question/${id}`;
    const response = await axios.delete(url);
    const result = await response.data;

    if (result.success) {
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Data pertanyaan berhasil dihapus",
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
    name: "ID",
    sortable: false,
    center: true,
    maxWidth: "80px",
    selector: ({ id }) => <Badge color="light-primary">{id}</Badge>,
  },
  {
    name: "Pertanyaan",
    grow: 2,
    wrap: true,
    sortable: false,
    style: { height: "unset !important" },
    selector: ({ question }) => <CKEditorParser mString={question} />,
  },
  {
    name: "Kategori",
    wrap: true,
    sortable: true,
    selector: ({ question_categories, program }) => (
      <>
        <Badge className="mr-25" color="light-primary">
          {program}
        </Badge>
        {question_categories?.category ?? "-"}
      </>
    ),
    style: { height: "unset !important" },
  },
  {
    name: "Sub Kategori",
    sortable: false,
    selector: ({ sub_category_questions }) =>
      sub_category_questions?.title ?? "-",
    wrap: true,
    style: { height: "unset !important" },
  },
  {
    name: "Tipe Soal",
    sortable: false,
    selector: "question_type",
    wrap: true,
    style: { height: "unset !important" },
    selector: ({ question_type, child_questions }) => {
      if (question_type === "PARENT") {
        if (child_questions.length == 0) {
          return (
            <>
              <Badge color="info">Induk Soal</Badge>{" "}
              <Badge className="mt-25" color="light-danger">
                Belum Berelasi
              </Badge>
            </>
          );
        } else {
          return (
            <>
              <Badge color="info">Induk Soal</Badge>{" "}
              <Badge className="mt-25" color="light-success">
                {child_questions.length} anak soal
              </Badge>
            </>
          );
        }
      } else if (question_type === "CHILD") {
        return <Badge color="success">Anak Soal</Badge>;
      } else if (question_type === "STANDALONE") {
        return <Badge color="primary">Soal Biasa</Badge>;
      }
    },
  },
  {
    name: "Tag",
    wrap: true,
    sortable: false,
    grow: 1,
    style: { height: "unset !important" },
    selector: ({ tags }) => {
      return tags.map((tag) => (
        <>
          <Badge
            className="mt-25 badge-nowrap"
            color="light-success"
            title={tag}
          >
            {tag}
          </Badge>{" "}
        </>
      ));
    },
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
            <DropdownItem href={`/ujian/bank-soal/detail/${row.id}`} tag="a">
              <ZoomIn size={15} className="mr-50" /> Lihat Detail
            </DropdownItem>
            {row.question_type == "PARENT" && (
              <>
                <DropdownItem
                  href={`/ujian/bank-soal/connect/${row.id}`}
                  tag="a"
                >
                  <GitPullRequest size={15} className="mr-50" /> Hubungkan Soal
                </DropdownItem>
              </>
            )}
            <DropdownItem divider />
            <DropdownItem href={`/ujian/bank-soal/edit/${row.id}`} tag="a">
              <Edit size={15} className="mr-50" /> Edit Soal
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
