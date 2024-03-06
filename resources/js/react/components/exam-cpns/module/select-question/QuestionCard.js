// ** Custom Components & Plugins
import { useContext } from "react";
import { Media, Badge } from "reactstrap";
import classnames from "classnames";
import MathJax from "react-mathjax-preview";

import { ExamModuleContext } from "../../../../context/ExamModuleContext";
import CKEditorParser from "../../../core/parser/CKEditorParser";
import "./QuestionCard.css";

const QuestionCard = ({ number, question, handleQuestionClick }) => {
  const { examModuleState, selectQuestion } = useContext(ExamModuleContext);
  const { selectedQuestions, selectedQuestionData } = examModuleState;

  const onQuestionClick = () => {
    handleQuestionClick(question.id);
  };

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

  return (
    <Media
      tag="li"
      onClick={() => onQuestionClick(question.id)}
      className={classnames({ "mail-read": question.isRead })}
    >
      <div className="media-left pr-50">
        <div className="user-action">
          <div className="custom-control custom-checkbox">
            <input
              className="custom-control-input"
              type="checkbox"
              id={question.id}
              checked={selectedQuestions.includes(question.id)}
              onChange={(e) => e.stopPropagation()}
              onClick={(e) => {
                handleToggleCheckBox(e, question);
              }}
            />
            <label
              className="custom-control-label"
              htmlFor={question.id}
              onClick={(e) => {
                e.stopPropagation();
              }}
            ></label>
          </div>
        </div>
      </div>
      <span className="badge badge-light-primary mr-1">{question.id}</span>

      <Media body>
        <div className="mail-details">
          <div className="mail-items">
            <div className="mb-1">
              <Badge
                className="mr-25"
                style={{ backgroundColor: "#ff5722", color: "#fff" }}
              >
                {question.question_categories?.category}
              </Badge>
              <Badge
                className="mr-25"
                style={{ backgroundColor: "#ffd54f", color: "#000" }}
              >
                {question.sub_category_questions?.title}
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
            </div>
            <h5 className="mb-25 ellipsis select-question">
              <CKEditorParser mString={question.question} />
            </h5>
            <span className="text-truncate">{question?.sub_category}</span>
          </div>
          <div className="mail-meta-item">
            <span className="mail-date">{question.time}</span>
          </div>
        </div>
        <div className="mail-message ellipsis mb-0">
          <CKEditorParser mString={question.explanation} />
        </div>
      </Media>
    </Media>
  );
};

export default QuestionCard;
