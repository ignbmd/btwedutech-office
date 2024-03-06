import ReactPaginate from "react-paginate";
import { ChevronDown, Plus } from "react-feather";
import React, { useContext, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { initialDatatables } from "../../../api/datatables/participant-list-data";
import { Card, Col, Input, Label, Row } from "reactstrap";
import UploadParticipantModal from "./upload-participant-modal";
import EditParticipantModal from "./edit-participant-modal";
import { ParticipantContext } from "../../../context/PsikotestParticipantContex";
import "./CustomTable.css";

import TableLoader from "../../core/skeleton-loader/TableLoader";
import {
  columns,
  getParticipantsList,
} from "../../../data/participant-list-table";

const ParticipantListTable = () => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const { showPopupUpdate, setShowPopupUpdate } =
    useContext(ParticipantContext);

  const { showPopupEdit, setShowPopupEdit } = useContext(ParticipantContext);

  useEffect(() => {
    (async () => {
      try {
        // const data = [...initialDatatables];
        const data = await getParticipantsList();
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
  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) return;
    setFilteredData(
      data.filter((item) => {
        const key = value.toLowerCase();
        const matchName = item?.name.toLowerCase().includes(key);
        const matchEmail = item?.email.toLowerCase().includes(key);
        const matchCodeAccess = item?.code.toLowerCase().includes(key);
        const matchSchool = item?.instance_name.toLowerCase().includes(key);
        const anyMatch = [
          matchName,
          matchEmail,
          matchCodeAccess,
          matchSchool,
        ].some(Boolean);
        return anyMatch;
      })
    );
  };

  // const toggleUpload = () => {
  //   setModal(!modal);
  // };
  const handlePagination = (page) => {
    setCurrentPage(page.selected);
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
  return (
    <>
      <Card>
        <Row className="justify-content-end mx-0">
          <Col
            className="d-flex align-items-center justify-content-end mt-1"
            md="6"
            sm="12"
          >
            <button
              className="btn btn-primary"
              onClick={() => setShowPopupUpdate((prev) => !prev)}
            >
              <Plus size={14} /> Upload Hasil
            </button>
          </Col>
        </Row>
        <hr />
        <Row className="justify-content-end mx-0">
          <Col
            className="d-flex align-items-center justify-content-end mb-75"
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
      {/* MODAL DISINI */}
      <UploadParticipantModal
        open={showPopupUpdate}
        close={() => setShowPopupUpdate((prev) => !prev)}
      />
      {/* <EditParticipantModal
        openEdit={showPopupEdit}
        closeEdit={() => setShowPopupEdit((prev) => !prev)}
      /> */}
      ,
    </>
  );
};

export default ParticipantListTable;
