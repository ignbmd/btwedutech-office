import { Fragment } from "react";
import ReactDOM from "react-dom";
import ModuleFilter from "../../components/student-progress/classroom-report/ModuleFilter";
import ClassroomReportSection from "../../components/student-progress/classroom-report/ClassroomReportSection";
import ClassroomReportContextProvider from "../../context/ClassroomReportContext";

const ClassroomReport = () => {
  return (
    <Fragment>
      <ModuleFilter />
      <ClassroomReportSection />
    </Fragment>
  );
};

export default ClassroomReport;

if (document.getElementById("container")) {
  ReactDOM.render(
    <ClassroomReportContextProvider>
      <ClassroomReport />
    </ClassroomReportContextProvider>,
    document.getElementById("container")
  );
}
