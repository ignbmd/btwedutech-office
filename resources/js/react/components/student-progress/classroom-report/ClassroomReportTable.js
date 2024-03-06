import { useContext } from "react";
import { ClassroomReportContext } from "../../../context/ClassroomReportContext";
import { getClassroomProgram } from "../../../utility/classroom-report";
import PTKClassroomReportTable from "./PTKClassroomReportTable";
import PTNClassroomReportTable from "./PTNClassroomReportTable";
import CPNSClassroomReportTable from "./CPNSClassroomReportTable";

const ClassroomReportTable = () => {
  const { selectedClassroom } = useContext(ClassroomReportContext);
  const classroomProgram = getClassroomProgram(selectedClassroom);

  const renderStudentReportTable = (program) => {
    if (program == "ptn") {
      return <PTNClassroomReportTable />;
    }
    if (program == "cpns") {
      return <CPNSClassroomReportTable />;
    }
    return <PTKClassroomReportTable />;
  };

  return renderStudentReportTable(classroomProgram);
};

export default ClassroomReportTable;
