import axios from "../../utility/http";

export const getStudentById = async (studentId, config) => {
  try {
    const response = await axios.get(`/students/detail/${studentId}`, config);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};
