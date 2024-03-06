import Select from "react-select";
import classnames from "classnames";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown, DollarSign } from "react-feather";
import { Controller } from "react-hook-form";
import ContentLoader from "react-content-loader";
import DataTable from "react-data-table-component";
import { Button, Col, FormGroup, Input, Label, Row } from "reactstrap";

import { columns } from "../../data/branch-debt-table";
import { priceFormatter } from "../../utility/Utils";

const filterStatusOption = [
  {
    label: "Semua",
    value: "",
  },
  {
    label: "Belum Dibayar",
    value: "OPEN",
  },
  {
    label: "Menunggu Konfirmasi",
    value: "WAITING",
  },
  {
    label: "Ditolak",
    value: "REJECTED",
  },
  {
    label: "Diterima",
    value: "COMPLETED",
  },
];

const BranchDebt = ({ debt, histories, control }) => {
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
      breakClassName="page-item"
      breakLinkClassName="page-link"
      containerClassName="pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1"
    />
  );
  return (
    <>
      <Row className="justify-content-between mx-0">
        <Col md={6}>
          <div className="d-flex align-items-center pt-3">
            <div
              className={`avatar avatar-stats p-50 m-0 bg-light-primary mr-2`}
            >
              <div className="avatar-content">
                <DollarSign />
              </div>
            </div>
            <div>
              <p className="card-text mb-0">Total Hutang ke Pusat</p>
              <h2 className="font-weight-bolder mb-0">
                {debt !== undefined ? (
                  priceFormatter(debt.amount)
                ) : (
                  <ContentLoader viewBox="0 0 380 70">
                    <rect x="0" y="0" rx="5" ry="5" width="400" height="70" />
                  </ContentLoader>
                )}
              </h2>
              {debt !== undefined && (
                <Button
                  size="md"
                  tag="a"
                  color="primary"
                  href={`/bayar-dan-tagih/cabang/bayar-sekarang/${debt.account_id}`}
                  className="mt-1"
                >
                  Bayar Sekarang
                </Button>
              )}
            </div>
          </div>
        </Col>
        <Col className="d-flex align-items-end justify-content-end mt-1" md="3">
          <Controller
            isClearable
            name="status"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormGroup className="w-100 mb-0">
                <Label className="form-label" for="status">
                  Status
                </Label>
                <Select
                  styles={{
                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                  }}
                  {...field}
                  options={filterStatusOption}
                  classNamePrefix="select"
                  className={classnames("react-select", {
                    "is-invalid": error && true,
                  })}
                />
              </FormGroup>
            )}
          />
        </Col>
        <Col
          className="d-flex align-items-center justify-content-end mt-1 border-top pt-50"
          md="12"
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
        progressPending={!histories?.length > 0 && histories?.length !== 0}
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
        data={searchValue.length ? filteredData : histories}
      />
    </>
  );
};

export default BranchDebt;
