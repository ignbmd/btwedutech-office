import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateSessionScoreForm from "../../../components/samapta/CreateSessionScoreForm";
const CreateSessionScore = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateSessionScoreForm />
      </Col>
    </Row>
  );
};
export default CreateSessionScore;

if (document.getElementById("container")) {
  ReactDOM.render(<CreateSessionScore />, document.getElementById("container"));
}
