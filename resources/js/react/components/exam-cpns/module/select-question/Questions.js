import { Search } from "react-feather";
import PerfectScrollbar from "react-perfect-scrollbar";
import { Fragment, useContext, useMemo, useState, useRef, useEffect } from "react";
import {
  Input,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
} from "reactstrap";
import debounce from "lodash.debounce";

import QuestionCard from "./QuestionCard";
import QuestionDetails from "./QuestionDetails";
import SpinnerCenter from "../../../core/spinners/Spinner";
import { ExamModuleContext } from "../../../../context/ExamModuleContext";
import Cleave from "cleave.js/react";
import { normalNumber } from "../../../../utility/Utils";

const Questions = ({
  selectQuestion,
  paginateQuestion,
  selectedQuestion,
  setSelectedQuestion,
}) => {
  const [openQuestion, setOpenQuestion] = useState(false);
  const { examModuleState, query, queryId, getQuestions, getQuestionsBySearchId, setQuery, setQueryId, updatePage } =
    useContext(ExamModuleContext);
  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState();
  const { activeProgram, activeTypes, page, total_questions, limit, isLoadMore, questions, isFetchingQuestion, question_category_id } =
    examModuleState;
  const pageRef = useRef(page);
  const totalQuestionsRef = useRef(total_questions);
  const questionRef = useRef(questions);
  const isFetchingQuestionRef = useRef(isFetchingQuestion);

  const scrollContainerRef = useRef(null);

  const getSelectQuestionContainerScrollHeight = () => {
    const dom = document.querySelector("#select-module-container");
    return dom;
  }

  const handleScroll = (event) => {
    if (isFetchingQuestionRef.current || totalQuestionsRef.current == questionRef.current.length) return;
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    const currentScroll = scrollTop + clientHeight;
    if (currentScroll >= scrollHeight) {
      const updatedPage = (pageRef.current) + 1;
      updatePage(updatedPage);
      pageRef.current = updatedPage;
    }
  }

  useEffect(() => {
    isFetchingQuestionRef.current = isFetchingQuestion;
    pageRef.current = page;
    totalQuestionsRef.current = total_questions;
    questionRef.current = questions;
  }, [isFetchingQuestion, page, total_questions, questions]);

  useEffect(() => {
    const scrollHeight = getSelectQuestionContainerScrollHeight();
    scrollHeight.addEventListener("scroll", debounce(handleScroll, 100));
  }, []);

  const handleQuestionClick = (id) => {
    setSelectedQuestion(questions.find((question) => question.id == id));
    setOpenQuestion(true);
  };

  const handleSearch = useMemo(
    () =>
      debounce(
        (userInput) => {
          if (userInput.length) {
            setSearch(userInput);
          }
        },
        500
      ),
    []
  );

  useEffect(() => {
    if (search.length && page) {
      getQuestions({
        program: activeProgram,
        question_category_id: question_category_id,
        types: activeTypes,
        q: search,
        pages: page,
        limit
      })
    }
  }, [search, activeTypes, activeProgram, page]);

  const handleSearchById = useMemo(
    () =>
      debounce(
        (userInput) => {
            setSearchId(userInput);
        },
        500
      ),
    []
  );

  useEffect(() => {
    if (searchId?.length > 0) {
      getQuestionsBySearchId({
        program: activeProgram,
        question_category_id: question_category_id,
        types: activeTypes,
        q: searchId,
        pages: page,
        limit
      })
    }
    if(searchId?.length == 0) {
      getQuestions({
        program: activeProgram,
        question_category_id: question_category_id,
        types: activeTypes,
        q: search,
        pages: page,
        limit
      })
    }
  }, [searchId, activeTypes, activeProgram, page]);

  const renderQuestions = () => {
    if (questions.length) {
      return questions.map((question, index) => {
        return (
          <QuestionCard
            isSearchable
            number={index + 1}
            key={index}
            question={question}
            selectQuestion={selectQuestion}
            handleQuestionClick={handleQuestionClick}
          />
        );
      });
    }
  };

  return (
    <Fragment>
      <div className="email-app-list">
        <div className="app-fixed-search d-flex align-items-center rounded-0 p-0">
          <div className="d-flex align-content-center justify-content-between w-100">
            <InputGroup className="input-group-merge w-25 border-right">
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="border-top-0 border-left-0 rounded-0">
                  <Search className="text-muted" size={14} />
                </InputGroupText>
              </InputGroupAddon>
              <Cleave
                options={normalNumber}
                id="email-search"
                placeholder="Cari ID soal"
                value={queryId}
                className="form-control"
                onChange={(e) => {
                  updatePage(1);
                  setQuery("");
                  setQueryId(e.target.value);
                  handleSearchById(e.target.value);
                }}
              />
            </InputGroup>
            <InputGroup className="input-group-merge ml-1 w-75">
              <InputGroupAddon addonType="prepend">
                <InputGroupText className="border-top-0 border-left-0 rounded-0">
                  <Search className="text-muted" size={14} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="email-search"
                placeholder="Cari pertanyaan, kategori soal, sub kategori soal, atau tag"
                value={query}
                className="border-top-0"
                onChange={(e) => {
                  updatePage(1);
                  setQueryId("");
                  setQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
            </InputGroup>
          </div>
        </div>

        <PerfectScrollbar
          id="select-module-container"
          ref={scrollContainerRef}
          className="email-user-list">
          {isFetchingQuestion && !isLoadMore ? (
            <SpinnerCenter />
          ) : questions.length ? (
            <ul className="email-media-list">{renderQuestions()}</ul>
          ) : (
            <div className="no-results d-block">
              <h5>No Items Found</h5>
            </div>
          )}
        </PerfectScrollbar>
      </div>
      <QuestionDetails
        openQuestion={openQuestion}
        question={selectedQuestion}
        setOpenQuestion={setOpenQuestion}
        paginateQuestion={paginateQuestion}
      />
    </Fragment>
  );
};

export default Questions;
