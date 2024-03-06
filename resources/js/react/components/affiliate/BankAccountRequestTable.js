import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  useMemo,
} from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown } from "react-feather";
import DataTable from "react-data-table-component";
import { Card, Col, Input, Label, Row } from "reactstrap";

import {
  columns,
  getBankAccountUpdateRequests,
} from "../../data/bank-account-request-table-data";
import TableLoader from "../core/skeleton-loader/TableLoader";

const BankAccountRequestContext = createContext();

const CustomPagination = () => {
  const { currentPage, handlePagination, searchValue, filteredData, data } =
    useContext(BankAccountRequestContext);
  return (
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
};

const BankAccountRequestTable = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBankAccountUpdateRequests();
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
        const matchName = item?.name?.toLowerCase().includes(key);
        const matchEmail = item?.email?.toLowerCase().includes(key);
        const matchBankType = item?.bank_type?.toString().includes(key);
        const matchBankNumber = item?.bank_number?.toLowerCase().includes(key);
        const anyMatch = [
          matchName,
          matchEmail,
          matchBankType,
          matchBankNumber,
        ].some(Boolean);
        return anyMatch;
      })
    );
  };

  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };

  const contextProviderValue = useMemo(
    () => ({
      data,
      filteredData,
      searchValue,
      currentPage,
      handlePagination,
    }),
    [data, filteredData, searchValue, currentPage]
  );

  return (
    <BankAccountRequestContext.Provider value={contextProviderValue}>
      <Card>
        <Row className="justify-content-end mx-0 my-1">
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
    </BankAccountRequestContext.Provider>
  );
};

export default BankAccountRequestTable;
