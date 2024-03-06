import { Fragment } from "react";
import StudentPrePostTestReportSummary from "./StudentPrePostTestReportSummary";
import StudentPrePostTestReportTable from "./StudentPrePostTestReportTable";

const StudentPrePostTestReport = () => {
  return (
    <Fragment>
      <StudentPrePostTestReportSummary />
      <StudentPrePostTestReportTable />
    </Fragment>
  );
};

export default StudentPrePostTestReport;
