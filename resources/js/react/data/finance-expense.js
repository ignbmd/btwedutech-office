import axios from "axios";

export const getExpenseByBranchCode = async (branchCode) => {
  try {
    const response = await axios.get(`/api/finance/expense/${branchCode}`);
    const data = await response?.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getExpenseCalculationByBranchCode = async (branchCode) => {
  try {
    const response = await axios.get(
      `/api/finance/expense/calculation/${branchCode}`
    );
    const data = await response?.data;
    return data?.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getExpenseById = async (id) => {
  try {
    const response = await axios.get(`/api/finance/expense/detail/${id}`);
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createExpense = async (formData) => {
  try {
    const response = await axios.post(`/api/finance/expense`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateExpense = async (formData) => {
  try {
    const response = await axios.post(`/api/finance/expense/update`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
