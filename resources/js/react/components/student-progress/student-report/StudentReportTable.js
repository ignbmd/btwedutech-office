import { useContext } from "react";
import { StudentReportContext } from "../../../context/StudentReportContext";
import { getClassroomProgram } from "../../../utility/student-report";
import PTKStudentReportTable from "./PTKStudentReportTable";
import PTNStudentReportTable from "./PTNStudentReportTable";
import CPNSStudentReportTable from "./CPNSStudentReportTable";

import "primereact/resources/themes/lara-light-blue/theme.css";

const StudentReportTable = () => {
  const { classroom } = useContext(StudentReportContext);
  const classroomProgram = getClassroomProgram(classroom);

  const renderStudentReportTable = (program) => {
    if (program == "ptn") {
      return <PTNStudentReportTable />;
    }

    if (program == "cpns") {
      return <CPNSStudentReportTable />;
    }

    return <PTKStudentReportTable />;
  };
  return renderStudentReportTable(classroomProgram);
};

export default StudentReportTable;
