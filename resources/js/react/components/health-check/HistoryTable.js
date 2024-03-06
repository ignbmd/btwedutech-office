import ReactPaginate from "react-paginate";
import { CheckSquare, ChevronDown } from "react-feather";
import ContentLoader from "react-content-loader";
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Card, Col, Input, Label, Row } from "reactstrap";

import { columns, getMedicalCheckupHistory } from "../../data/medical-checkup-history-table";
import { getLastSegment } from "../../utility/Utils";

const HistoryTable = () => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const studentId = getLastSegment();

  useEffect(() => {
    (async () => {
      try {
        const data = await getMedicalCheckupHistory(studentId);
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

    if (!value.length) return;
    setFilteredData(
      data.filter((item) => {
        const key = value.toLowerCase();
        const matchDate = item?.createdAt.toLowerCase().includes(key);
        const anyMatch = [matchDate].some(Boolean);
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
      <Row className="justify-content-end mx-0">
        <Col
          className="d-flex align-items-center justify-content-end mt-1"
          md="6"
          sm="12"
        >
          <a href="/kesehatan/check" className="btn btn-primary">
            <CheckSquare size={14} /> Periksa Kesehatan
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
            className="dataTable-filter mb-50"
            type="text"
            bsSize="sm"
            id="search-input"
            placeholder="Cari tanggal pemeriksaan"
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
        progressPending={isLoading}
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
    </Card>
  );
};

export default HistoryTable;
