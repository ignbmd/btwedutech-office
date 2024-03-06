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

const DetailQuestionCard = ({ question, mediaURL = null, number = 0 }) => {
  return (
    <Card>
      <CardHeader className="email-detail-head">
        <div className="user-details d-flex justify-content-between align-items-center flex-wrap">
          <div className="mail-items">
            <div className="mb-0 h5">
              {number ? (
                <>
                  <Badge color="primary" className="mb-50">
                    Nomor {number}
                  </Badge>
                  <Badge color="light-primary" className="ml-50 mb-50">
                    ID {question?.id}
                  </Badge>
                  <Badge
                    className="ml-50 mb-50"
                    style={{ backgroundColor: "#ff5722", color: "#fff" }}
                  >
                    {question.hasOwnProperty("question_categories")
                      ? question?.question_categories?.category
                      : question?.category}
                  </Badge>
                  <Badge
                    className="ml-50 mb-50"
                    style={{ backgroundColor: "#FFE0D6", color: "#ff5722" }}
                  >
                    {question.hasOwnProperty("sub_category_questions")
                      ? question?.sub_category_questions?.title
                      : question?.sub_category}
                  </Badge>
                </>
              ) : (
                ""
              )}
              <div className="question">
                <CKEditorParser mString={question.question} />
              </div>
            </div>
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
            {question.answers.map((answer, index) => (
              <div
                key={index}
                className={classnames(
                  "discussion-answer-content__item font-pp-semi-bold",
                  answer.is_true && "discussion-answer-content__item--success"
                )}
              >
                <div className="discussion-answer-content-item__option d-flex">
                  <span
                    className="font-weight-bolder mr-25"
                    style={{ minWidth: "15px" }}
                  >
                    {answer.option}.
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

      <CardFooter>
        <div className="discussion-explanation">
          <p className="title-text font-pp-semi-bold mb-1">
            <b>Penjelasan Soal</b>
          </p>
          <CKEditorParser mString={question.explanation} />
        </div>
      </CardFooter>

      {mediaURL && (
        <CardFooter>
          <div className="discussion-explanation">
            <p className="title-text font-pp-semi-bold mb-1">
              <b>Video Penjelasan Soal</b>
            </p>
            <video width="620" controls>
              <source src={mediaURL} type="video/mp4" />
            </video>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default DetailQuestionCard;
