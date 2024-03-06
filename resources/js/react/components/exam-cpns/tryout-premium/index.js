import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown, Plus } from "react-feather";
import DataTable from "react-data-table-component";
import { Button, Card, Col, Input, Label, Row } from "reactstrap";

import SpinnerCenter from "../../core/spinners/Spinner";
import {
  columns,
  getTryoutPremium,
} from "../../../data/tryout-premium-cpns-table";

const TryoutPremiumTable = () => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTryoutPremium();
        const dataWithNumber = data.map((item, index) => ({
          no: index + 1,
          ...item,
        }));
        setData(dataWithNumber);
        setIsLoading(false);
      } catch (error) {
        setData([]);
        setIsLoading(false);
      }
    })();
  }, []);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value?.length) return;
    setFilteredData(
      data.filter((item) => {
        const key = value.toLowerCase();
        const matchTitle = item?.title.toLowerCase().includes(key);
        const matchModuleCode = item?.modules?.module_code
          ?.toLowerCase()
          ?.includes(key);
        const matchProductCode = item?.product_code
          ?.toLowerCase()
          ?.includes(key);
        const anyMatch = [matchTitle, matchModuleCode, matchProductCode].some(
          Boolean
        );
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
        searchValue?.length ? filteredData?.length / 7 : data?.length / 7 || 1
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
      <Row className="justify-content-end mx-0">
        <Col
          className="d-flex align-items-center justify-content-end mt-1"
          md="6"
          sm="12"
        >
          <a
            href="/ujian-cpns/tryout-premium/create"
            className="btn btn-primary"
          >
            <Plus size={14} /> Buat Tryout Premium
          </a>
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
          // progressComponent={<SpinnerCenter />}
          sortIcon={<ChevronDown size={10} />}
          paginationPerPage={7}
          paginationDefaultPage={currentPage + 1}
          paginationComponent={CustomPagination}
          data={searchValue?.length ? filteredData : data}
        />
      </div>
    </Card>
  );
};

export default TryoutPremiumTable;
