import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown, DollarSign } from "react-feather";
import DataTable from "react-data-table-component";
import { Col, Input, Label, Row } from "reactstrap";

import { columns } from "../../data/withdraw-history-table";
import ContentLoader, { BulletList } from "react-content-loader";
import { priceFormatter, unformatPrice } from "../../utility/Utils";

const WithdrawHistoryTable = ({ histories }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) return;
    setFilteredData(
      histories.filter((item) => {
        const key = value.toLowerCase();
        const amount = unformatPrice(item?.amount.toString());
        const matchByAmount = amount.toLowerCase().includes(key);
        const matchByAccountType = item?.contact?.bank_account_type
          .toLowerCase()
          .includes(key);
        const matchByAccountNumber = item?.contact?.bank_account_number
          .toString()
          .toLowerCase()
          .includes(key);
        const anyMatch = [
          matchByAmount,
          matchByAccountNumber,
          matchByAccountType,
        ].some(Boolean);
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
        searchValue.length ? filteredData.length / 7 : histories.length / 7 || 1
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
      <Row className="justify-content-between mx-0">
        <Col className="d-flex align-items-center" md="6" sm="12">
          <p className="mb-0">Riwayat Penarikan</p>
        </Col>
        <Col
          className="d-flex align-items-center justify-content-end"
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
        className="react-dataTable mt-75"
        progressPending={!histories?.length > 0 && histories?.length !== 0}
        progressComponent={
          <ContentLoader viewBox="0 0 380 70" className="px-2">
            <rect x="0" y="0" rx="5" ry="5" width="100%" height="10" />
            <rect x="0" y="14" rx="5" ry="5" width="100%" height="10" />
            <rect x="0" y="28" rx="5" ry="5" width="100%" height="10" />
          </ContentLoader>
        }
        sortIcon={<ChevronDown size={10} />}
        paginationPerPage={7}
        paginationDefaultPage={currentPage + 1}
        paginationComponent={CustomPagination}
        data={searchValue.length ? filteredData : histories}
      />
    </>
  );
};

export default WithdrawHistoryTable;
