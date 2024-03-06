import React, { useContext, useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import DataTable from "react-data-table-component";
import { Col, Row, Card } from "reactstrap";
import { columns } from "../../../../data/interest-and-talent/school/school-admin-table";
import TableLoader from "../../../core/skeleton-loader/TableLoader";
import clsx from "clsx";
import { InterestAndTalentSchoolContext } from "../../../../context/InterestAndTalentSchoolContext";
import styles from "../CustomTable.module.css";

const SchoolAdminTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const {
    toggleAddNewSchoolAdminModalVisibility,
    schoolAdmins,
    isFetchingSchoolAdmins,
  } = useContext(InterestAndTalentSchoolContext);

  useEffect(() => {
    if (isFetchingSchoolAdmins) return;
    try {
      const data = [...schoolAdmins];
      const dataWithNumber = data.map((item, index) => ({
        no: index + 1,
        ...item,
      }));
      setData(dataWithNumber);
    } catch (error) {
      setData([]);
    }
  }, [isFetchingSchoolAdmins, schoolAdmins]);

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) return;
    setFilteredData(
      data.filter((item) => {
        const key = value.toLowerCase();
        const matchTitle = item?.title?.toLowerCase().includes(key);
        const anyMatch = [matchTitle].some(Boolean);
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
    <Col sm="12">
      <Card className={clsx("p-3")}>
        <Row className="mx-0 align-items-center">
          <Col className="mb-75 p-0" md="6" sm="12">
            {!isFetchingSchoolAdmins ? <h5>Daftar Admin Sekolah</h5> : null}
          </Col>
          <Col className="mb-75 p-0" md="6" sm="12">
            <div className="d-flex justify-content-end align-items-center">
              {!isFetchingSchoolAdmins ? (
                <button
                  className="btn btn-gradient-primary"
                  onClick={toggleAddNewSchoolAdminModalVisibility}
                >
                  Tambah Akun Admin
                </button>
              ) : null}
            </div>
          </Col>
        </Row>
        <div>
          <DataTable
            noHeader
            // pagination
            columns={columns}
            className={clsx("react-dataTable", styles.CustomTable)}
            progressPending={isFetchingSchoolAdmins}
            progressComponent={<TableLoader />}
            // sortIcon={<ChevronDown size={10} />}
            // paginationPerPage={7}
            // paginationDefaultPage={currentPage + 1}
            // paginationComponent={null}
            data={searchValue.length ? filteredData : data}
          />
        </div>
      </Card>
    </Col>
  );
};

export default SchoolAdminTable;
