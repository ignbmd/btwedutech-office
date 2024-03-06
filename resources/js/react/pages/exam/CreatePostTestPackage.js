import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreatePostTestPackageForm from "../../components/exam/post-test-package/CreatePostTestPackageForm";

const CreatePostTestPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <CreatePostTestPackageForm />
      </Col>
    </Row>
  );
};

export default CreatePostTestPackage;

if (document.getElementById("create-post-test-package-container")) {
  ReactDOM.render(
    <CreatePostTestPackage />,
    document.getElementById("create-post-test-package-container")
  );
}
