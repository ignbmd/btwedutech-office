import axios from "axios";

export const getBranches = async () => {
  const response = await axios.get("/api/classroom-report/branches");
  const data = response?.data;
  return data?.data ?? [];
};

export const getBranchClassrooms = async (branch_code) => {
  const response = await axios.get(
    `/api/classroom-report/branches/${branch_code}/classrooms`
  );
  const data = response?.data;
  return data?.data ?? [];
};

export const getClassroomReport = async (
  branch_code,
  classroom_id,
  stage_type,
  module_type
) => {
  const response = await axios.get(
    `/api/classroom-report/branches/${branch_code}/classrooms/${classroom_id}/reports`,
    {
      params: {
        stage_type,
        module_type,
      },
    }
  );
  const data = await response.data;
  return data ?? [];
};

export const generateStreamStudentProgressReportDocumentLink = async (
  student_id,
  program = "ptk",
  stage_type = "UMUM",
  module_type = "ALL",
  stream_file = true
) => {
  try {
    const response = await axios.post(
      `/api/student-progress-report/student/${student_id}/program/${program}/document-link`,
      {
        stage_type,
        module_type: module_type == "ALL" ? "ALL_MODULE" : module_type,
        stream_file,
      }
    );
    return response?.data ?? null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateMultipleStudentsProgressReportsDocumentLinks = async (
  student_ids,
  program = "ptk",
  stage_type = "UMUM",
  module_type = "ALL"
) => {
  try {
    const response = await axios.post(
      `/api/student-progress-report/multiple-student/document-link`,
      {
        smartbtw_id: student_ids,
        program,
        stage_type,
        module_type,
      },
      {
        responseType: "blob",
      }
    );
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generatePDFPerformaKelasDocumentLink = async (
  classroom_id,
  program,
  type_stages,
  type_module,
  class_name,
  category_uka,
  stream_file = false
) => {
  try {
    const response = await axios.post(
      `/api/generate-result/pdf-performa-kelas`,
      {
        classroom_id,
        program,
        type_stages,
        type_module,
        class_name,
        category_uka,
        stream_file,
      }
    );
    const data = await response?.data;
    return data?.data ?? null;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
