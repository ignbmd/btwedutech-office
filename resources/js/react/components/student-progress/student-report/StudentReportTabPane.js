import { Fragment, useContext, useEffect, useState } from "react";
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Card,
  CardBody,
} from "reactstrap";
import {
  getClassroomProgram,
  getStudentID,
} from "../../../utility/student-report";
import { StudentReportContext } from "../../../context/StudentReportContext";
import StudentPrePostTestReport from "./StudentPrePostTestReport";
import StudentPresence from "../student-presence/StudentPresence";
import StudentReportSection from "../../../components/student-progress/student-report/StudentReportSection";
import PTKStudentPrePostTestReportTable from "./PTKStudentPrePostTestReportTable";
import PTNStudentPrePostTestReportTable from "./PTNStudentPrePostTestReportTable";

const studentID = getStudentID();

const StudentReportTabPane = () => {
  const {
    fetchStudentPresenceSummary,
    fetchStudentPrePostTestReportSummary,
    classroom,
  } = useContext(StudentReportContext);
  const classroomProgram = getClassroomProgram(classroom);
  const [activeTab, setActiveTab] = useState("UKA_REPORT");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    fetchStudentPresenceSummary(studentID);
  }, []);

  useEffect(() => {
    if (!classroom) return;
    fetchStudentPrePostTestReportSummary(studentID, classroomProgram);
  }, [classroom]);

  return (
    <Fragment>
      <Card style={{ backgroundColor: "#F9F9F9" }}>
        <CardBody>
          <Nav tabs>
            <NavItem>
              <NavLink
                active={activeTab === "UKA_REPORT"}
                onClick={() => toggleTab("UKA_REPORT")}
              >
                Rapor UKA Stage
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === "PRE_POST_TEST_REPORT"}
                onClick={() => toggleTab("PRE_POST_TEST_REPORT")}
              >
                Rapor Pre & Post Tes
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={activeTab === "PRESENCE_REPORT"}
                onClick={() => toggleTab("PRESENCE_REPORT")}
              >
                Absensi Siswa
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="UKA_REPORT">
              <StudentReportSection />
            </TabPane>
            <TabPane tabId="PRE_POST_TEST_REPORT">
              <StudentPrePostTestReport />
            </TabPane>
            <TabPane tabId="PRESENCE_REPORT">
              <StudentPresence />
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default StudentReportTabPane;
