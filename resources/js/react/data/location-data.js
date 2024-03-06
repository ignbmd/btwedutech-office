import axios from "axios";

export const getProvinces = async () => {
  try {
    const response = await axios.get("/api/location", {
      params: {
        type: "PROVINCE",
      },
    });
    const data = await response?.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getRegions = async (province_id = null) => {
  try {
    const response = await axios.get("/api/location", {
      params: {
        type: "REGION",
        parent_id: province_id,
      },
    });
    const data = await response?.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};
