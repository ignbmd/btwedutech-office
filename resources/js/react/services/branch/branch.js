import axios from "../../utility/http";

export const getAllBranch = async (config) => {
  try {
    const response = await axios.get('/branch/all', config);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getBranchByCode = async (code, config) => {
  try {
    const response = await axios.get(`/branch/${code}`, config);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};
