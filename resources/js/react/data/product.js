import axios from "axios";

export const getProducts = async () => {
  try {
    const response = await axios.get("/api/product/all");
    const data = await response.data;
    return data?.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
