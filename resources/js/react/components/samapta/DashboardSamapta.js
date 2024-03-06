import classNames from "classnames";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import { Calendar, Plus, Search, Tag, Users } from "react-feather";
import {
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Label,
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  FormFeedback,
  FormGroup,
  Form,
} from "reactstrap";
import ReactPaginate from "react-paginate";
import clsx from "clsx";
import { selectionTypes, selectionYears } from "../../config/samapta";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SamaptaContext } from "../../context/SamaptaContext";

import CreateGlobalExerciseScoreForm from "./CreateGlobalExerciseScoreForm/index";
import axios from "axios";

// const DashboardSamaptaTableContext = createContext();
const DashboardSamaptaTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage] = useState(5);
  const [isChartModalOpen, setChartModalOpen] = useState(false);
  const filters = [
    { label: "Terbaru", value: "new" },
    { label: "Terdahulu", value: "old" },
  ];
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);

  const { showModalGlobalScoreForm, setShowModalGlobalScoreForm } =
    useContext(SamaptaContext);

  const FormSchema = yup.object().shape({
    selection_type_ranking: yup
      .object()
      .required("Wajib diisi")
      .typeError("Wajib diisi"),
    selection_year_ranking: yup
      .object()
      .required("Wajib diisi")
      .typeError("Wajib diisi"),
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      selection_type: "",
      selection_year: "",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getClassroom();
        setFilteredData(data);
        setData(data);
      } catch (error) {
        setData([]);
      }
    })();
  }, []);

  const getClassroom = async () => {
    const response = await axios.get(`api/samapta/students/classroom`);
    const data = response.data;
    return data ?? [];
  };
  const toggleGenerateRankingModal = () => {
    setValue("selection_type_ranking", "");
    setValue("selection_year_ranking", "");
    setChartModalOpen(!isChartModalOpen);
  };

  const getRankings = async (type, year) => {
    const response = await axios.post(
      `api/samapta/students/download-ranking/${type}/year/${year}`
    );
    const data = response.data;
    return data ?? [];
  };

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.length) {
      setFilteredData(data); // Reset to original data when search input is empty
      return;
    }
    // if (!value.length) return;
    setFilteredData(
      data.filter((item) => {
        const key = value.toLowerCase();
        const matchName = item?.title?.toLowerCase().includes(key);
        const anyMatch = [matchName].some(Boolean);
        return anyMatch;
      })
    );
  };

  const handleGenerateRanking = () => {
    trigger();
    const selectedType = watch("selection_type_ranking");
    const selectedYear = watch("selection_year_ranking");
    const type = selectedType?.value;
    const year = selectedYear?.value;
    (async () => {
      try {
        setIsLoadingPDF(true);
        const response = await getRankings(type, year);
        const data = response;
        const linkDownload = data?.data?.link;

        if (linkDownload) {
          const downloadLink = document.createElement("a");
          downloadLink.href = linkDownload;
          downloadLink.style.display = "none";

          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } else {
          console.error("Link download tidak ditemukan.");
        }
        setIsLoadingPDF(false);
      } catch (error) {
        setIsLoadingPDF(false);
      }
    })();
  };

  const handleFilterYear = (selectedOption) => {
    setSelectedFilter(selectedOption);

    let sortedData = [...data];

    if (selectedOption.value === "new") {
      // Sorting data by newest year
      sortedData.sort((a, b) => b.year - a.year);
    } else if (selectedOption.value === "old") {
      // Sorting data by oldest year
      sortedData.sort((a, b) => a.year - b.year);
    }

    setFilteredData(sortedData);
  };

  const handleListClass = (rowData) => {
    const selectedClassId = rowData._id;
    window.location.href = `samapta/list-class/${selectedClassId}`;
  };
  // Fungsi untuk mengatur tampilan data sesuai halaman yang dipilih
  const displayData = useMemo(() => {
    const startIndex = currentPage * perPage;
    const endIndex = startIndex + perPage;
    return filteredData.slice(startIndex, endIndex);
  }, [currentPage, perPage, filteredData]);

  const handlePageClick = (data) => {
    const selectedPage = data.selected;
    setCurrentPage(selectedPage);
  };

  return (
    <>
      <div className="d-flex align-items-center">
        <Col
          className="d-flex align-items-center justify-content-start mb-75 p-0"
          md="12"
          sm="12"
        >
          {/* Search Input */}
          <Input
            className="dataTable-filter"
            type="text"
            id="search-input"
            value={searchValue}
            onChange={handleFilter}
            placeholder="Cari Sesi Samapta"
          />
          {/* Select Input */}
          <Col md="3" sm="12" className="d-flex align-items-center">
            <Select
              options={filters}
              classNamePrefix="select"
              className={classNames("react-select w-100", {})}
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
                control: (provided) => ({
                  ...provided,
                  background: "transparent",
                  border: "1px solid #ccc",
                }),
              }}
              onChange={handleFilterYear}
              value={selectedFilter}
              placeholder="Urutkan Berdasarkan"
            />
          </Col>

          {/* Buttons */}
          <Col className="ml-auto d-flex justify-content-end p-0">
            <Button
              className="ml-2"
              color="outline-primary"
              onClick={toggleGenerateRankingModal}
              disabled
              // disabled={isLoadingPDF}
            >
              Lihat Ranking
            </Button>
            <Button
              className="ml-2"
              color="primary"
              onClick={() => setShowModalGlobalScoreForm((prev) => !prev)}
            >
              <Plus size={16} /> Tambah Nilai Global
            </Button>
          </Col>
        </Col>
      </div>
      {/* List Card */}
      <div>
        {displayData.map((data, index) => (
          <Card
            key={index}
            style={{
              marginBottom: "1rem",
            }}
          >
            <CardBody>
              <Row className="justify-content-between align-items-center">
                <Col>
                  <h3>{data.title}</h3>
                </Col>
                <Col className="d-flex">
                  <div
                    style={{
                      borderRight: "1px solid #ccc",
                      paddingRight: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div>
                      <Tag size={16} />
                      <span> Seleksi</span>
                    </div>
                    <p className="mt-1">{data.tags[0]}</p>
                  </div>
                  <div
                    className="ml-2"
                    style={{
                      borderRight: "1px solid #ccc",
                      paddingRight: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <p>
                      <Users size={16} /> Anggota
                    </p>
                    <p>{data.count_member} Orang</p>
                  </div>
                  <div className="ml-2" style={{ whiteSpace: "nowrap" }}>
                    <p>
                      <Calendar size={16} /> Tahun Ajar
                    </p>
                    <p>{data.year}</p>
                  </div>
                </Col>
                <Col className="ml-auto">
                  <Button
                    color="primary"
                    className="float-right"
                    onClick={() => handleListClass(data)}
                  >
                    Lihat Kelas
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        ))}
      </div>
      <ReactPaginate
        previousLabel={""}
        nextLabel={""}
        breakLabel={"..."}
        pageCount={Math.ceil(filteredData.length / perPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        subContainerClassName={"pages pagination"}
        activeClassName={"active"}
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
      <Modal
        isOpen={isChartModalOpen}
        toggle={toggleGenerateRankingModal}
        size="md"
        centered
      >
        <Form onSubmit={handleSubmit(handleGenerateRanking)}>
          <ModalBody>
            <div>
              <h3>Unduh Ranking Samapta</h3>
              <div>
                <Controller
                  name="selection_type_ranking"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup>
                        <Label className={clsx("font-weight-bolder")}>
                          Tipe Seleksi
                        </Label>
                        <Select
                          {...field}
                          onChange={(selectedOptionModal) => {
                            setValue(
                              "selection_type_ranking",
                              selectedOptionModal
                            ); // Set value saat opsi dipilih
                          }}
                          value={watch("selection_type_ranking")}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999,
                            }),
                          }}
                          isSearchable
                          options={selectionTypes}
                          classNamePrefix="select"
                          className={clsx("react-select", {
                            "is-invalid": error && true,
                          })}
                          placeholder="Pilih Tipe Seleksi"
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
                <Controller
                  name="selection_year_ranking"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup>
                        <Label className={clsx("font-weight-bolder")}>
                          Tahun Ajaran
                        </Label>
                        <Select
                          {...field}
                          onChange={(selectedOptionModal) => {
                            setValue(
                              "selection_year_ranking",
                              selectedOptionModal
                            ); // Set value saat opsi dipilih
                          }}
                          // Properti value untuk menampilkan nilai yang dipilih
                          value={watch("selection_year_ranking")}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999,
                            }),
                          }}
                          isSearchable
                          options={selectionYears}
                          classNamePrefix="select"
                          className={clsx("react-select", {
                            "is-invalid": error && true,
                          })}
                          placeholder="Pilih Tahun Ajaran"
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="outline-primary"
              onClick={toggleGenerateRankingModal}
            >
              Tutup
            </Button>
            <Button color="primary" type="submit">
              {isLoadingPDF ? (
                <span>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  />
                  &nbsp; Sedang Memproses...
                </span>
              ) : (
                <>Generate Ranking </>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
      <CreateGlobalExerciseScoreForm
        open={showModalGlobalScoreForm}
        close={() => setShowModalGlobalScoreForm((prev) => !prev)}
      />
    </>
  );
};
export default DashboardSamaptaTable;
