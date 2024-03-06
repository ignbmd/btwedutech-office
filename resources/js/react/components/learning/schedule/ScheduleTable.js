import { Fragment, useState } from "react";
import { columns, onlineClassMentorColumns, onlineClassNonMentorColumns } from "../../../data/schedule-table";
import { ChevronDown } from "react-feather";
import { Input, Label, Row, Col } from "reactstrap";
import ReactPaginate from "react-paginate";
import { getUserFromBlade, getIsOnlineClass } from "../../../utility/Utils";

import DataTable from "react-data-table-component";

const user = getUserFromBlade();
const isOnlineClass = getIsOnlineClass();
const scheduleColumns = !isOnlineClass ? columns : user.roles.includes("mentor") ? onlineClassMentorColumns : onlineClassNonMentorColumns;

const ScheduleTable = ({ data, isLoading = true }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) return;
    setFilteredData(
      data.filter((item) => {
        const key = value.toLowerCase();
        const matchTitle = item?.title.toLowerCase().includes(key);
        const matchTeacher = item?.teacher_name.toLowerCase().includes(key);
        const matchTopics = item?.topics?.some((v) =>
          v.toLowerCase().includes(key)
        );
        const anyMatch = [matchTitle, matchTeacher, matchTopics].some(Boolean);
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
    <Fragment>
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
        columns={scheduleColumns}
        className="react-dataTable"
        style={
          data.length == 1 || filteredData.length == 1
            ? {
                paddingBottom: "80px",
              }
            : {}
        }
        sortIcon={<ChevronDown size={10} />}
        paginationPerPage={7}
        paginationDefaultPage={currentPage + 1}
        paginationComponent={CustomPagination}
        data={searchValue.length ? filteredData : data}
        progressPending={isLoading}
      />
    </Fragment>
  );
};

export default ScheduleTable;
