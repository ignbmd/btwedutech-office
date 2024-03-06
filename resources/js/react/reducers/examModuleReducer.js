export const GET_QUESTIONS = "GET_QUESTIONS";
export const CONCAT_QUESTIONS = "CONCAT_QUESTIONS";
export const UPDATE_IS_LOAD_MORE = "UPDATE_IS_LOAD_MORE";
export const UPDATE_PAGE = "UPDATE_PAGE";
export const UPDATE_FETCHING_QUESTION = "UPDATE_FETCHING_QUESTION";
export const SELECT_QUESTION = "SELECT_QUESTION";
export const SELECT_ALL_QUESTION = "SELECT_ALL_QUESTION";
export const RESET_SELECT_QUESTIONS = "RESET_SELECT_QUESTIONS";
export const SELECT_QUESTION_FORCE = "SELECT_QUESTION_FORCE";

// ** Initial State
export const initialState = {
  questions: [],
  activeProgram: "skd",
  activeTypes: "",
  question_category_id: "",
  page: 1,
  limit: 25,
  isLoadMore: false,
  isFetchingQuestion: false,
  currentQuestion: null,
  selectedQuestions: [],
  selectedQuestionData: [],
  programs: {
    skd: { color: "primary", text: "SKD" },
    skb: { color: "warning", text: "SKB" },
    tps: { color: "danger", text: "TPS" },
    tpa: { color: "success", text: "TPA" },
    ["tka-saintek"]: { color: "info", text: "TKA Saintek" },
    ["tka-soshum"]: { color: "info", text: "TKA Soshum" },
    ["tka-campuran"]: { color: "info", text: "TKA Campuran" },
  },
};

export const examModuleReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_QUESTIONS:
      return {
        ...state,
        isFetchingQuestion: action.isFetchingQuestion,
        questions: action.questions,
        question_category_id: action.question_category_id,
        activeProgram: action.activeProgram,
        activeTypes: action.activeTypes,
        page: action.page,
        limit: action.limit,
        total_questions: action.total_questions,
      };
    case CONCAT_QUESTIONS:
      return {
        ...state,
        questions: [...state.questions, ...action.questions],
        page: action.page,
        limit: action.limit,
        isFetchingQuestion: action.isFetchingQuestion,
        isLoadMore: action.isLoadMore,
      };
    case UPDATE_PAGE:
      return {
        ...state,
        page: action.page,
      };
    case UPDATE_IS_LOAD_MORE:
      return {
        ...state,
        isLoadMore: action.isLoadMore,
      };
    case UPDATE_FETCHING_QUESTION:
      return {
        ...state,
        isFetchingQuestion: action.isFetchingQuestion,
      };
    case SELECT_QUESTION:
      const selectedQuestions = state.selectedQuestions;
      const updatedSelectedQuestionData = state.selectedQuestionData;

      if (!selectedQuestions.includes(action.id)) {
        selectedQuestions.push(action.id);
        const newSelected = state.questions.find((q) => q?.id == action.id);
        if (newSelected) {
          updatedSelectedQuestionData.push(newSelected);
        }
      } else {
        selectedQuestions.splice(selectedQuestions.indexOf(action.id), 1);
        const removeSelectedIndex = updatedSelectedQuestionData.findIndex(
          (q) => q?.id == action.id
        );
        updatedSelectedQuestionData.splice(removeSelectedIndex, 1);
      }
      return {
        ...state,
        selectedQuestions,
        selectedQuestionData: updatedSelectedQuestionData,
      };
    case SELECT_QUESTION_FORCE:
      const selectedQuestionsForce = state.selectedQuestions;
      const updatedSelectedQuestionDataForce = state.selectedQuestionData;
      if (!selectedQuestionsForce.includes(action.question.id)) {
        selectedQuestionsForce.push(action.question.id);
        updatedSelectedQuestionDataForce.push(action.question);
      }
      return {
        ...state,
        selectedQuestionsForce,
        selectedQuestionData: updatedSelectedQuestionDataForce,
      };
    case SELECT_ALL_QUESTION:
      const selectAllQuestions = [];
      const selectAllQuestionData = [];
      if (action.val) {
        selectAllQuestions.length = 0;
        state.questions.forEach((question) => {
          selectAllQuestions.push(question?.id);
          selectAllQuestionData.push(question);
        });
      } else {
        selectAllQuestions.length = 0;
        selectAllQuestionData.length = 0;
      }
      return {
        ...state,
        selectedQuestions: selectAllQuestions,
        selectedQuestionData: selectAllQuestionData,
      };
    case RESET_SELECT_QUESTIONS:
      return { ...state, selectedQuestions: [], selectedQuestionData: [] };
    default:
      return state;
  }
};
