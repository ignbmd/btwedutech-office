import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditSchoolForm from "../../components/school/EditSchoolForm";

const EditSchool = () => {
  return (
    <Row>
      <Col sm="12">
        <EditSchoolForm />
      </Col>
    </Row>
  );
};

export default EditSchool;

if (document.getElementById("edit-school-container")) {
  ReactDOM.render(
    <EditSchool />,
    document.getElementById("edit-school-container")
  );
}
