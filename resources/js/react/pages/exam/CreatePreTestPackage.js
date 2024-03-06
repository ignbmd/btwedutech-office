import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreatePreTestPackageForm from "../../components/exam/pre-test-package/CreatePreTestPackageForm";

const CreatePreTestPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <CreatePreTestPackageForm />
      </Col>
    </Row>
  );
};

export default CreatePreTestPackage;

if (document.getElementById("create-pre-test-package-container")) {
  ReactDOM.render(
    <CreatePreTestPackage />,
    document.getElementById("create-pre-test-package-container")
  );
}
