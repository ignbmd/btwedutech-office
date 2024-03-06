import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown, Plus } from "react-feather";
import DataTable from "react-data-table-component";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Col,
  Input,
  Label,
  Row,
  Button,
} from "reactstrap";

import SpinnerCenter from "../core/spinners/Spinner";
import { columns } from "../../data/revenue-share-table";
import { useEffect } from "react";
import { getBranchEarningByBranchCode } from "../../data/finance-branch-earning";
import { getUserFromBlade } from "../../utility/Utils";

const index = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState([]);
  const [user] = useState(getUserFromBlade());

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) return;
    setFilteredData(
      data.filter((item) => {
        const key = value.toLowerCase();
        const matchBranchCode = String(item?.branch_code)
          .toLowerCase()
          .includes(key);
        const matchAmount = String(item?.amount).toLowerCase().includes(key);
        const matchProduct = String(item?.product_code)
          .toLowerCase()
          .includes(key);
        const anyMatch = [matchBranchCode, matchAmount, matchProduct].some(
          Boolean
        );
        return anyMatch;
      })
    );
  };

  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };

  useEffect(async () => {
    setData(await getBranchEarningByBranchCode(user?.branch_code));
  }, []);

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
    <Card>
      <CardHeader className="border-bottom">
        <CardTitle tag="h4" className="font-weight-bolder">
          Daftar Porsi Pendapatan
        </CardTitle>
        <Col className="d-flex align-items-center justify-content-end pr-0">
          <a href="/porsi-pendapatan/create">
            <Button size="md" color="primary">
              <Plus size={15} className="mr-25" /> Buat Porsi Pendapatan
            </Button>
          </a>
        </Col>
      </CardHeader>

      <CardBody className="px-0">
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
          progressPending={data?.length > 0 ? false : true}
          progressComponent={<SpinnerCenter />}
          sortIcon={<ChevronDown size={10} />}
          paginationPerPage={7}
          paginationDefaultPage={currentPage + 1}
          paginationComponent={CustomPagination}
          data={searchValue.length ? filteredData : data}
        />
      </CardBody>
    </Card>
  );
};

export default index;
