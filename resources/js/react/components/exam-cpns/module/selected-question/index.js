import classnames from "classnames";
import React, { useContext, useState, useEffect } from "react";
import { Badge, Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import { ExamModuleContext } from "../../../../context/ExamModuleContext";
import CardAction from "../../../core/card-actions";
import CKEditorParser from "../../../core/parser/CKEditorParser";
import "./SelectedQuestion.css";

const SelectedQuestionIndex = ({ withChildCheckbox = false }) => {
  const { examModuleState, selectQuestion } = useContext(ExamModuleContext);
  const { selectedQuestions, selectedQuestionData } = examModuleState;
  const [updatedQuestion, setUpdatedQuestion] = useState([]);
  let questionsNew = [];

  const handleToggleCheckBox = (e, question) => {
    selectQuestion(question.id);
    if (question.question_type === "PARENT") {
      const parentId = question.id;
      const children = selectedQuestionData.filter(
        (q) => q.parent_id === parentId
      );
      children.map((child) => {
        selectQuestion(child.id);
      });
    }
    e.stopPropagation();
  };

  const renderDetailBody = (question) => {
    return (
      <Card className="mb-0">
        <CardHeader className="email-detail-head">
          <div className="user-details d-flex justify-content-between align-items-center flex-wrap">
            <div className="mail-items">
              <Badge
                className="mr-25"
                style={{ backgroundColor: "#ff5722", color: "#fff" }}
              >
                {question.hasOwnProperty("question_categories")
                  ? question?.question_categories?.category
                  : question?.category}
              </Badge>
              <Badge
                className="mr-25"
                style={{ backgroundColor: "#ffd54f", color: "#000" }}
              >
                {question.hasOwnProperty("sub_category_questions")
                  ? question?.sub_category_questions?.title
                  : question?.sub_category}
              </Badge>
              {question.question_type === "PARENT" && (
                <>
                  <Badge color="info">Induk Soal</Badge>
                  {question?.child_questions?.length == 0 ? (
                    <Badge className="ml-25" color="light-danger">
                      Belum Berelasi
                    </Badge>
                  ) : (
                    <Badge className="ml-25" color="light-success">
                      {question?.child_questions?.length} Anak Soal
                    </Badge>
                  )}
                </>
              )}
              <div className="mt-1">
                <CKEditorParser mString={question?.question} />
              </div>
              {/* <span>{question?.sub_category}</span> */}
            </div>
          </div>
        </CardHeader>
        <CardBody className="mail-message-wrapper">
          <div className="discussion-answer">
            <div className="discussion-answer-header">
              <p className="mb-75 font-weight-bolder h6">Opsi Jawaban</p>
              <p className="mb-75 font-weight-bolder h6">Bobot Nilai</p>
            </div>
            <div className="discussion-answer-content">
              {question.answers.map((answer) => (
                <div
                  key={answer?.id}
                  className={classnames(
                    "discussion-answer-content__item font-pp-semi-bold",
                    answer.is_true && "discussion-answer-content__item--success"
                  )}
                >
                  <div className="discussion-answer-content-item__option d-flex">
                    <span className="font-weight-bolder mr-25">
                      {answer.option}.
                    </span>{" "}
                    <CKEditorParser mString={answer.answer} />
                  </div>
                  <p className="discussion-answer-content-item__value">
                    {answer.score}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardBody>

        <CardFooter>
          <div className="discussion-explanation">
            <p className="title-text font-pp-semi-bold mb-1">
              <b>Penjelasan Soal</b>
            </p>
            <CKEditorParser mString={question.explanation} />
          </div>
        </CardFooter>
      </Card>
    );
  };

  useEffect(() => {
    if (selectedQuestions.length > 0) {
      selectedQuestionData.map((question) => {
        questionsNew.push(question);
        if (question?.child_questions?.length > 0) {
          question?.child_questions?.map((childQuestion) => {
            questionsNew.push(childQuestion);
          });
        }
      });
      setUpdatedQuestion(questionsNew);
    } else {
      setUpdatedQuestion([]);
    }
  }, [selectedQuestionData.length]);

  const renderMainBody = (question, index) => {
    return (
      <div className="d-block" key={question?.id}>
        <div className="d-flex align-items-center">
          <div
            className={
              question.question_type == "CHILD" && withChildCheckbox === false
                ? "custom-control custom-checkbox invisible"
                : "custom-control custom-checkbox"
            }
          >
            <input
              className="custom-control-input"
              type="checkbox"
              id={`selected-${question?.id}`}
              checked={selectedQuestions.includes(question?.id)}
              onChange={(e) => e.stopPropagation()}
              onClick={(e) => {
                handleToggleCheckBox(e, question);
              }}
            />
            <label
              className="custom-control-label"
              htmlFor={`selected-${question?.id}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
            ></label>
          </div>
          <CardAction
            cardTitleTag="div"
            title={
              <CKEditorParser
                mString={`
                <span
                  class="mr-50 badge badge-primary"
                  style="font-size: .85rem;"
                >
                  ${question.id}
                </span>
                <span
                  class="mr-50 badge badge-secondary"
                  style="background-color: rgb(255, 87, 34); color: rgb(255, 255, 255); font-size: .85rem;"
                >
                  ${
                    question.hasOwnProperty("question_categories")
                      ? question?.question_categories?.category
                      : question?.category
                  }
                </span>
                <span
                  class="mr-50 badge badge-secondary"
                  style="background-color: rgb(255, 213, 79); color: rgb(0, 0, 0); font-size: .85rem;"
                >
                  ${
                    question.hasOwnProperty("sub_category_questions")
                      ? question?.sub_category_questions?.title
                      : question?.sub_category
                  }
                </span>
                <div class="mt-1 d-flex selected-question">
                  <span>${index})</span>
                <div class="ml-50">${question?.question}</div>
                </div>
                    `}
                className="mb-0 h5"
              />
            }
            hideTitleWhenOpen
            actions="collapse"
            className="mb-50 cursor-pointer w-100"
            style={{
              backgroundColor: "rgba(130, 134, 139, 0.09)",
            }}
          >
            <CardBody className="pt-0">{renderDetailBody(question)}</CardBody>
          </CardAction>
        </div>
      </div>
    );
  };
  return (
    <div className="mt-1">
      {updatedQuestion.length > 0 ? (
        updatedQuestion.map((question, index) => {
          return renderMainBody(question, index + 1);
        })
      ) : (
        <div className="no-results d-block text-center">
          <h5>Belum Ada Soal Terpilih</h5>
        </div>
      )}
    </div>
  );
};

export default SelectedQuestionIndex;
