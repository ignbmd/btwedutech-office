import axios from "axios";

export const createBranchEarning = async (payload) => {
  try {
    const url = "/api/finance/branch-earning";
    const response = await axios.post(url, payload);
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return error?.response?.data ?? null;
  }
};

export const updateBranchEarning = async (id, payload) => {
  try {
    const url = `/api/finance/branch-earning/${id}`;
    const response = await axios.post(url, payload);
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return error?.response?.data ?? null;
  }
};

export const getBranchEarningByBranchCode = async (branchCode) => {
  try {
    const url = `/api/finance/branch-earning/${branchCode}`;
    const response = await axios.get(url);
    const data = await response?.data;
    return data?.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getBranchEarningDefaultByBranchCode = async (branchCode) => {
  try {
    const url = `/api/finance/branch-earning/default-by-branch/${branchCode}`;
    const response = await axios.get(url);
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBranchEarningById = async (id) => {
  try {
    const url = `/api/finance/branch-earning/detail/${id}`;
    const response = await axios.get(url);
    const data = await response?.data;
    return data?.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteBranchEarningById = async (id) => {
  try {
    const url = `/api/finance/branch-earning/${id}`;
    const response = await axios.delete(url);
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return error?.response?.data ?? null;
  }
};
