import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ConnectQuestionSection from "../../components/exam/ConnectQuestionSection";
import ExamModuleContextProvider from "../../context/ExamModuleContext";

const ConnectQuestion = () => {
  return (
    <Row>
      <Col sm="12">
        <ConnectQuestionSection />
      </Col>
    </Row>
  );
};

export default ConnectQuestion;

if (document.getElementById("connect-question-form")) {
  ReactDOM.render(
    <ExamModuleContextProvider>
      <ConnectQuestion />
    </ExamModuleContextProvider>,
    document.getElementById("connect-question-form")
  );
}
