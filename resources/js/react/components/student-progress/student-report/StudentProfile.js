import { useContext, useState, useEffect, Fragment } from "react";
import ContentLoader from "react-content-loader";
import { StudentReportContext } from "../../../context/StudentReportContext";
import {
  getClassroomID,
  getClassroomProgram,
  getQueryParams,
  getStudentID,
} from "../../../utility/student-report";

const classroomID = getClassroomID();
const studentID = getStudentID();

const StudentProfile = () => {
  const {
    isFetchingStudentProfile,
    studentProfile,
    fetchStudentProfile,
    isFetchingStudentTarget,
    studentTarget,
    fetchStudentTarget,
    isFetchingClassroom,
    classroom,
    fetchClassroom,
    fetchStudentResult,
  } = useContext(StudentReportContext);
  const [classroomProgram, setClassroomProgram] = useState(null);

  useEffect(() => {
    (async () => {
      fetchStudentProfile(studentID);
      fetchClassroom(classroomID);
    })();
  }, []);

  useEffect(() => {
    if (!classroom) return;
    setClassroomProgram(getClassroomProgram(classroom));
  }, [classroom]);

  useEffect(() => {
    if (!classroomProgram) return;
    const params = getQueryParams();
    const moduleType = params?.module_type ?? "ALL_MODULE";
    const stageType = params?.stage_type ?? "UMUM";
    fetchStudentTarget(studentID, classroomProgram);
    fetchStudentResult(studentID, classroomProgram, stageType, moduleType);
  }, [classroomProgram]);

  return isFetchingStudentProfile ||
    isFetchingStudentTarget ||
    isFetchingClassroom ? (
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
      <div className="font-weight-bolder h3">
        {studentProfile?.name ?? "-"} | {classroom?.title ?? "-"}
      </div>
      {classroomProgram == "cpns" ? (
        <div className="font-weight-bold text-uppercase h4">
          {studentTarget?.instance_name ?? "-"} - {studentTarget?.position_name}{" "}
          ● Nilai Min. {studentTarget?.target_score ?? "-"}
        </div>
      ) : (
        <div className="font-weight-bold text-uppercase h4">
          {studentTarget?.school_name ?? "-"} - {studentTarget?.major_name} ●
          Nilai Min. {studentTarget?.target_score ?? "-"}
        </div>
      )}
    </Fragment>
  );
};

export default StudentProfile;
