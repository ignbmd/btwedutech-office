import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreatePackageForm from "../../components/exam/assessment-package/CreatePackageForm";

const CreateAssessmentPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <CreatePackageForm />
      </Col>
    </Row>
  );
};

export default CreateAssessmentPackage;

if (document.getElementById("create-package")) {
  ReactDOM.render(
    <CreateAssessmentPackage />,
    document.getElementById("create-package")
  );
}
