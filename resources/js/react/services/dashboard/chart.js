import axios from "../../utility/http";

export const getUserRetention = async (params, config) => {
  try {
    const { package_id, date_start, date_end, range_type } = params;
    const query = `package_id=${package_id}&date_start=${date_start}&date_end=${date_end}&range_type=${range_type}`;
    const response = await axios.get(
      `/dashboard/user-retention-chart?${query}`,
      config
    );
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};
