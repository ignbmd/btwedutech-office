import axios from "../../utility/http";

export const getCategoryByProgram = async (program, config) => {
  try {
    const response = await axios.get(
      `/exam/question-category/${program}`,
      config
    );
    const data = await response.data;
    const categoryData = data?.data ?? [];
    return categoryData;
  } catch (error) {
    throw error;
  }
};

export const getSubCategoryByCategoryId = async (categoryId, config) => {
  try {
    const response = await axios.get(
      `/exam/sub-question-category/category/${categoryId}`,
      config
    );
    const data = await response.data;
    const subCategoryData = data?.data ?? [];
    return subCategoryData;
  } catch (error) {
    throw error;
  }
};

export const getQuestionById = async (id, config) => {
  try {
    const response = await axios.get(`/exam/question/detail/${id}`, config);
    const data = await response.data;
    let question = data?.data ?? null;
    if (question) {
      question = {
        ...question,
        answers: question?.answers?.sort((a, b) => a.id - b.id),
      };
    }
    return question;
  } catch (error) {
    throw error;
  }
};

export const fetchQuestions = async ({
  program,
  types,
  limit = 50,
  pages = 1,
  search = "",
  config,
  question_category_id = "",
}) => {
  try {
    const response = await axios.get(
      `/exam/question?program=${program}&type=${types}&limit=${limit}&pages=${pages}&search=${search}&question_category_id=${question_category_id}`,
      config
    );
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const fetchQuestionsBySearchId = async ({
  program,
  types,
  limit = 50,
  pages = 1,
  search_id = "",
  config,
  question_category_id = "",
}) => {
  try {
    const response = await axios.get(
      `/exam/question?program=${program}&type=${types}&limit=${limit}&pages=${pages}&search_id=${search_id}&question_category_id=${question_category_id}`,
      config
    );
    const data = await response.data;
    const questions = data?.data ?? [];
    return questions;
  } catch (error) {
    throw error;
  }
};

export const getQuestionByModuleCode = async (moduleCode, config) => {
  try {
    const response = await axios.get(
      `/exam/question?module_code=${moduleCode}`,
      config
    );
    const data = await response.data;
    const questions = data?.data ?? [];
    return questions;
  } catch (error) {
    throw error;
  }
};

export const saveQuestions = async (payload) => {
  try {
    const response = await axios.post(`/exam/question/create`, payload);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateQuestion = async (id, payload) => {
  try {
    const response = await axios.put(`/exam/question/${id}`, payload);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const saveConnectQuestion = async (payload) => {
  try {
    const response = await axios.post(`/exam/question/connect`, payload);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};
