import React, { useContext, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown, Plus } from "react-feather";
import DataTable from "react-data-table-component";
import { Col, Input, Label, Row, Card, Button } from "reactstrap";
import { initialDatatables } from "../../../api/datatables/interest-and-talent/school/school-data";
import { columns } from "../../../data/interest-and-talent/school/school-table";
import TableLoader from "../../core/skeleton-loader/TableLoader";
import { InterestAndTalentSchoolContext } from "../../../context/InterestAndTalentSchoolContext";
import styles from "./CustomTable.module.css";
import clsx from "clsx";
import { getSchools } from "../../../data/interest-and-talent/school/school-data";

const SchoolTable = () => {
  const [data, setData] = useState();
  const [schoolInfo, setSchoolInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const { toggleSchoolModalVisibility } = useContext(
    InterestAndTalentSchoolContext
  );

  const fetchSchools = async (page, per_page = 7, search = "") => {
    try {
      setIsLoading(true);
      const response = await getSchools({
        page: page,
        per_page: per_page,
        search: search,
      });
      const schools = response?.schools ?? [];
      const startNumber = page == 1 ? 0 : (page - 1) * response.per_page;
      const dataWithNumber = schools?.map((item, index) => ({
        no: startNumber + (index + 1),
        ...item,
      }));
      setSchoolInfo({
        page: response.page,
        per_page: response.per_page,
        total: response.total,
      });
      setData(dataWithNumber);
    } catch (error) {
      console.error(error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools(currentPage + 1, 7, searchValue);
  }, [currentPage, searchValue]);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const data = [...initialDatatables];
  //       const dataWithNumber = data.map((item, index) => ({
  //         no: index + 1,
  //         ...item,
  //       }));
  //       setData(dataWithNumber);
  //       setIsLoading(false);
  //     } catch (error) {
  //       setData([]);
  //       setIsLoading(false);
  //     }
  //   })();
  // }, []);

  const handleFilter = (e) => {
    const value = e.target.value;
    if (e.keyCode === 13 || value === "") {
      setSearchValue(value);
      setCurrentPage(0);
    }
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
      pageCount={Math.ceil(schoolInfo?.total / schoolInfo?.per_page)}
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
    <Row>
      <Col sm="12">
        <Card>
          <Row className="justify-content-end mx-0">
            <Col
              className="d-flex align-items-center justify-content-end mt-1"
              md="6"
              sm="12"
            >
              <Button
                color="gradient-primary"
                onClick={toggleSchoolModalVisibility}
              >
                <Plus size={14} /> Tambah Sekolah
              </Button>
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
                className="w-50"
                type="text"
                id="search-input"
                onKeyDown={handleFilter}
                onChange={handleFilter}
                placeholder="Ketik kata kunci, lalu tekan Enter"
              />
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <DataTable
                noHeader
                pagination
                columns={columns}
                className={clsx("react-dataTable", styles.CustomTable)}
                progressPending={isLoading}
                progressComponent={<TableLoader />}
                sortIcon={<ChevronDown size={10} />}
                paginationPerPage={schoolInfo?.per_page}
                paginationDefaultPage={currentPage + 1}
                paginationComponent={CustomPagination}
                data={data}
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default SchoolTable;
