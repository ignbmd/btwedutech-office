import { Fragment } from "react";
import ReactDOM from "react-dom";
import StudentProfile from "../../components/student-progress/student-report/StudentProfile";
import StudentReportContextProvider from "../../context/StudentReportContext";
import StudentReportTabPane from "../../components/student-progress/student-report/StudentReportTabPane";

const StudentReport = () => {
  return (
    <Fragment>
      <StudentProfile />
      <StudentReportTabPane />
    </Fragment>
  );
};

export default StudentReport;

if (document.getElementById("container")) {
  ReactDOM.render(
    <StudentReportContextProvider>
      <StudentReport />
    </StudentReportContextProvider>,
    document.getElementById("container")
  );
}
