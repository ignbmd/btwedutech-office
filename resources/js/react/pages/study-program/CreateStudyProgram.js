import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateStudyProgramForm from "../../components/study-program/CreateStudyProgramForm";

const CreateStudyProgram = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateStudyProgramForm />
      </Col>
    </Row>
  );
};

export default CreateStudyProgram;

if (document.getElementById("create-study-program-container")) {
  ReactDOM.render(
    <CreateStudyProgram />,
    document.getElementById("create-study-program-container")
  );
}
