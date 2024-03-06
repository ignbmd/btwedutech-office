import { useContext } from "react";
import "primereact/resources/themes/lara-light-blue/theme.css";
import { StudentReportContext } from "../../../context/StudentReportContext";
import { getClassroomProgram } from "../../../utility/student-report";
import PTNStudentPrePostTestReportTable from "./PTNStudentPrePostTestReportTable";
import PTKStudentPrePostTestReportTable from "./PTKStudentPrePostTestReportTable";

const StudentPrePostTestReportTable = () => {
  const { classroom } = useContext(StudentReportContext);
  const classroomProgram = getClassroomProgram(classroom);

  return classroomProgram == "ptn" ? (
    <PTNStudentPrePostTestReportTable />
  ) : (
    <PTKStudentPrePostTestReportTable />
  );
};

export default StudentPrePostTestReportTable;
