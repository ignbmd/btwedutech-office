import axios from "axios";

export const getBranches = async () => {
  try {
    const response = await axios.get("/api/branch/all");
    const data = await response?.data;
    return data?.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
