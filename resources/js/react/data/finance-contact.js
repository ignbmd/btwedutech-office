import axios from "axios";

export const getContacts = async () => {
  try {
    const response = await axios.get(`/api/finance/contact/`);
    const data = await response?.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getContactsByBranchCode = async (branchCode) => {
  try {
    const response = await axios.get(`/api/finance/contact/${branchCode}`);
    const data = await response?.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createContact = async (payload) => {
  try {
    const response = await axios.post(`/api/finance/contact`, payload);
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createBranchContact = async (payload) => {
  try {
    const response = await axios.post(`/api/finance/branch-contact`, payload);
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateBranchContact = async (id, payload) => {
  try {
    const response = await axios.put(`/api/finance/contact/${id}`, payload);
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
