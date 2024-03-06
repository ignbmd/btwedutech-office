import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditLastEducationForm from "../../components/last-education/EditLastEducationForm";

const EditLastEducation = () => {
  return (
    <Row>
      <Col sm="12">
        <EditLastEducationForm />
      </Col>
    </Row>
  );
};

export default EditLastEducation;

if (document.getElementById("edit-last-education-container")) {
  ReactDOM.render(
    <EditLastEducation />,
    document.getElementById("edit-last-education-container")
  );
}
