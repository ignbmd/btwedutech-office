import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateLastEducationForm from "../../components/last-education/CreateLastEducationForm";

const CreateLastEducation = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateLastEducationForm />
      </Col>
    </Row>
  );
};

export default CreateLastEducation;

if (document.getElementById("create-last-education-container")) {
  ReactDOM.render(
    <CreateLastEducation />,
    document.getElementById("create-last-education-container")
  );
}
