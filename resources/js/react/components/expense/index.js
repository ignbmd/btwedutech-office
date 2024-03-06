import React, { useContext, useEffect, useState } from "react";
import { columns } from "../../data/expense-table";
import DataTable from "react-data-table-component";
import ReactPaginate from "react-paginate";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Input,
  Label,
  Row,
} from "reactstrap";
import { ChevronDown, Plus } from "react-feather";
import { getUserFromBlade, priceFormatter } from "../../utility/Utils";
import { ExpenseContext } from "../../context/ExpenseContext";
import { nanoid } from "nanoid";

const ExpenseSection = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [user, setUser] = useState(getUserFromBlade());
  const [isLoading, setIsLoading] = useState(true);

  const {
    expenses,
    expenseCalculation,
    getFilteredExpenses,
    loadExpensesByBranchCode,
    loadExpenseCalculationByBranchCode,
  } = useContext(ExpenseContext);

  useEffect(async () => {
    setIsLoading(true);
    setUser(getUserFromBlade());
    loadExpensesByBranchCode(user?.branch_code);
    loadExpenseCalculationByBranchCode(user?.branch_code);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setFilteredData(getFilteredExpenses(searchValue));
  }, [searchValue]);

  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };

  const getExpenseData = () => {
    const data = (searchValue.length ? filteredData : expenses) ?? [];
    const result = [...new Set(data.map(JSON.stringify))].map(JSON.parse);
    return result;
  };

  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=""
      nextLabel=""
      forcePage={currentPage}
      onPageChange={(page) => handlePagination(page)}
      pageCount={getExpenseData().length / 7 || 1}
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
    <Row>
      <Col lg="6">
        <Card>
          <CardBody>
            <CardTitle className="mb-1 font-weight-bolder">
              Total Biaya Bulan Ini
            </CardTitle>
            <div className="font-small-2">Total</div>
            <h5 className="mb-1">
              {priceFormatter(expenseCalculation?.this_month ?? 0)}
            </h5>
          </CardBody>
        </Card>
      </Col>
      <Col lg="6">
        <Card>
          <CardBody>
            <CardTitle className="mb-1 font-weight-bolder">
              Biaya 30 Hari Terakhir
            </CardTitle>
            <div className="font-small-2">Total</div>
            <h5 className="mb-1">
              {priceFormatter(expenseCalculation?.past_thirty_days ?? 0)}
            </h5>
          </CardBody>
        </Card>
      </Col>
      <Col lg="12">
        <Card>
          <CardHeader className="border-bottom">
            <CardTitle tag="h4" className="font-weight-bolder">
              Daftar Biaya
            </CardTitle>
            <Col className="d-flex align-items-center justify-content-end pr-0">
              <a href="/biaya/create">
                <Button size="md" color="primary">
                  <Plus size={15} className="mr-25" /> Buat Biaya
                </Button>
              </a>
            </Col>
          </CardHeader>
          <CardBody className="px-0">
            <Col className="d-flex align-items-center justify-content-end my-1">
              <Label className="mr-1" for="search-input">
                Search
              </Label>
              <Input
                className="dataTable-filter"
                type="text"
                bsSize="sm"
                id="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Col>

            <DataTable
              keyField={nanoid()}
              noHeader
              pagination
              columns={columns}
              className="react-dataTable"
              sortIcon={<ChevronDown size={10} />}
              paginationPerPage={7}
              paginationDefaultPage={currentPage + 1}
              paginationComponent={CustomPagination}
              data={getExpenseData()}
              progressPending={isLoading}
            />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ExpenseSection;
