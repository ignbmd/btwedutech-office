import {
  initialState,
  examModuleReducer,
  GET_QUESTIONS,
  CONCAT_QUESTIONS,
  UPDATE_PAGE,
  UPDATE_IS_LOAD_MORE,
  SELECT_QUESTION,
  SELECT_QUESTION_FORCE,
  SELECT_ALL_QUESTION,
  RESET_SELECT_QUESTIONS,
  UPDATE_FETCHING_QUESTION,
} from "../reducers/examModuleReducer";
import { fetchQuestions, fetchQuestionsBySearchId } from "../services/exam/question";
import React, { createContext, useReducer, useState } from "react";

export const ExamModuleContext = createContext({
  query: "",
  queryId: "",
  examModuleState: {},
  resetSelectedQuestion: () => { },
  selectAllQuestion: () => { },
  selectQuestion: () => { },
  selectQuestionForce: () => { },
  getQuestions: () => { },
  getQuestionsBySearchId: () => { },
  setQuery: () => { },
  setQueryId: () => { },
});

const ExamModuleContextProvider = (props) => {
  const [queryId, setQueryId] = useState("");
  const [query, setQuery] = useState("");
  const [examModuleState, dispatch] = useReducer(
    examModuleReducer,
    initialState
  );

  const getQuestions = async ({ program, types, limit, pages, q, question_category_id }) => {
    const search = q?.toLowerCase();
    try {
      if (pages > 1) {
        dispatch({
          type: UPDATE_IS_LOAD_MORE,
          isLoadMore: true,
        });
      }
      dispatch({
        type: UPDATE_FETCHING_QUESTION,
        isFetchingQuestion: true,
      });
      const res = await fetchQuestions({ program, types, limit, pages, search, question_category_id });
      const data = res.data;
      const info = res.info;
      dispatch({
        type: (pages == 1 ? GET_QUESTIONS : CONCAT_QUESTIONS),
        isFetchingQuestion: false,
        questions: data,
        activeProgram: program,
        activeTypes: types,
        question_category_id: question_category_id,
        total_questions: info.total_item,
        page: pages,
        limit: limit,
        isLoadMore: false,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getQuestionsBySearchId = async ({ program, types, limit, pages, q, question_category_id }) => {
    const search_id = q?.toLowerCase();
    try {
      dispatch({
        type: UPDATE_FETCHING_QUESTION,
        isFetchingQuestion: true,
      });
      const data = await fetchQuestionsBySearchId({ program, types, limit, pages, search_id, question_category_id });
      dispatch({
        type: GET_QUESTIONS,
        isFetchingQuestion: false,
        questions: data,
        activeProgram: program,
        activeTypes: types,
        question_category_id: question_category_id,
        page: pages,
        limit: limit,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const selectQuestion = (id) => {
    dispatch({ type: SELECT_QUESTION, id });
  };

  const selectQuestionForce = (question) => {
    dispatch({ type: SELECT_QUESTION_FORCE, question });
  };

  const updateFetchingQuestion = (status) => {
    dispatch({
      type: UPDATE_FETCHING_QUESTION,
      isFetchingQuestion: status,
    });
  };

  const updatePage = (page) => {
    dispatch({
      type: UPDATE_PAGE,
      page,
    });
  };

  const selectAllQuestion = (val) => {
    dispatch({
      type: SELECT_ALL_QUESTION,
      val,
    });
  };

  const resetSelectedQuestion = () => {
    dispatch({
      type: RESET_SELECT_QUESTIONS,
    });
  };

  return (
    <ExamModuleContext.Provider
      value={{
        examModuleState,
        query,
        queryId,

        updatePage,
        updateFetchingQuestion,
        resetSelectedQuestion,
        selectAllQuestion,
        selectQuestion,
        selectQuestionForce,
        getQuestions,
        getQuestionsBySearchId,
        setQuery,
        setQueryId,
      }}
    >
      {props.children}
    </ExamModuleContext.Provider>
  );
};

export default ExamModuleContextProvider;
