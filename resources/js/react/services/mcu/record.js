import axios from "../../utility/http";

export const createRecord = async (payload) => {
  try {
    const response = await axios.post('/medical-checkup/record/create', payload);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const editRecord = async (historyId, payload) => {
  try {
    const response = await axios.put(`/medical-checkup/record/edit/${historyId}`, payload);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getRecordSummary = async (historyId, config) => {
  try {
    const response = await axios.get(`/medical-checkup/record/summary/${historyId}`, config);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};
