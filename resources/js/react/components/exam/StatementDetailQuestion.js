import React from "react";
import classnames from "classnames";
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";

import "./DetailQuestionCard.css";
import CKEditorParser from "../core/parser/CKEditorParser";

const StatementDetailQuestion = ({ question }) => {
  return (
    <CardBody className="mail-message-wrapper">
      <div className="discussion-answer">
        <div className="discussion-answer-header d-flex">
          <div className="mb-75 font-weight-bolder h6 option-title-header">
            Opsi Jawaban
          </div>
          <div className="mb-75 font-weight-bolder h6 option-title">
            {question?.answer_header_true ?? "Benar"}
          </div>
          <div className="mb-75 font-weight-bolder h6 option-title">
            {question?.answer_header_false ?? "Salah"}
          </div>
        </div>
        <div className="discussion-answer-content">
          {question.answers.map((answer, index) => (
            <div
              key={index}
              className={classnames(
                "discussion-answer-content__item font-pp-semi-bold"
                // answer.is_true && "discussion-answer-content__item--success"
              )}
            >
              <div className="discussion-answer-content-item__option d-flex">
                <CKEditorParser
                  mString={`<div class="flex-grow-1">${answer.answer}</div>`}
                />
              </div>
              <p className="discussion-answer-content-item__statement_value mr-25">
                {answer.is_true ? <>&#10003;</> : ""}
              </p>
              <p className="discussion-answer-content-item__statement_value">
                {!answer.is_true ? <>&#10003;</> : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </CardBody>
  );
};

export default StatementDetailQuestion;
