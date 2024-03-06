import { Fragment, useContext } from "react";
import { StudentReportContext } from "../../../context/StudentReportContext";
import ContentLoader from "react-content-loader";
import StudentReportSummary from "./StudentReportSummary";
import StudentReportTable from "./StudentReportTable";
import SendDocumentModal from "./SendDocumentModal";
import ModuleFilter from "./ModuleFilter";

const StudentReportSection = () => {
  const { isFetchingStudentResult } = useContext(StudentReportContext);
  return (
    <Fragment>
      <ModuleFilter />
      {isFetchingStudentResult ? (
        <ContentLoader
          speed={2}
          width={400}
          height={160}
          viewBox="0 0 400 160"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <rect x="0" y="56" rx="3" ry="3" width="410" height="6" />
          <rect x="0" y="72" rx="3" ry="3" width="410" height="6" />
          <rect x="0" y="88" rx="3" ry="3" width="410" height="6" />
        </ContentLoader>
      ) : (
        <Fragment>
          <StudentReportSummary />
          <StudentReportTable />
          <SendDocumentModal />
        </Fragment>
      )}
    </Fragment>
  );
};

export default StudentReportSection;
