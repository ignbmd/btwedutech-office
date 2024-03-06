import { Fragment, useContext } from "react";
import StudentPresenceSummary from "./StudentPresenceSummary";
import StudentPresenceTable from "./StudentPresenceTable";
import { StudentReportContext } from "../../../context/StudentReportContext";
import { getStudentID } from "../../../utility/student-report";
import SpinnerCenter from "../../../components/core/spinners/Spinner";

const StudentPresence = () => {
  const { isFetchingStudentPresenceSummary, fetchStudentPresenceSummary } =
    useContext(StudentReportContext);

  return isFetchingStudentPresenceSummary ? (
    <SpinnerCenter />
  ) : (
    <Fragment>
      <StudentPresenceSummary />
      <StudentPresenceTable />
    </Fragment>
  );
};

export default StudentPresence;
