import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import DataTable from "react-data-table-component";
import { ChevronDown, Plus, Search } from "react-feather";
import { Card, Col, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from "reactstrap";
import Cleave from "cleave.js/react";
import "./index.css";
import TableLoader from "../core/skeleton-loader/TableLoader";
import { columns, getQuestions, getQuestionBySearch } from "../../data/question-table";
import Select from "react-select";
import classnames from "classnames";
import { normalNumber } from "../../utility/Utils";
const question_type = [
  {
    label: "Semua Soal",
    value: "",
  },
  {
    label: "Induk Soal",
    value: "PARENT",
  },
  {
    label: "Anak Soal",
    value: "CHILD",
  },
  {
    label: "Soal Biasa",
    value: "STANDALONE",
  },
];

const QuestionTable = () => {
  const [data, setData] = useState();
  const [questionInfo, setQuestionInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [searchId, setSearchId] = useState();
  const [filterType, setFilterType] = useState("");

  const getQuestionsList = async (pages, search, type) => {
    try {
      setIsLoading(true);
      const res = await getQuestions({ pages, limit: 10, search, type });
      const data = res?.data ?? [];
      const info = res?.info ?? {};

      const startNumber = pages == 1 ? 0 : ((pages - 1) * info.limit);
      const dataWithNumber = data.map((item, index) => ({
        no: startNumber + (index + 1),
        ...item,
      }));
      setData(dataWithNumber);
      setQuestionInfo(info);
      setIsLoading(false);
    } catch (error) {
      setData(null);
      setIsLoading(false);
    }
  };

  const getQuestionBySearchId = async (pages, search) => {
    try {
      setIsLoading(true);
      const res = await getQuestionBySearch({ pages, limit: 10, search });
      const data = res?.data ?? [];
      const info = res?.info ?? {};

      const startNumber = pages == 1 ? 0 : ((pages - 1) * info.limit);
      const dataWithNumber = data.map((item, index) => ({
        no: startNumber + (index + 1),
        ...item,
      }));
      setData(dataWithNumber);
      setQuestionInfo(info);
      setIsLoading(false);
    } catch (error) {
      setData(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof searchId !== "undefined") {
      getQuestionBySearchId(currentPage + 1, searchId);
    }
  }, [currentPage, searchId]);

  useEffect(() => {
    if (searchValue.length || filterType.value != "") {
      getQuestionsList(currentPage + 1, searchValue, filterType.value);
    } else {
      getQuestionsList(currentPage + 1, searchValue);
    }
  }, [currentPage, searchValue, filterType]);

  const handleFilter = (e) => {
    const value = e.target.value;
    if (e.keyCode === 13 || value === "") {
      setSearchValue(value);
      setCurrentPage(0);
    }
    if (value && searchId) {
      setSearchId("");
    }
  };

  const handleFilterById = (e) => {
    const value = e.target.value;
    if (e.keyCode === 13) {
      setSearchId(value);
      setCurrentPage(0);
    }
    if (value === "") {
      setSearchId("");
      setCurrentPage(0);
    }
    if (value && searchValue) {
      setSearchValue("");
    }
  };

  const handleFilterType = (value) => {
    setFilterType(value);
    setSearchId("");
    setCurrentPage(0);
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
      pageCount={questionInfo?.total_page}
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
          <a href="/ujian/bank-soal/create" className="btn btn-primary mr-1">
            <Plus size={14} /> Buat Soal
          </a>
        </Col>
      </Row>
      <hr />
      <div className="input-search-index d-flex">
        <InputGroup className="input-group-merge w-25">
          <Select
            id="filter-type"
            options={question_type}
            classNamePrefix="select"
            className="react-select w-100"
            onChange={handleFilterType}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
            value={filterType}
          />
        </InputGroup>
        <InputGroup className="input-group-merge ml-1 w-50">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>
              <Search className="text-muted" size={14} />
            </InputGroupText>
          </InputGroupAddon>
          <Input
            type="text"
            id="search-input"
            placeholder="Cari pertanyaan, kategori soal, sub kategori soal, atau tag"
            onKeyUp={handleFilter}
            onChange={handleFilter}
          />
        </InputGroup>
        <InputGroup className="input-group-merge ml-1 w-25">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>
              <Search className="text-muted" size={14} />
            </InputGroupText>
          </InputGroupAddon>
          <Cleave
            id="search-input-id"
            className={classnames("form-control")}
            options={normalNumber}
            placeholder="Cari soal berdasarkan ID"
            value={searchId}
            onKeyUp={handleFilterById}
            onChange={handleFilterById}
          />
        </InputGroup>
      </div>
      {isLoading ? (
        <TableLoader />
      ) : (
        <DataTable
          noHeader
          pagination
          columns={columns}
          className="react-dataTable"
          progressPending={isLoading}
          progressComponent={<TableLoader />}
          sortIcon={<ChevronDown size={10} />}
          paginationPerPage={questionInfo?.limit}
          paginationDefaultPage={currentPage + 1}
          paginationComponent={CustomPagination}
          data={data}
        />
      )}
    </Card>
  );
};

export default QuestionTable;
