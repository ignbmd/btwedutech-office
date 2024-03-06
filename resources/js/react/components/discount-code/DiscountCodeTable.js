import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown, Plus } from "react-feather";
import DataTable from "react-data-table-component";
import { Card, Col, Input, Label, Row } from "reactstrap";

import {
  columns,
  getDiscountCode,
  canCreateDiscountCode,
} from "../../data/discount-code-table";
import TableLoader from "../core/skeleton-loader/TableLoader";

const DiscountCodeTableContext = createContext();

const CustomPagination = () => {
  const { currentPage, handlePagination, searchValue, filteredData, data } =
    useContext(DiscountCodeTableContext);
  return (
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
};

const DiscountCodeTable = () => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDiscountCode();
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
        const matchCode = item?.code?.toLowerCase().includes(key);
        const matchUsageType = item?.usage_type?.toLowerCase().includes(key);
        const matchAmount = item?.amount?.toString().includes(key);
        const matchAmountType = item?.amount_type?.toLowerCase().includes(key);
        const matchMaxUsage = item?.max_usage?.toString().includes(key);
        const matchIdentifier = item?.identifier?.toLowerCase().includes(key);
        const matchCreatedBy = item?.created_by?.toString().includes(key);
        const matchExpiredAt = item?.expired_at?.toString().includes(key);
        const anyMatch = [
          matchCode,
          matchUsageType,
          matchAmount,
          matchAmountType,
          matchMaxUsage,
          matchIdentifier,
          matchCreatedBy,
          matchExpiredAt,
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
    <DiscountCodeTableContext.Provider value={contextProviderValue}>
      <Card>
        <Row className="justify-content-end mx-0">
          <Col
            className="d-flex align-items-center justify-content-end mt-1"
            md="6"
            sm="12"
          >
            {canCreateDiscountCode() ? (
              <a href="/kode-diskon/tambah" className="btn btn-primary">
                <Plus size={14} /> Tambah
              </a>
            ) : null}
          </Col>
        </Row>
        {canCreateDiscountCode() ? <hr /> : null}
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
            progressComponent={<TableLoader />}
            sortIcon={<ChevronDown size={10} />}
            paginationPerPage={7}
            paginationDefaultPage={currentPage + 1}
            paginationComponent={CustomPagination}
            data={searchValue.length ? filteredData : data}
          />
        </div>
      </Card>
    </DiscountCodeTableContext.Provider>
  );
};

export default DiscountCodeTable;
