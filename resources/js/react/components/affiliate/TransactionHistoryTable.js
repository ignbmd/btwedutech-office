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
  getAffiliateTransactionHistory,
} from "../../data/affiliate-transaction-history-table";
import TableLoader from "../core/skeleton-loader/TableLoader";
import { getIdFromURLSegment } from "../../utility/Utils";

const affiliateID = getIdFromURLSegment();
const TransactionHistoryContext = createContext();

const CustomPagination = () => {
  const { currentPage, handlePagination, searchValue, filteredData, data } =
    useContext(TransactionHistoryContext);
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

const TransactionHistoryTable = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAffiliateTransactionHistory(affiliateID);
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
        const matchProductName = item?.product_name
          ?.toLowerCase()
          .includes(key);
        const matchProductCode = item?.product_code
          ?.toLowerCase()
          .includes(key);
        const matchPrice = item?.price?.toString().includes(key);
        const matchDiscount = item?.discount?.toLowerCase().includes(key);
        const matchFee = item?.fee?.toLowerCase().includes(key);
        const anyMatch = [
          matchProductName,
          matchProductCode,
          matchPrice,
          matchDiscount,
          matchFee,
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
    <TransactionHistoryContext.Provider value={contextProviderValue}>
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
    </TransactionHistoryContext.Provider>
  );
};

export default TransactionHistoryTable;
