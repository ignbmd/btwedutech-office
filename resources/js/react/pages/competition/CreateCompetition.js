import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateCompetitionForm from "../../components/competition/CreateCompetitionForm";

const CreateCompetition = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateCompetitionForm />
      </Col>
    </Row>
  );
};

export default CreateCompetition;

if (document.getElementById("create-competition-container")) {
  ReactDOM.render(
    <CreateCompetition />,
    document.getElementById("create-competition-container")
  );
}
