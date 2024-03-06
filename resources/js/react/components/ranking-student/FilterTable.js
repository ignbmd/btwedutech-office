import React, { createContext, useState, useContext, useMemo } from "react";
import ReactPaginate from "react-paginate";
import { ChevronDown } from "react-feather";
import DataTable from "react-data-table-component";
import { Card, Col, Input, Row, FormGroup, Button, Spinner } from "reactstrap";
import TableLoader from "../core/skeleton-loader/TableLoader";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import * as yup from "yup";
import classnames from "classnames";
import moment from "moment-timezone";
import axios from "axios";

const FilterProgramTableContext = createContext();

const CustomPagination = () => {
  const { currentPage, handlePagination, searchValue, filteredData, data } =
    useContext(FilterProgramTableContext);
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

const FilterProgramTable = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
  const {
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      program: [],
      question_category: [],
    },
  });

  const { program, question_category } = watch();

  const FormSchema = yup.object().shape({
    program: yup.string().required(),
    question_category: yup.string().required(),
  });

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) return;
    setFilteredData(
      data.filter((item) => {
        const key = value.toLowerCase();
        const matchNameUKA = item?.ranking?.title?.toLowerCase().includes(key);
        const matchPrograms = item?.program?.toLowerCase().includes(key);
        const matchType = item?.packages?.package_type
          .toLowerCase()
          .includes(key);
        const matchCode = item?.tryout_code?.toLowerCase().includes(key);
        const matchDate = item?.start_date?.toLowerCase().includes(key);
        const matchAmount = item?.amount?.toString().includes(key);
        const anyMatch = [
          matchNameUKA,
          matchPrograms,
          matchAmount,
          matchType,
          matchCode,
          matchDate,
        ].some(Boolean);
        return anyMatch;
      })
    );
  };

  const getUKAList = async () => {
    const selectedProgram = program.slug;
    const selectedCategory = question_category.value;
    const response = await axios.get(
      `/api/new-ranking/get-all-uka/${selectedProgram}/category/${selectedCategory}`
    );
    const data = response.data;
    return data?.data ?? [];
  };

  const columnsSKD = [
    {
      name: "No",
      sortable: false,
      maxWidth: "80px",
      selector: "no",
    },
    {
      name: "Nama UKA",
      sortable: false,
      wrap: true,
      selector: "ranking.title",
    },
    {
      name: "Tipe UKA",
      sortable: false,
      wrap: true,
      selector: (row) =>
        row.packages.package_type === "WITH_CODE"
          ? "UKA Kode"
          : packages.package_type,
    },
    {
      name: "Program",
      sortable: false,
      wrap: true,
      selector: "program",
    },
    {
      name: "Kode UKA",
      sortable: false,
      wrap: true,
      selector: "tryout_code",
    },
    {
      name: "Tanggal Mulai",
      sortable: false,
      wrap: true,
      selector: (row) =>
        row.packages.start_date
          ? `${moment(row.packages.start_date)
              .tz("Asia/Jakarta")
              .format("DD/MM/YYYY - HH:mm")} WIB`
          : "-",
    },
    {
      name: "Aksi",
      center: true,
      allowOverflow: true,
      style: { height: "unset !important" },
      cell: (row) => (
        <a
          href={`/ranking-siswa/ranking/${program.slug}/kategori/${row.ranking.legacy_task_id}/tryout-kode/${row.tryout_code}`}
          className="btn btn-primary"
        >
          Lihat Ranking
        </a>
      ),
    },
  ];
  const columnsSNBT = [
    {
      name: "No",
      sortable: false,
      maxWidth: "80px",
      selector: "no",
    },
    {
      name: "Nama UKA",
      sortable: false,
      wrap: true,
      selector: "title",
    },
    {
      name: "Program",
      sortable: false,
      wrap: true,
      selector: "program",
    },
    {
      name: "Aksi",
      center: true,
      allowOverflow: true,
      style: { height: "unset !important" },
      cell: (row) => (
        <a
          href={`/ranking-siswa/ranking/${program.slug}/kategori/${row.ranking.legacy_task_id}`}
          className="btn btn-primary"
        >
          Lihat Ranking
        </a>
      ),
    },
  ];

  const handlePagination = (page) => {
    setCurrentPage(page.selected);
  };

  const categories = [
    {
      label: "UKA Kode",
      value: "tryout_codes",
    },
    {
      label: "UKA Stage Kelas",
      value: "uka_stage_kelas",
    },
    {
      label: "UKA Stage Umum",
      value: "uka_stage_umum",
    },
  ];

  const programs = [
    {
      label: "PTK",
      slug: "skd",
    },
    {
      label: "PTN",
      slug: "utbk",
    },
    {
      label: "CPNS",
      slug: "cpns",
    },
  ];

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

  const handleFilterData = () => {
    (async () => {
      setIsLoading(true);
      setButtonDisabled(true);
      try {
        const items = await getUKAList();
        let dataWithNumber = [];
        if (question_category.value == "tryout_codes") {
          dataWithNumber = items.map((item, index) => {
            const mappedData = { ...item };
            mappedData.no = index + 1;
            mappedData.ranking = {};
            mappedData.ranking.title = item.packages.title;
            mappedData.ranking.type = item.packages.package_type;
            mappedData.ranking.program = item.program;
            mappedData.ranking.tryout_code = item.tryout_code;
            mappedData.ranking.start_date = item.packages.start_date;
            mappedData.ranking.legacy_task_id = item.packages.legacy_task_id;
            return mappedData;
          });
        } else {
          dataWithNumber = items?.map((item, index) => {
            const mappedData = { ...item };
            mappedData.no = index + 1;
            mappedData.ranking = {};
            mappedData.ranking.title = item.title;
            mappedData.ranking.program = item.program;
            mappedData.ranking.start_date = item.start_date;
            mappedData.ranking.legacy_task_id = item.legacy_task_id;
            return mappedData;
          });
        }
        setData(dataWithNumber);
        setButtonDisabled(false);
        setIsLoading(false);
      } catch (error) {
        setData([]);
        setIsLoading(false);
        setButtonDisabled(false);
      }
    })();
  };

  const selectedColumns = useMemo(() => {
    if (question_category.value === "tryout_codes") {
      return columnsSKD;
    } else {
      return columnsSNBT;
    }
  }, [data]);

  return (
    <FilterProgramTableContext.Provider value={contextProviderValue}>
      <Card>
        <div className="d-flex align-items-center justify-content-between mt-1">
          <div className="d-flex align-items-center justify-content-start flex-grow-1">
            <Col
              md="12"
              sm="12"
              className="d-flex align-items-center justify-content-start mb-75 mt-1"
            >
              <Controller
                name="question_category"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill">
                      <Select
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                        {...field}
                        options={categories}
                        classNamePrefix="select"
                        className={classnames("react-select", {
                          "is-invalid": error && true,
                        })}
                        placeholder="Kategori Ranking"
                      />
                    </FormGroup>
                  );
                }}
              />
              <div style={{ margin: "10px" }}></div>
              <Controller
                name="program"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill">
                      <Select
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                        {...field}
                        options={programs}
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.slug}
                        classNamePrefix="select"
                        className={classnames("react-select", {
                          "is-invalid": error && true,
                        })}
                        placeholder="Program"
                      />
                    </FormGroup>
                  );
                }}
              />
              {/* <Button
                color="primary"
                className="ml-2 mb-1"
                onClick={() => {
                  handleFilterData();
                }}
              >
                Terapkan
              </Button> */}
              <Button
                color="primary"
                className="ml-2 mb-1"
                onClick={handleFilterData}
                disabled={isButtonDisabled}
              >
                {isButtonDisabled ? (
                  <Spinner size="sm" color="light" />
                ) : (
                  "Terapkan"
                )}
              </Button>
            </Col>
          </div>
        </div>
      </Card>
      <div>
        {!Array.isArray(data) ? (
          <img
            src="https://btw-cdn.com/assets/office/icons/no_data.png"
            alt="No data"
            style={{
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: "5%",
            }}
          />
        ) : (
          <Card>
            <Row className="justify-content-start mx-0 mt-1">
              <Col
                className="d-flex align-items-center justify-content-start mb-75"
                md="6"
                sm="12"
              >
                <Input
                  className="dataTable-filter"
                  type="text"
                  bsSize="sm"
                  id="search-input"
                  value={searchValue}
                  onChange={handleFilter}
                  placeholder="Cari...."
                />
              </Col>
            </Row>
            <div>
              <DataTable
                noHeader
                pagination
                columns={selectedColumns}
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
        )}
      </div>
      {/* <Card>
        <Row className="justify-content-start mx-0 mt-1">
          <Col
            className="d-flex align-items-center justify-content-start mb-75"
            md="6"
            sm="12"
          >
            <Input
              className="dataTable-filter"
              type="text"
              bsSize="sm"
              id="search-input"
              value={searchValue}
              onChange={handleFilter}
              placeholder="Cari...."
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
      </Card> */}
    </FilterProgramTableContext.Provider>
  );
};

export default FilterProgramTable;
