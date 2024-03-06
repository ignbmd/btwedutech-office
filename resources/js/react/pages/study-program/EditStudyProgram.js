import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditStudyProgramForm from "../../components/study-program/EditStudyProgramForm";

const EditStudyProgram = () => {
  return (
    <Row>
      <Col sm="12">
        <EditStudyProgramForm />
      </Col>
    </Row>
  );
};

export default EditStudyProgram;

if (document.getElementById("edit-study-program-container")) {
  ReactDOM.render(
    <EditStudyProgram />,
    document.getElementById("edit-study-program-container")
  );
}
