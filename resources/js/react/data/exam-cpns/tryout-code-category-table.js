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
  
  import axios from "../../utility/http";
  import { showToast } from "../../utility/Utils";
  import { initialDatatables } from "../../api/datatables/tryout-code-category-data";
  
  export const getTryoutCodeCategories = async () => {
    const response = await axios.get(`/exam-cpns/tryout-code-category/all`);
    const data = response.data;
    return data?.data ?? [];
  };
  
  export let data = initialDatatables;
  
  const MySwal = withReactContent(Swal);
  
  const deleteTryoutCodeCategory = async (id) => {
    try {
      const url = `/exam-cpns/tryout-code/${id}`;
      const response = await axios.delete(url);
      const result = await response.data;
  
      if (result.success) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Kategori tryout kode berhasil dihapus",
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
    deleteTryoutCodeCategory(id);
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
      name: "Nama Kategori Tryout Kode",
      grow: 2,
      wrap: true,
      sortable: false,
      selector: "name",
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
                href={`/ujian-cpns/kategori-tryout-kode/edit/${row.id}`}
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
  