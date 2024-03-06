import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown, Plus } from "react-feather";
import DataTable from "react-data-table-component";
import { Button, Card, Col, Input, Label, Row } from "reactstrap";

import SpinnerCenter from "../core/spinners/Spinner";
import { columns, data } from "../../data/central-loan-table";
import { useEffect } from "react";
import ContentLoader from "react-content-loader";

const CentralLoanTable = ({ data }) => {
  // const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) return;
    setFilteredData(
      data.filter((item) => {
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
    <Card>
      <Row className="justify-content-start mx-0">
        <Col
          className="d-flex align-items-center justify-content-start"
          md="6"
          sm="12"
        >
          <h6>Daftar Hutang</h6>
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
            placeholder="Cari ..."
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
          // progressPending={isLoading}
          progressComponent={
            <ContentLoader viewBox="0 0 380 70" className="mt-2 px-2">
              <rect x="0" y="0" rx="5" ry="5" width="100%" height="10" />
              <rect x="0" y="14" rx="5" ry="5" width="100%" height="10" />
              <rect x="0" y="28" rx="5" ry="5" width="100%" height="10" />
            </ContentLoader>
          }
          sortIcon={<ChevronDown size={10} />}
          paginationPerPage={7}
          paginationDefaultPage={currentPage + 1}
          paginationComponent={CustomPagination}
          data={searchValue.length ? filteredData : data}
        />
      </div>
    </Card>
  );
};

export default CentralLoanTable;