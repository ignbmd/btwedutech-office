import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown } from "react-feather";
import DataTable from "react-data-table-component";
import {
  Card,
  CardHeader,
  CardTitle,
  Col,
  Input,
  Label,
  Row,
} from "reactstrap";

import SpinnerCenter from "../../core/spinners/Spinner";
import { priceFormatter } from "../../../utility/Utils";
import { getCentralPayDebtHistory } from "../../../data/central-pay-debt-history";
import { getCentralCollectReceivableHistory } from "../../../data/central-pay-receivable-history";

const CentralDebtAndReceivableHistory = ({
  type,
  columns,
  accountId,
  triggered,
  branchName = "",
}) => {
  const [histories, setHistories] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    (async () => {
      setHistories(undefined);
      let data;
      if (type == "pay") {
        data = await getCentralPayDebtHistory(accountId);
      } else {
        data = await getCentralCollectReceivableHistory(accountId);
      }
      const formattedData = data.map((item) => ({
        ...item,
        payment_method: item.source_account?.name,
        proof_file: item.document?.reverse()?.[0]?.path,
      }));
      setHistories(formattedData);
    })();
  }, [triggered]);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) return;
    setFilteredData(
      histories.filter((item) => {
        const key = value.toLowerCase();
        const matchAmount =
          `${item?.amount}`.includes(key) ||
          `${priceFormatter(item?.amount)}`.includes(key);
        const matchCreatedAt = item?.created_at.toLowerCase().includes(key);
        const matchPaymentMethod = item?.payment_method
          .toLowerCase()
          .includes(key);
        const anyMatch = [matchAmount, matchCreatedAt, matchPaymentMethod].some(
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
    <Card>
      <CardHeader>
        <CardTitle>
          {type === "pay"
            ? "Histori Pembayaran"
            : `Histori Pembayaran ${branchName}`}
        </CardTitle>
      </CardHeader>
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
        className="react-dataTable mt-1"
        progressPending={!histories}
        progressComponent={<SpinnerCenter />}
        sortIcon={<ChevronDown size={10} />}
        paginationPerPage={7}
        paginationDefaultPage={currentPage + 1}
        paginationComponent={CustomPagination}
        data={searchValue.length ? filteredData : histories}
      />
    </Card>
  );
};

CentralDebtAndReceivableHistory.propTypes = {
  type: PropTypes.oneOf(["pay", "bill"]),
};

export default CentralDebtAndReceivableHistory;
