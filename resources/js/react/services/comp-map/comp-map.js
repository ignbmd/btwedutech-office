import axios from "../../utility/http";

export const getCompetitionMapList = async () => {
  try {
    const response = await axios.get(`/competition-map`);
    const data = response.data;
    return data?.data ?? [];
  } catch (error) {
    throw error;
  }
};

export const getTryoutDetail = async (tryout_id) => {
  try {
    const response = await axios.get("exam/tryout-code/detail/" + tryout_id);
    const data = response.data;
    return data?.data ?? [];
  } catch (error) {
    throw error;
  }
};

export const getSkdRank = async (payload) => {
  try {
    const response = await axios.post("/students/skd-rank", payload);
    const data = response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getExamResult = async (payload) => {
  try {
    const response = await axios.post("/students/exam-result", payload);
    const data = response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getSkdRankTryout = async (payload) => {
  try {
    const response = await axios.post("/tryout/skd-rank", payload);
    const data = response.data;
    return data;
  } catch (error) {
    throw error;
  }
};
