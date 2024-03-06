import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateQuestionForm from "../../components/exam/CreateQuestionForm";

const CreateQuestion = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateQuestionForm />
      </Col>
    </Row>
  );
};

export default CreateQuestion;

if (document.getElementById("create-question-form")) {
  ReactDOM.render(
    <CreateQuestion />,
    document.getElementById("create-question-form")
  );
}
