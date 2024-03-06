import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditCompetitionForm from "../../components/competition/EditCompetitionForm";

const EditCompetition = () => {
  return (
    <Row>
      <Col sm="12">
        <EditCompetitionForm />
      </Col>
    </Row>
  );
};

export default EditCompetition;

if (document.getElementById("edit-competition-container")) {
  ReactDOM.render(
    <EditCompetition />,
    document.getElementById("edit-competition-container")
  );
}
