import { createContext, useMemo, useState } from "react";
import {
  getBranches,
  getBranchClassrooms,
  getClassroomReport,
} from "../services/student-progress/classroom-report";
import PropTypes from "prop-types";

export const ClassroomReportContext = createContext({
  isFetchingBranches: false,
  branches: [],
  fetchBranches: () => {},
  selectedBranch: null,
  setSelectedBranch: () => {},
  isFetchingClassrooms: false,
  classrooms: [],
  fetchBranchClassrooms: () => {},
  selectedClassroom: null,
  setSelectedClassroom: () => {},
  selectedUkaType: null,
  setSelectedUkaType: () => {},
  selectedUkaModule: null,
  setSelectedUkaModule: () => {},
  isFetchingClassroomResults: false,
  classroomResults: null,
  fetchClassroomResults: () => {},
});

const ClassroomReportContextProvider = (props) => {
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  const [branches, setBranches] = useState([]);
  const fetchBranches = async () => {
    try {
      setIsFetchingBranches(true);
      const data = await getBranches();
      setBranches(data);
    } catch (error) {
      return [];
    } finally {
      setIsFetchingBranches(false);
    }
  };

  const [isFetchingClassrooms, setIsFetchingClassrooms] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const fetchBranchClassrooms = async (branch_code) => {
    try {
      setIsFetchingClassrooms(true);
      const data = await getBranchClassrooms(branch_code);
      setClassrooms(data);
    } catch (error) {
      setClassrooms([]);
    } finally {
      setIsFetchingClassrooms(false);
    }
  };

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedUkaType, setSelectedUkaType] = useState(null);
  const [selectedUkaModule, setSelectedUkaModule] = useState(null);

  const [isFetchingClassroomResults, setIsFetchingClassroomResults] =
    useState(false);
  const [classroomResults, setClassroomResults] = useState(null);

  const fetchClassroomResults = async (
    branch_code,
    classroom_id,
    stage_type,
    module_type
  ) => {
    try {
      setIsFetchingClassroomResults(true);
      const data = await getClassroomReport(
        branch_code,
        classroom_id,
        stage_type,
        module_type
      );
      setClassroomResults(data);
    } catch (error) {
      console.error(error);
      setClassroomResults([]);
    } finally {
      setIsFetchingClassroomResults(false);
    }
  };

  const contextProviderValue = useMemo(() => {
    return {
      isFetchingBranches,
      branches,
      fetchBranches,
      selectedBranch,
      setSelectedBranch,
      isFetchingClassrooms,
      classrooms,
      fetchBranchClassrooms,
      selectedClassroom,
      isFetchingClassroomResults,
      classroomResults,
      fetchClassroomResults,
      setSelectedClassroom,
      selectedUkaType,
      setSelectedUkaType,
      selectedUkaModule,
      setSelectedUkaModule,
    };
  }, [
    isFetchingBranches,
    isFetchingClassrooms,
    isFetchingClassroomResults,
    selectedClassroom,
    selectedBranch,
    selectedUkaType,
    selectedUkaModule,
  ]);

  return (
    <ClassroomReportContext.Provider value={contextProviderValue}>
      {props.children}
    </ClassroomReportContext.Provider>
  );
};

ClassroomReportContextProvider.propTypes = {
  children: PropTypes.any,
};

export default ClassroomReportContextProvider;
