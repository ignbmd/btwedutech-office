import { Fragment, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import DataTable from "react-data-table-component";
import axios from "axios";
import {
  Input,
  Label,
  Row,
  Col,
  Badge,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { ChevronDown, Edit, Trash2, ZoomIn } from "react-feather";

import {
  getUserAllowedRoleFromBlade,
  getUserFromBlade,
} from "../../utility/Utils";

const getLearningMaterial = async () => {
  try {
    const response = await axios.get("/api/learning/material");
    const data = await response.data;
    return data ?? [];
  } catch (error) {
    return [];
  }
};

const deleteLearningMaterial = async (id) => {
  try {
    const isConfirmed = confirm("Delete materi?");
    if (!isConfirmed) return;
    const response = await axios.delete(`/api/learning/material/${id}`);
    const data = await response.data;
    return data;
  } catch (error) {
    console.error(error);
  }
};

const MaterialTable = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [userRole] = useState(getUserAllowedRoleFromBlade());
  const [user] = useState(getUserFromBlade());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(async () => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setData(await getLearningMaterial());
    setIsLoading(false);
  };

  const onFilterData = () => {
    if (!searchValue.length) return;
    setFilteredData(
      data.filter((item) => {
        const key = searchValue.toLowerCase();
        const matchTitle = item?.title.toLowerCase().includes(key);
        const matchUser = item?.user?.name.toLowerCase().includes(key);
        const matchStatus = item?.status.toLowerCase().includes(key);
        const anyMatch = [matchTitle, matchUser, matchStatus].some(Boolean);
        return anyMatch;
      })
    );
  };

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onFilterData();
  };

  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };

  const handleDelete = async (id) => {
    const data = await deleteLearningMaterial(id);
    if (!data.success) {
      toastr.error("Gagal!", "Hapus Materi Gagal", {
        closeButton: true,
        tapToDismiss: false,
        timeOut: 3000,
      });
      return;
    }
    toastr.success("Sukses!", "Hapus Materi Sukses", {
      closeButton: true,
      tapToDismiss: false,
      timeOut: 3000,
    });
    await loadData();
    onFilterData();
  };

  const columns = [
    {
      name: "Judul",
      sortable: true,
      minWidth: "100px",
      selector: ({ title }) => (
        <div className="user-info text-truncate">
          <span className="d-block font-weight-bold text-truncate">
            {title}
          </span>
        </div>
      ),
    },
    {
      name: "Pembuat",
      selector: ({ user }) => user?.name,
      sortable: true,
    },
    {
      name: "Status",
      sortable: false,
      selector: ({ status }) => {
        return (
          <>
            <Badge
              color={status == "PUBLIC" ? "light-primary" : "light-warning"}
            >
              {status}
            </Badge>
          </>
        );
      },
    },
    {
      name: "Jumlah File",
      sortable: false,
      selector: ({ attachments }) => (attachments ?? []).length,
    },
    {
      name: "Actions",
      allowOverflow: true,
      selector: (row) => {
        const isMine = user?.id == row?.sso_id;
        const isAdmin = ["admin"].some((r) => user.roles.includes(r));
        const isPossible = isMine;
        return (
          <div className="d-flex">
            <UncontrolledButtonDropdown>
              <DropdownToggle
                className="btn-gradient-info"
                color="none"
                size="sm"
                caret
              >
                Pilihan
              </DropdownToggle>
              <DropdownMenu>
                {["*", "detail"].some((r) => userRole.includes(r)) && (
                  <DropdownItem href={`/material/${row._id}`} tag="a">
                    <ZoomIn size={15} className="mr-50" /> Lihat Detail
                  </DropdownItem>
                )}

                {["*", "edit"].some((r) => userRole.includes(r)) && isPossible && (
                  <DropdownItem href={`/material/${row._id}/edit`} tag="a">
                    <Edit size={15} className="mr-50" /> Edit
                  </DropdownItem>
                )}

                {["*", "delete"].some((r) => userRole.includes(r)) &&
                  isPossible && (
                    <DropdownItem
                      onClick={() => handleDelete(row._id)}
                      tag="a"
                      className="text-danger"
                    >
                      <Trash2 size={15} className="mr-50" /> Delete
                    </DropdownItem>
                  )}
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </div>
        );
      },
    },
  ];

  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=""
      nextLabel=""
      forcePage={currentPage}
      onPageChange={(page) => handlePagination(page)}
      pageCount={
        searchValue.length ? filteredData.length / 7 : data.length / 7 || 1
      }
      breakLabel="..."
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName="active"
      pageClassName="page-item"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      nextLinkClassName="page-link"
      nextClassName="page-item next"
      previousClassName="page-item prev"
      previousLinkClassName="page-link"
      pageLinkClassName="page-link"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
    />
  );

  return (
    <Fragment>
      <Row className="justify-content-end mx-0">
        <Col
          className="d-flex align-items-center justify-content-end mt-1"
          md="6"
          sm="12"
        >
          <Label className="mr-1" for="search-input">
            Search
          </Label>
          <Input
            className="dataTable-filter mb-50"
            type="text"
            bsSize="sm"
            id="search-input"
            value={searchValue}
            onChange={handleFilter}
          />
        </Col>
      </Row>
      <DataTable
        noHeader
        pagination
        columns={columns}
        className="react-dataTable"
        sortIcon={<ChevronDown size={10} />}
        paginationPerPage={7}
        paginationDefaultPage={currentPage + 1}
        paginationComponent={CustomPagination}
        data={searchValue.length ? filteredData : data}
        progressPending={isLoading}
      />
    </Fragment>
  );
};

export default MaterialTable;
