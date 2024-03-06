import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateGlobalExerciseScoreForm from "../../../components/samapta/CreateGlobalExerciseScoreForm";
const CreateGlobalExerciseScore = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateGlobalExerciseScoreForm />
      </Col>
    </Row>
  );
};
export default CreateGlobalExerciseScore;

if (document.getElementById("container")) {
  ReactDOM.render(
    <CreateGlobalExerciseScore />,
    document.getElementById("container")
  );
}
