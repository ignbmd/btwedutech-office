import { useContext } from "react";
import { ClassroomReportContext } from "../../../context/ClassroomReportContext";
import { getClassroomProgram } from "../../../utility/classroom-report";
import PTKClassroomReportSummary from "./PTKClassroomReportSummary";
import PTNClassroomReportSummary from "./PTNClassroomReportSummary";

const ClassroomReportSummary = () => {
  const { selectedClassroom } = useContext(ClassroomReportContext);
  const classroomProgram = getClassroomProgram(selectedClassroom);

  const renderClassroomReportSummaryComponent = (program) => {
    if (program == "ptn") {
      return <PTNClassroomReportSummary />;
    }
    return <PTKClassroomReportSummary />;
  };

  return renderClassroomReportSummaryComponent(classroomProgram);
};

export default ClassroomReportSummary;
