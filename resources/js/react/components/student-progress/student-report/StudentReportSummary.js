import { useContext } from "react";
import { StudentReportContext } from "../../../context/StudentReportContext";
import { getClassroomProgram } from "../../../utility/student-report";
import PTKStudentReportSummary from "./PTKStudentReportSummary";
import PTNStudentReportSummary from "./PTNStudentReportSummary";
import CPNSStudentReportSummary from "./CPNSStudentReportSummary";

const StudentReportSummary = () => {
  const { classroom } = useContext(StudentReportContext);
  const classroomProgram = getClassroomProgram(classroom);

  const renderClassroomReportSummaryComponent = (program) => {
    if (program == "ptn") {
      return <PTNStudentReportSummary />;
    }
    if (program == "cpns") {
      return <CPNSStudentReportSummary />;
    }
    return <PTKStudentReportSummary />;
  };
  return renderClassroomReportSummaryComponent(classroomProgram);
};

export default StudentReportSummary;
