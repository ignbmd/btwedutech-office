import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateSchoolForm from "../../components/school/CreateSchoolForm";

const CreateSchool = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateSchoolForm />
      </Col>
    </Row>
  );
};

export default CreateSchool;

if (document.getElementById("create-school-container")) {
  ReactDOM.render(
    <CreateSchool />,
    document.getElementById("create-school-container")
  );
}
