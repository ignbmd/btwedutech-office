import axios from "../../utility/http";

export const saveModule = async (payload) => {
  try {
    const response = await axios.post(`/exam/module/create`, payload);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateModule = async (payload, id) => {
  try {
    const response = await axios.put(`/exam/module/${id}`, payload);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getModulesByModuleCode = async (moduleCode, config) => {
  try {
    const response = await axios.get(
      `/exam/module/detail/${moduleCode}`,
      config
    );
    const data = await response.data;
    const module = data?.data ?? {};
    return module;
  } catch (error) {
    throw error;
  }
}
