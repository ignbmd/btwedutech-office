import axios from "../../utility/http";

export const getPointCheckup = async () => {
  try {
    const response = await axios.get('/medical-checkup/point/checkup');
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};
