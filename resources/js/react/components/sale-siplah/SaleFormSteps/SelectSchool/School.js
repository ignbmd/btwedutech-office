import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";
import SpinnerCenter from "../../../core/spinners/Spinner";
import SchoolHeader from "./SchoolHeader";
import SchoolCard from "./SchoolCard";
import SchoolSearchbar from "./SchoolSearchbar";

const School = ({ stepper, selectSchool }) => {
  const [isFetchingSchools, setIsFetchingSchools] = useState(true);
  const [schools, setSchools] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [schoolTotal, setSchoolTotal] = useState(0);
  const [pageTotal, setPageTotal] = useState(0);
  const [schoolSearchKeyword, setSchoolSearchKeyword] = useState("");

  const { control, watch } = useForm();

  const schoolItemsPerPage = 9;
  const schoolSearchInputValue = watch("search_school");

  const schoolQueryParams = {
    page: currentPage,
    per_page: schoolItemsPerPage,
    search: schoolSearchKeyword,
  };

  const fetchSchools = async (params) => {
    try {
      setIsFetchingSchools(true);
      setCurrentPage(params.page);
      const query = `?page=${params.page}&per_page=${
        params.per_page
      }&search=${escape(params.search)}`;
      const response = await axios.get(
        `/api/interest-and-talent/schools${query}`
      );
      const data = (await response?.data?.data?.schools) ?? [];
      const schoolTotalCount = response?.data?.data?.total ?? 0;
      const pageTotalCount = response?.data?.data?.last_page ?? 0;
      setSchools(data);
      setSchoolTotal(schoolTotalCount);
      setPageTotal(pageTotalCount);
      setIsFetchingSchools(false);
    } catch (error) {
      setIsFetchingSchools(false);
    }
  };

  const handlePageChange = (val) => {
    if (val === "next") {
      fetchSchools({ ...schoolQueryParams, page: schoolQueryParams.page + 1 });
    } else if (val === "prev") {
      fetchSchools({ ...schoolQueryParams, page: schoolQueryParams.page - 1 });
    } else {
      fetchSchools({ ...schoolQueryParams, page: val });
    }
  };

  const renderPageItems = () => {
    let startPage, endPage;
    if (pageTotal <= 10) {
      // less than 10 total pages so show all
      startPage = 1;
      endPage = pageTotal;
    } else if (pageTotal > 10) {
      // more than 10 total pages so calculate start and end pages
      if (currentPage <= 6) {
        startPage = 1;
        endPage = 10;
      } else if (currentPage + 4 >= pageTotal) {
        startPage = pageTotal - 9;
        endPage = pageTotal;
      } else {
        startPage = currentPage - 5;
        endPage = currentPage + 4;
      }
    }

    // create an array of pages to ng-repeat in the pager control
    const pages = [...Array(endPage + 1 - startPage).keys()].map(
      (i) => startPage + i
    );

    return pages.map((page, _) => {
      return (
        <PaginationItem
          key={page}
          active={currentPage === page}
          onClick={() => handlePageChange(page)}
        >
          <PaginationLink href="/" onClick={(e) => e.preventDefault()}>
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  const handleNext = () => {
    if (currentPage !== pageTotal) {
      handlePageChange("next");
    }
  };

  const handleOnSubmitSearch = (e) => {
    e.preventDefault();
    setSchoolSearchKeyword(schoolSearchInputValue);
  };

  const renderContent = () => {
    return schools.length ? (
      <Fragment>
        <SchoolHeader
          schoolTotal={schoolTotal}
          isFetchingSchools={isFetchingSchools}
        />
        <SchoolSearchbar
          control={control}
          searchSchool={handleOnSubmitSearch}
        />
        <SchoolCard
          stepper={stepper}
          schools={schools}
          selectSchool={selectSchool}
        />
        <Pagination className="d-flex justify-content-center">
          <PaginationItem
            disabled={currentPage === 1}
            className="prev-item"
            onClick={() =>
              currentPage !== 1 ? handlePageChange("prev") : null
            }
          >
            <PaginationLink
              href="/"
              onClick={(e) => e.preventDefault()}
            ></PaginationLink>
          </PaginationItem>
          {renderPageItems()}
          <PaginationItem
            className="next-item"
            onClick={() => handleNext()}
            disabled={currentPage === pageTotal}
          >
            <PaginationLink
              href="/"
              onClick={(e) => e.preventDefault()}
            ></PaginationLink>
          </PaginationItem>
        </Pagination>
      </Fragment>
    ) : (
      <div className="d-flex justify-content-center mt-2">
        <p>Data sekolah tidak ditemukan</p>
      </div>
    );
  };

  useEffect(() => {
    fetchSchools({ ...schoolQueryParams, page: 1 });
  }, [schoolSearchKeyword]);

  return (
    <div className="content-detached content-right">
      {isFetchingSchools ? <SpinnerCenter /> : renderContent()}
    </div>
  );
};

export default React.memo(School);
