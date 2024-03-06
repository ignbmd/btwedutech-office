import axios from "../../utility/http";

export const getClassesByBranchCode = async (branchCode, config) => {
  try {
    const response = await axios.get(`/learning/classroom/branch/${branchCode}`, config);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getClassesBySmartbtwIds = async (payload) => {
  try {
    const response = await axios.post(`/students/classrooms`, payload);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};
