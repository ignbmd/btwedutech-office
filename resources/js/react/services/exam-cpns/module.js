import axios from "../../utility/http";

export const saveModule = async (payload) => {
  try {
    const response = await axios.post(`/exam-cpns/module/create`, payload);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateModule = async (payload, id) => {
  try {
    const response = await axios.put(`/exam-cpns/module/${id}`, payload);
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
};

export const getModulesByModuleCode = async (moduleCode, config) => {
  try {
    const response = await axios.get(
      `/exam-cpns/module/detail/${moduleCode}`,
      config
    );
    const data = await response.data;
    const moduleData = data?.data ?? {};
    moduleData.questions = moduleData?.questions?.map((question) => {
      question.id = +question.id;
      question.answers = question?.option_types?.map((option, index) => {
        const highestOptionValue = Math.max(...question?.option_values);
        return {
          id: +question?.option_ids[index] ?? null,
          question_id: +question?.id ?? null,
          answer: question?.option_texts[index] ?? "-",
          option: option ?? null,
          score: question?.option_values[index] ?? null,
          is_true:
            (question?.option_values[index] ?? 0) === highestOptionValue
              ? true
              : false,
        };
      });
      return question;
    });
    return moduleData;
  } catch (error) {
    throw error;
  }
};
