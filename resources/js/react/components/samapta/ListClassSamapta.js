import classNames from "classnames";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Select from "react-select";
import { Calendar, Download, Plus, Search, Tag, Users } from "react-feather";
import { Button, Card, CardBody, Col, Input, Label, Row } from "reactstrap";
import ReactPaginate from "react-paginate";
import { SamaptaContext } from "../../context/SamaptaContext";
import CreateSessionScoreForm from "./CreateSessionScoreForm";
import moment from "moment";
import { getStudentByClassroomId } from "../../services/samapta/samapta";

const ListCLassSamaptaTableContext = createContext();
const ListClassSamaptaTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage] = useState(5);
  const filters = [
    { label: "Pelaksanaan Terbaru", value: "new" },
    { label: "Pelaksanaan Terdahulu", value: "old" },
  ];
  const [data, setData] = useState([]);
  const [dataClassroom, setDataClassroom] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [sortOption, setSortOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [clickedRowId, setClickedRowId] = useState(null);

  const { showModalCreateSessionForm, setShowModalCreateSessionForm } =
    useContext(SamaptaContext);

  const getClassroomIdFromUrl = () => {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const path = urlObject.pathname;
    const pathParts = path.split("/");
    const idFromUrl = pathParts[pathParts.length - 1];
    return idFromUrl;
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getSession(getClassroomIdFromUrl());
        const classroomData = await getClassroom(getClassroomIdFromUrl());
        setData(data);
        setDataClassroom(classroomData);
        setFilteredData(data);
      } catch (error) {
        setData([]);
      }
    })();
  }, []);

  const getSession = async (id) => {
    const response = await axios.get(
      `/api/samapta/students/session-classroom/${id}`
    );
    const data = response.data;
    return data ?? [];
  };
  const getClassroom = async (id) => {
    const response = await axios.get(
      `/api/samapta/students/classroom-by-id/${id}`
    );
    const data = response.data;
    return data ?? [];
  };
  const contextProviderValue = useMemo(() => searchValue, [searchValue]);

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

  const handleSortChange = (selectedOption) => {
    setSortOption(selectedOption);
    // Menyortir data berdasarkan tanggal sesuai dengan opsi yang dipilih
    const sortedData = [...data].sort((a, b) => {
      const dateA = moment(a.date);
      const dateB = moment(b.date);

      if (selectedOption.value === "new") {
        return dateB - dateA; // Sort terbaru ke terlama
      } else if (selectedOption.value === "old") {
        return dateA - dateB; // Sort terlama ke terbaru
      }

      return 0;
    });

    setFilteredData(sortedData);
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
  const handleStudentList = () => {
    window.location.href = `/samapta/daftar-siswa/${dataClassroom._id}`;
  };

  const handleStudentRanks = (rowData) => {
    const selectedSessionId = rowData._id;
    window.location.href = `/samapta/detail-sesi/${selectedSessionId}`;
  };

  const handleGeneratePDFGroupRecord = async (id) => {
    try {
      setIsLoading(true);
      setClickedRowId(id);
      const response = await axios.post(
        `/api/samapta/students/download-group-record/${id}`
      );

      const data = response?.data;
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
      setIsLoading(false);
      setClickedRowId(id);
    } catch (error) {
      console.error("Terjadi kesalahan saat mengunduh data:", error);
    } finally {
      setIsLoading(false);
      setClickedRowId(id);
    }
  };

  const handleGeneratePDFGroupRecordBulk = async () => {
    try {
      setIsLoadingPDF(true);
      const response = await axios.post(
        `/api/samapta/students/download-group-record-bulk/${getClassroomIdFromUrl()}`
      );
      const data = response?.data;
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
      console.error("Terjadi kesalahan saat mengunduh data:", error);
    } finally {
      setIsLoadingPDF(false);
    }
  };
  return (
    <ListCLassSamaptaTableContext.Provider value={contextProviderValue}>
      <div className="d-flex align-items-center">
        <Col md="6" sm="12" className="d-flex align-items-center">
          <div>
            <h2>{dataClassroom.title}</h2>
            <h4>
              {dataClassroom.description
                ? dataClassroom.description
                : "SAMAPTA - PERGURUAN TINGGI KEDINASAN (PTK)"}
            </h4>
          </div>
        </Col>
        <Col className="ml-auto d-flex justify-content-end p-0">
          <Button
            color="outline-primary"
            disabled
            onClick={() => handleGeneratePDFGroupRecordBulk()}
          >
            {isLoadingPDF ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
                &nbsp; Mendownload...
              </span>
            ) : (
              <>
                <Download size={16} />
              </>
            )}
            {/* <Download size={10} /> Unduh Report */}
          </Button>
          <Button
            className="ml-1"
            color="outline-primary"
            onClick={handleStudentList}
          >
            Lihat Daftar Siswa
          </Button>
        </Col>
      </div>
      <div className="d-flex align-items-center mt-2">
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
              value={sortOption}
              onChange={handleSortChange}
              placeholder="Urutkan Berdasarkan"
            />
          </Col>

          {/* Buttons */}
          <Col className="ml-auto d-flex justify-content-end p-0">
            <Button
              className="ml-2"
              color="primary"
              onClick={() => setShowModalCreateSessionForm((prev) => !prev)}
            >
              <Plus size={16} /> Tambah Sesi Latihan
            </Button>
          </Col>
        </Col>
      </div>
      {/* List Card */}
      {/* <div>
        {displayData.map((data, index) => (
          <Card
            key={index}
            style={{
              marginBottom: "1rem",
            }}
          >
            <CardBody>
              <Row className="justify-content-between align-items-center">
                <Col className="d-flex">
                  <div
                    style={{
                      // borderRight: "1px solid #ccc",
                      paddingRight: "10px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div>
                      <h5> Detail Pelaksanaan</h5>
                    </div>
                    <h4 className="mt-1">
                      {data.title} | {formattedDate}
                    </h4>
                  </div>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Button color="link">
                    <Download size={10} /> Unduh Report
                  </Button>
                  <Button
                    color="link"
                    className="ml-1"
                    onClick={() => handleStudentRanks(data)}
                  >
                    Lihat Detail
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        ))}
      </div> */}
      <div>
        {displayData.length > 0 ? (
          displayData.map((data, index) => (
            <Card
              key={index}
              style={{
                marginBottom: "1rem",
              }}
            >
              <CardBody>
                <Row className="justify-content-between align-items-center">
                  <Col className="d-flex">
                    <div
                      style={{
                        paddingRight: "10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div>
                        <h5> Detail Pelaksanaan</h5>
                      </div>
                      <h4 className="mt-1">
                        {data.title} | {moment(data.date).format("DD/MM/YYYY")}
                      </h4>
                    </div>
                  </Col>
                  <Col className="d-flex justify-content-end">
                    <Button
                      color="link"
                      disabled={isLoading}
                      onClick={() => handleGeneratePDFGroupRecord(data._id)}
                    >
                      {isLoading && clickedRowId === data._id ? (
                        <span>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          />
                          &nbsp; Mendownload...
                        </span>
                      ) : (
                        <>
                          <Download size={16} /> Unduh Report
                        </>
                      )}
                      {/* <Download size={10} /> Unduh Report */}
                    </Button>
                    <Button
                      color="link"
                      className="ml-1"
                      onClick={() => handleStudentRanks(data)}
                    >
                      Lihat Detail
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          ))
        ) : (
          <Card style={{ marginBottom: "1rem" }}>
            <CardBody>
              <div className="text-center">
                <h5>Sesi tidak ditemukan</h5>
              </div>
            </CardBody>
          </Card>
        )}
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
      <CreateSessionScoreForm
        open={showModalCreateSessionForm}
        close={() => setShowModalCreateSessionForm((prev) => !prev)}
        ids={getClassroomIdFromUrl()}
        dataClass={dataClassroom}
      />
    </ListCLassSamaptaTableContext.Provider>
  );
};
export default ListClassSamaptaTable;
