import { Fragment, useContext, useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import DetailSessionRankMaleTable from "./DetailSessionRankMaleTable";
import DetailSessionRankFemaleTable from "./DetailSessionRankFemaleTable";
import classNames from "classnames";
import Select from "react-select";
import { Download, Edit } from "react-feather";
import EditSessionScoreForm from "./EditSessionScoreForm";
import { SamaptaContext } from "../../context/SamaptaContext";
import moment from "moment-timezone";

const DetailSessionTabPane = () => {
  const [activeTab, setActiveTab] = useState("Male_Rank");
  const [dataSession, setDataSession] = useState("Male_Rank");
  const [isLoading, setIsLoading] = useState(false);
  const filters = [
    { label: "Siswa Nilai Tertinggi", value: "Max" },
    { label: "Siswa Nilai Terendah", value: "Min" },
  ];
  const [selectedFilter, setSelectedFilter] = useState(null);

  const { showModalEditSessionForm, setShowModalEditSessionForm } =
    useContext(SamaptaContext);

  const getSessionIdFromUrl = () => {
    const currentUrl = window.location.href;
    const urlObject = new URL(currentUrl);
    const path = urlObject.pathname;
    const pathParts = path.split("/");
    const idFromUrl = pathParts[pathParts.length - 1];
    return idFromUrl;
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const sessionData = await getSession(getSessionIdFromUrl());
        setDataSession(sessionData);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const date = moment(dataSession.date).format("YYYY-MM-DD");

  const getSession = async (id) => {
    const response = await axios.get(`/api/samapta/students/session/${id}`);
    const data = response.data;
    return data ?? [];
  };

  const handleGeneratePDFGroupRecord = async (id) => {
    try {
      setIsLoading(true);

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
    } catch (error) {
      console.error("Terjadi kesalahan saat mengunduh data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Fragment>
      <div className="d-flex align-items-center">
        <Col md="6" sm="12" className="d-flex align-items-center">
          <div>
            <h2>
              {dataSession.title} | {date}
            </h2>
            <h4>Kelas Binaan Khusus (BINSUS) | SAMAPTA - PTK</h4>
          </div>
        </Col>
        <Col className="ml-auto d-flex justify-content-end p-0">
          <Button
            color="outline-primary"
            onClick={() => setShowModalEditSessionForm((prev) => !prev)}
          >
            <Edit size={16} /> Edit Nilai
          </Button>
          <Button
            className="ml-1"
            color="primary"
            onClick={() => handleGeneratePDFGroupRecord(getSessionIdFromUrl())}
            disabled={isLoading}
          >
            {isLoading ? (
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
                <Download size={16} /> Unduh Ranking PDF
              </>
            )}
          </Button>
        </Col>
      </div>
      <Card>
        <CardBody>
          <div className="d-flex">
            <Nav tabs>
              <NavItem>
                <NavLink
                  active={activeTab === "Male_Rank"}
                  onClick={() => toggleTab("Male_Rank")}
                >
                  Ranking Laki - Laki
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={activeTab === "Female_Rank"}
                  onClick={() => toggleTab("Female_Rank")}
                >
                  Ranking Perempuan
                </NavLink>
              </NavItem>
            </Nav>
            <Col
              md="2"
              sm="12"
              className="d-flex align-items-center ml-auto p-0"
            >
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
                onChange={(selectedOption) => setSelectedFilter(selectedOption)}
                placeholder="Urutkan Berdasarkan"
              />
            </Col>
          </div>
          <TabContent activeTab={activeTab}>
            <TabPane tabId={"Male_Rank"}>
              <DetailSessionRankMaleTable selectedFilter={selectedFilter} />
              {/* component Ranking Laki-laki */}
            </TabPane>
            <TabPane tabId={"Female_Rank"}>
              <DetailSessionRankFemaleTable selectedFilter={selectedFilter} />
              {/* component Ranking Perempuan */}
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
      <EditSessionScoreForm
        open={showModalEditSessionForm}
        close={() => setShowModalEditSessionForm((prev) => !prev)}
        sessionId={getSessionIdFromUrl()}
      />
    </Fragment>
  );
};
export default DetailSessionTabPane;
