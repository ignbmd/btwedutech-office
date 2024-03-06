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

const CheckboxDetailQuestion = ({ question }) => {
  return (
    <CardBody className="mail-message-wrapper">
      <div className="discussion-answer">
        <div className="discussion-answer-header">
          <p className="mb-75 font-weight-bolder h6">Opsi Jawaban</p>
          <p className="mb-75 font-weight-bolder h6">Kunci Jawaban</p>
        </div>
        <div className="discussion-answer-content">
          {question.answers.map((answer, index) => (
            <div
              key={index}
              className={classnames(
                "discussion-answer-content__item font-pp-semi-bold",
                answer.is_true && "discussion-answer-content__item--success"
              )}
            >
              <div className="discussion-answer-content-item__option d-flex">
                <CKEditorParser
                  mString={`<div class="flex-grow-1">${answer.answer}</div>`}
                />
              </div>
              <p className="discussion-answer-content-item__value">
                {answer.is_true ? <>&#10003;</> : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </CardBody>
  );
};

export default CheckboxDetailQuestion;
