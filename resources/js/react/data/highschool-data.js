import axios from "axios";

export const getHighschool = async ({
  page = 1,
  per_page = 10,
  search = "",
}) => {
  try {
    const response = await axios.get("/api/highschools/paginated", {
      params: {
        page,
        per_page,
        search,
      },
    });
    const data = await response?.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};
