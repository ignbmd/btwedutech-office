import ReactPaginate from "react-paginate";
import React, { useContext, useEffect, useState, useRef } from "react";
import DataTable from "react-data-table-component";
import { ChevronDown, Edit, RefreshCw } from "react-feather";
import {
  Card,
  Col,
  Input,
  Label,
  Row,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
  Dropdown,
} from "reactstrap";
import TableLoader from "../../core/skeleton-loader/TableLoader";
import AssignNewAccessCodeModal from "../../../components/interest-and-talent/school/detail/AssignNewAccessCodeModal";
import AssignEditHistoryCodeModal from "../../interest-and-talent/school/detail/AssignEditHistoryCodeModal";
import { InterestAndTalentSchoolContext } from "../../../context/InterestAndTalentSchoolContext";
import "./CustomTable.css";
import moment from "moment-timezone";

import { initialDatatables } from "../../../api/datatables/history-request-code";
import { getHistoryRequestCode } from "../../../data/riwayat-request-code/history-request-code-table";

const HistoryRequestCodeTable = () => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [codeRequest, setCodeRequest] = useState(null);
  const [codeHistory, setCodeHistory] = useState(null);

  const type = useRef();
  const columns = [
    {
      name: "No",
      sortable: false,
      center: true,
      maxWidth: "80px",
      selector: "no",
    },
    {
      name: "Tgl Request",
      center: true,
      wrap: true,
      sortable: false,
      cell: (row) => moment(row.created_at).format("DD/MM/YYYY"),
    },
    {
      name: "Nama Sekolah",
      grow: 1,
      wrap: true,
      sortable: false,
      center: true,
      // cell: (row) => <strong>{row.instance_name}</strong>,
      selector: "instance_name",
    },
    {
      name: "Jumlah Kode",
      wrap: true,
      sortable: false,
      center: true,
      selector: "amount",
    },
    {
      name: "Kode Mulai Berlaku",
      grow: 1,
      wrap: true,
      sortable: false,
      center: true,
      selector: (row) =>
        row.start_date
          ? `${moment(row.start_date)
              .tz("Asia/Jakarta")
              .format("DD/MM/YYYY - HH:mm")} WIB`
          : "-",
    },
    {
      name: "Kode Expired",
      grow: 1,
      wrap: true,
      sortable: false,
      center: true,
      selector: (row) =>
        row.expired_date
          ? `${moment(row.expired_date)
              .tz("Asia/Jakarta")
              .format("DD/MM/YYYY - HH:mm")} WIB`
          : "-",
    },

    {
      name: "Aksi",
      center: true,
      grow: 1,
      allowOverflow: true,
      selector: (row) => (
        <div className="d-flex">
          {row.status ? (
            // Jika status bernilai true, tampilkan teks "TELAH TERASSIGN"
            <button
              className={`btn btn-sm btn-outline-primary rounded`}
              disabled
            >
              Telah Terassign
            </button>
          ) : (
            // Jika status bernilai false, tampilkan tombol dropdown
            <UncontrolledButtonDropdown>
              <DropdownToggle
                className="btn-gradient-primary"
                color="none"
                size="sm"
                caret
              >
                Pilihan
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-vertical">
                <button
                  id={row._id}
                  type="button"
                  className="dropdown-item w-100"
                  disabled={isFetchingSchool}
                  onClick={() => {
                    type.current = "update";
                    handleEditToggleModal(row);
                  }}
                >
                  Edit Kode Akses
                </button>
                <button
                  id={row._id}
                  type="button"
                  className="dropdown-item w-100"
                  disabled={isFetchingSchool}
                  onClick={() => {
                    type.current = "assign";
                    handleToggleModal(row);
                  }}
                >
                  Assign Kode Akses
                </button>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          )}
        </div>
      ),
    },
  ];

  const {
    school,
    isFetchingSchool,
    fetchSchool,
    isAssignNewAccessCodeModalOpen,
    toggleAssignNewAccessCodeModalVisibility,
    isAssignedUpdateAccessCodeModalOpen,
    toggleAssignedUpdateAccessCodeModalVisibility,
  } = useContext(InterestAndTalentSchoolContext);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) return;
    setFilteredData(
      data.filter((item) => {
        const key = value.toLowerCase();
        // const matchDate = item?.created_at.toLowerCase().includes(key);
        const searchDate = moment(key, "DD / MM / YYYY").format("YYYY-MM-DD"); // Format nilai pencarian menjadi "YYYY-MM-DD"
        const itemDate = moment(item?.created_at).format("YYYY-MM-DD"); // Format tanggal item menjadi "YYYY-MM-DD"
        const matchDate = itemDate.includes(searchDate); // Mencocokkan tanggal

        const matchSchool = item?.instance_name.toLowerCase().includes(key);
        const anyMatch = [matchDate, matchSchool].some(Boolean);
        return anyMatch;
      })
    );
  };

  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };

  const handleToggleModal = (data) => {
    if (!data) return;
    fetchSchool(data.instance_id);
    setCodeRequest(data);
  };

  const handleEditToggleModal = (data) => {
    if (!data) return;
    setCodeHistory(data);
    fetchSchool(data.instance_id);
  };

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
      containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
    />
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await getHistoryRequestCode();
        const dataWithNumber = data.map((item, index) => ({
          no: index + 1,
          ...item,
        }));
        setData(dataWithNumber);
        setIsLoading(false);
      } catch (error) {
        setData(null);
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (isFetchingSchool || !school) return;
    type.current === "update"
      ? toggleAssignedUpdateAccessCodeModalVisibility()
      : toggleAssignNewAccessCodeModalVisibility();
  }, [isFetchingSchool, school]);

  return (
    <>
      <Card>
        <Row className="justify-content-end mx-0">
          <Col
            className="d-flex align-items-center justify-content-end mb-75 mt-75"
            md="6"
            sm="12"
          >
            <Label className="mr-1" for="search-input">
              Search
            </Label>
            <Input
              className="dataTable-filter"
              type="text"
              bsSize="sm"
              id="search-input"
              value={searchValue}
              onChange={handleFilter}
            />
          </Col>
        </Row>
        <div>
          <DataTable
            noHeader
            pagination
            columns={columns}
            className="react-dataTable"
            progressPending={isLoading}
            progressComponent={<TableLoader />}
            sortIcon={<ChevronDown size={10} />}
            paginationPerPage={7}
            paginationDefaultPage={currentPage + 1}
            paginationComponent={CustomPagination}
            data={searchValue.length ? filteredData : data}
          />
        </div>
      </Card>
      <AssignNewAccessCodeModal
        isOpen={isAssignNewAccessCodeModalOpen}
        toggle={toggleAssignNewAccessCodeModalVisibility}
        codeRequest={codeRequest}
      />
      <AssignEditHistoryCodeModal
        isOpen={isAssignedUpdateAccessCodeModalOpen}
        toggle={toggleAssignedUpdateAccessCodeModalVisibility}
        codeHistory={codeHistory}
      />
    </>
  );
};

export default HistoryRequestCodeTable;
