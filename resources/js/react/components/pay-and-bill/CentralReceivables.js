import { useEffect } from "react";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown } from "react-feather";
import { Col, Input, Label, Row } from "reactstrap";
import DataTable from "react-data-table-component";

import SpinnerCenter from "../core/spinners/Spinner";
import { columns } from "../../data/central-receivable-table";

const CentralReceivables = ({ receivables }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) return;
    setFilteredData(
      receivables.filter((item) => {
        const key = value.toLowerCase();
        const matchBranchName = item?.branch_name.toLowerCase().includes(key);
        const anyMatch = [matchBranchName].some(Boolean);
        return anyMatch;
      })
    );
  };

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
        searchValue.length ? filteredData.length / 7 : receivables.length / 7 || 1
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
    <>
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
        progressPending={receivables?.length > 0 ? false : true}
        progressComponent={<SpinnerCenter />}
        sortIcon={<ChevronDown size={10} />}
        paginationPerPage={7}
        paginationDefaultPage={currentPage + 1}
        paginationComponent={CustomPagination}
        data={searchValue.length ? filteredData : receivables}
      />
    </>
  );
};

export default CentralReceivables;
