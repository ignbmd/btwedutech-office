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
import CheckboxDetailQuestion from "./CheckboxDetailQuestion";
import MultipleOptionDetailQuestion from "./MultipleOptionDetailQuestion";
import StatementDetailQuestion from "./StatementDetailQuestion";
import IsianDetailQuestion from "./IsianDetailQuestion";

const loadDetailQuestionComponent = (question) => {
  switch (question?.answer_type) {
    case "CHECKBOX":
      return <CheckboxDetailQuestion question={question} />;
    case "PERNYATAAN":
      return <StatementDetailQuestion question={question} />;
    case "NUMBER":
      return <IsianDetailQuestion question={question} />;
    default:
      return <MultipleOptionDetailQuestion question={question} />;
  }
};

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
                    {question.question_categories?.program == "tps"
                      ? question.question_categories?.description
                      : question.question_categories?.category}
                  </Badge>
                  <Badge
                    className="ml-50 mb-50"
                    style={{ backgroundColor: "#FFE0D6", color: "#ff5722" }}
                  >
                    {question.sub_category_questions?.title}
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
      {loadDetailQuestionComponent(question)}
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
