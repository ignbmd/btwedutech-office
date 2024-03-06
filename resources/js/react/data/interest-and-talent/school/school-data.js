import axios from "axios";

export const getSchools = async (query) => {
  try {
    const response = await axios.get("/api/interest-and-talent/schools", {
      params: query,
    });
    const data = await response?.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getSchoolById = async (school_id) => {
  try {
    const response = await axios.get(
      `/api/interest-and-talent/schools/${school_id}`
    );
    const data = await response?.data;
    return data?.data ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const upsertSchool = async (school_id, payload) => {
  try {
    const response = await axios.put(
      `/api/interest-and-talent/schools/${school_id}`,
      payload
    );
    const data = await response?.data;
    return data?.data ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getSchoolAdminBySchoolId = async (school_id) => {
  try {
    const response = await axios.get(
      `/api/interest-and-talent/schools/${school_id}/admins`
    );
    const data = await response?.data;
    return Array.isArray(data?.data) ? data?.data : [];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createSchoolAdmin = async (payload) => {
  try {
    const response = await axios.post(
      `/api/interest-and-talent/schools/${school_id}/admins`,
      payload
    );
    const data = await response?.data;
    return data?.data ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteSchoolAdmin = async (school_id, school_admin_id) => {
  try {
    const response = await axios.delete(
      `/api/interest-and-talent/schools/${school_id}/admins/${school_admin_id}`,
      data
    );
    const data = await response?.data;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
