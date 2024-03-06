import axios from "axios";

export const getSingleStudentProfile = async (student_id) => {
  try {
    const response = await axios.get(
      `/api/student-progress-report/student/${student_id}/profile`
    );
    const data = await response?.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSingleStudentResult = async (
  student_id,
  program = "ptk",
  stage_type = "UMUM",
  module_type = "ALL_MODULE"
) => {
  try {
    const response = await axios.get(
      `/api/student-progress-report/student/${student_id}/program/${program}?stage_type=${stage_type}&module_type=${module_type}`
    );
    const data = await response?.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllSingleStudentTarget = async (
  student_id,
  target_type = "ptk"
) => {
  try {
    const response = await axios.get(
      `/api/students/${student_id}/all-targets/${target_type}`
    );
    const data = await response?.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSingleClassroomByID = async (classroom_id) => {
  try {
    const response = await axios.get(`/api/learning/classroom/${classroom_id}`);
    const data = await response?.data;
    return data ?? null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateStudentProgressReportDocumentLink = async (
  student_id,
  program = "ptk",
  stage_type = "UMUM",
  module_type = "ALL",
  stream_file = false
) => {
  try {
    const response = await axios.post(
      `/api/student-progress-report/student/${student_id}/program/${program}/document-link`,
      {
        stage_type,
        module_type,
        stream_file,
      }
    );
    return response?.data ?? null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSingleStudentPresenceReportSummary = async (student_id) => {
  try {
    const response = await axios.get(
      `/api/student-presence-report/summary/${student_id}`
    );
    const data = await response?.data;
    return data?.data ?? null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSingleStudentPrePostTestReportSummary = async (
  student_id,
  program = "ptk"
) => {
  try {
    const response = await axios.get(
      `/api/student-pre-post-test-report/summary/${student_id}/${program}`
    );
    const data = await response?.data;
    return data?.data ?? null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
