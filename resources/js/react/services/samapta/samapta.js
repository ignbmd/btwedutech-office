import axios from "axios";

export const getStudentsBySelection = async ({
  selection_type,
  selection_year,
}) => {
  try {
    const response = await axios.get(
      `api/samapta/students/session/${selection_year}/type/${selection_type}`
    );
    const data = response?.data;
    return data ?? [];
  } catch (error) {
    throw new Error(error);
  }
};

export const getStudentByClassroomId = async (classroomId) => {
  try {
    const response = await axios.get(
      `/api/samapta/students/classroom/${classroomId}`
    );
    const data = response?.data;
    return data ?? [];
  } catch (err) {
    throw new Error(err);
  }
};

export const getStudentBySessionId = async (sessionId, gender, id) => {
  try {
    const response = await axios.get(
      `/api/samapta/students/student-session/${sessionId}/gender/${gender}/classroom/${id}`
    );
    const data = response?.data;
    return data ?? [];
  } catch (err) {
    throw new Error(err);
  }
};
