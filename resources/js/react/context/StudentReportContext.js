import { createContext, useMemo, useState } from "react";
import {
  getSingleStudentProfile,
  getSingleStudentResult,
  getAllSingleStudentTarget,
  getSingleClassroomByID,
  getSingleStudentPresenceReportSummary,
  getSingleStudentPrePostTestReportSummary,
} from "../services/student-progress/student-report";
import PropTypes from "prop-types";

export const StudentReportContext = createContext({
  isFetchingStudentProfile: false,
  studentProfile: null,
  fetchStudentProfile: () => {},
  isFetchingStudentResult: false,
  studentResult: null,
  fetchStudentResult: () => {},
  isFetchingStudentTarget: false,
  studentTarget: null,
  fetchStudentTarget: () => {},
  selectedUkaType: null,
  setSelectedUkaType: () => {},
  selectedModuleType: null,
  setSelectedModuleType: () => {},
  isFetchingClassroom: false,
  classroom: null,
  fetchClassroom: () => {},
  isSendDocumentModalShown: false,
  toggleShowSendDocumentModal: () => {},
  sendDocumentModalType: null,
  setSendDocumentModalType: () => {},
  studentPresenceSummary: null,
  isFetchingStudentPresenceSummary: false,
  fetchStudentPresenceSummary: () => {},
  studentPrePostTestReportSummary: null,
  isFetchingStudentPrePostTestReportSummary: false,
  fetchStudentPrePostTestReportSummary: () => {},
});

const StudentReportContextProvider = (props) => {
  const [isFetchingStudentProfile, setIsFetchingStudentProfile] =
    useState(true);
  const [studentProfile, setStudentProfile] = useState(null);

  const fetchStudentProfile = async (student_id) => {
    try {
      setIsFetchingStudentProfile(true);
      const profile = await getSingleStudentProfile(student_id);
      setStudentProfile(profile);
    } catch (error) {
      console.error(error);
      setStudentProfile(null);
    } finally {
      setIsFetchingStudentProfile(false);
    }
  };

  const [isFetchingStudentResult, setIsFetchingStudentResult] = useState(true);
  const [studentResult, setStudentResult] = useState([]);
  const fetchStudentResult = async (
    student_id,
    program = "ptk",
    stage_type = "UMUM",
    module_type = "ALL_MODULE"
  ) => {
    try {
      setIsFetchingStudentResult(true);
      const result = await getSingleStudentResult(
        student_id,
        program,
        stage_type,
        module_type
      );
      setStudentResult(result);
    } catch (error) {
      console.error(error);
      setStudentResult(null);
    } finally {
      setIsFetchingStudentResult(false);
    }
  };

  const [isFetchingStudentTarget, setIsFetchingStudentTarget] = useState(true);
  const [studentTarget, setStudentTarget] = useState(null);
  const fetchStudentTarget = async (student_id, target_type = "ptk") => {
    try {
      setIsFetchingStudentTarget(true);
      const result = await getAllSingleStudentTarget(
        student_id,
        target_type?.toUpperCase()
      );
      setStudentTarget(result?.find((res) => res.type == "PRIMARY"));
    } catch (error) {
      console.error(error);
      setStudentTarget(null);
    } finally {
      setIsFetchingStudentTarget(false);
    }
  };

  const [isFetchingClassroom, setIsFetchingClassroom] = useState(true);
  const [classroom, setClassroom] = useState(null);
  const fetchClassroom = async (classroom_id) => {
    try {
      setIsFetchingClassroom(true);
      const result = await getSingleClassroomByID(classroom_id);
      setClassroom(result);
    } catch (error) {
      console.error(error);
      setClassroom(null);
    } finally {
      setIsFetchingClassroom(false);
    }
  };

  const [isSendDocumentModalShown, setIsSendDocumentModalShown] =
    useState(false);
  const toggleShowSendDocumentModal = () => {
    setIsSendDocumentModalShown(!isSendDocumentModalShown);
  };

  const [selectedUkaType, setSelectedUkaType] = useState("UMUM");
  const [selectedModuleType, setSelectedModuleType] = useState("ALL_MODULE");
  const [sendDocumentModalType, setSendDocumentModalType] = useState(
    "STUDENT_UKA_PROGRESS_REPORT"
  );

  const [
    isFetchingStudentPresenceSummary,
    setIsFetchingStudentPresenceSummary,
  ] = useState(null);
  const [studentPresenceSummary, setStudentPresenceSummary] = useState(null);
  const fetchStudentPresenceSummary = async (student_id) => {
    try {
      setIsFetchingStudentPresenceSummary(true);
      const data = await getSingleStudentPresenceReportSummary(student_id);
      setStudentPresenceSummary(data);
    } catch (error) {
      console.error(error);
      setStudentPresenceSummary(null);
    } finally {
      setIsFetchingStudentPresenceSummary(false);
    }
  };

  const [
    isFetchingStudentPrePostTestReportSummary,
    setIsFetchingStudentPrePostTestReportSummary,
  ] = useState(null);
  const [studentPrePostTestReportSummary, setStudentPrePostTestReportSummary] =
    useState(null);
  const fetchStudentPrePostTestReportSummary = async (student_id, program) => {
    try {
      setIsFetchingStudentPrePostTestReportSummary(true);
      const data = await getSingleStudentPrePostTestReportSummary(
        student_id,
        program
      );
      setStudentPrePostTestReportSummary(data);
    } catch (error) {
      console.error(error);
      setStudentPrePostTestReportSummary(null);
    } finally {
      setIsFetchingStudentPrePostTestReportSummary(false);
    }
  };
  const contextProviderValue = useMemo(() => {
    return {
      isFetchingStudentProfile,
      studentProfile,
      fetchStudentProfile,
      isFetchingStudentResult,
      studentResult,
      fetchStudentResult,
      isFetchingStudentTarget,
      studentTarget,
      fetchStudentTarget,
      isFetchingClassroom,
      classroom,
      fetchClassroom,
      selectedUkaType,
      setSelectedUkaType,
      selectedModuleType,
      setSelectedModuleType,
      isSendDocumentModalShown,
      toggleShowSendDocumentModal,
      sendDocumentModalType,
      setSendDocumentModalType,
      isFetchingStudentPresenceSummary,
      studentPresenceSummary,
      fetchStudentPresenceSummary,
      isFetchingStudentPrePostTestReportSummary,
      studentPrePostTestReportSummary,
      fetchStudentPrePostTestReportSummary,
    };
  }, [
    isFetchingStudentProfile,
    isFetchingStudentResult,
    isFetchingStudentTarget,
    isFetchingClassroom,
    isSendDocumentModalShown,
    isFetchingClassroom,
    isFetchingStudentPresenceSummary,
    isFetchingStudentPrePostTestReportSummary,
  ]);

  return (
    <StudentReportContext.Provider value={contextProviderValue}>
      {props.children}
    </StudentReportContext.Provider>
  );
};

StudentReportContextProvider.propTypes = {
  children: PropTypes.any,
};

export default StudentReportContextProvider;
