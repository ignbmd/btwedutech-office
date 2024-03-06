import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditSessionScoreForm from "../../../components/samapta/EditSessionScoreForm";
const EditSessionScore = () => {
  return (
    <Row>
      <Col sm="12">
        <EditSessionScoreForm />
      </Col>
    </Row>
  );
};
export default EditSessionScore;

if (document.getElementById("container")) {
  ReactDOM.render(<EditSessionScore />, document.getElementById("container"));
}
