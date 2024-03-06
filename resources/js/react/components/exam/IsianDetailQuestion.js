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

const IsianDetailQuestion = ({ question }) => {
  return (
    <CardBody className="mail-message-wrapper">
      <div className="discussion-answer">
        <div className="discussion-answer-header">
          <p className="mb-75 font-weight-bolder h6">Opsi Jawaban</p>
          <p className="mb-75 font-weight-bolder h6">Bobot Nilai</p>
        </div>
        <div className="discussion-answer-content">
          {question?.answers?.map((answer, index) => (
            <div
              key={index}
              className={classnames(
                "discussion-answer-content__item font-pp-semi-bold"
                // answer.is_true && "discussion-answer-content__item--success"
              )}
            >
              <div className="discussion-answer-content-item__option d-flex">
                <span
                  className="font-weight-bolder mr-25"
                  style={{ minWidth: "15px" }}
                >
                  {answer.option}
                </span>{" "}
                <CKEditorParser
                  mString={`<div class="flex-grow-1">${answer.answer}</div>`}
                />
              </div>
              <p className="discussion-answer-content-item__value">
                {answer.score}
              </p>
            </div>
          ))}
        </div>
      </div>
    </CardBody>
  );
};

export default IsianDetailQuestion;
