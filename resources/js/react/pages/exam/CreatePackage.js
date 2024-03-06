import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreatePackageForm from "../../components/exam/package/CreatePackageForm";

const CreatePackage = () => {
  return (
    <Row>
      <Col sm="12">
        <CreatePackageForm />
      </Col>
    </Row>
  );
};

export default CreatePackage;

if (document.getElementById("create-package")) {
  ReactDOM.render(<CreatePackage />, document.getElementById("create-package"));
}
