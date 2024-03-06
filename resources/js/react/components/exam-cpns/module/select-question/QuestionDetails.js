import { Fragment } from "react";
import classnames from "classnames";
import {
  Row,
  Col,
  Badge,
} from "reactstrap";
import { ChevronLeft } from "react-feather";
import PerfectScrollbar from "react-perfect-scrollbar";

import DetailQuestionCard from "../../DetailQuestionCard";

const QuestionDetails = ({ question, openQuestion, setOpenQuestion }) => {
  const renderLabels = (arr) => {
    if (arr && arr.length) {
      return arr.map((label) => (
        <Badge
          key={label}
          color="light-success"
          className="mr-50 text-capitalize"
          pill
        >
          {label}
        </Badge>
      ));
    }
  };

  const renderMessage = (obj) => {
    return <DetailQuestionCard question={obj} />;
  };

  const handleGoBack = () => {
    setOpenQuestion(false);
  };

  return (
    <div
      className={classnames("email-app-details w-100", {
        show: openQuestion,
      })}
    >
      {question !== null && question !== undefined ? (
        <Fragment>
          <div className="email-detail-header">
            <div className="email-header-left d-flex align-items-center">
              <span className="go-back mr-1" onClick={handleGoBack}>
                <ChevronLeft size={20} />
              </span>
              <h4 className="email-subject mb-0">Soal #{question.id}</h4>
            </div>
          </div>
          <PerfectScrollbar
            className="email-scroll-area"
          >
            <Row>
              <Col sm="12">
                <div className="email-label">{renderLabels(question.tags)}</div>
              </Col>
            </Row>
            <Row>
              <Col sm="12">{renderMessage(question)}</Col>
            </Row>
          </PerfectScrollbar>
        </Fragment>
      ) : null}
    </div>
  );
};

export default QuestionDetails;
