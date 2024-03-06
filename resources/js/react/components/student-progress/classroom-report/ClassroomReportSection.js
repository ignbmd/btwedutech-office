import { Fragment, useContext } from "react";
import { ClassroomReportContext } from "../../../context/ClassroomReportContext";
import ContentLoader from "react-content-loader";
import ClassroomReportSummary from "./ClassroomReportSummary";
import ClassroomReportTable from "./ClassroomReportTable";

const ClassroomReportSection = () => {
  const { isFetchingClassroomResults, classroomResults } = useContext(
    ClassroomReportContext
  );

  return isFetchingClassroomResults ? (
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
      {classroomResults ? (
        <Fragment>
          <ClassroomReportSummary />
          <ClassroomReportTable />
        </Fragment>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center">
          <img src="https://btw-cdn.com/assets/office/icons/no_data.png" />
        </div>
      )}
      ;
    </Fragment>
  );
};

export default ClassroomReportSection;
