import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditPostTestPackageForm from "../../components/exam/post-test-package/EditPostTestPackageForm";

const EditPostTestPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <EditPostTestPackageForm />
      </Col>
    </Row>
  );
};

export default EditPostTestPackage;

if (document.getElementById("edit-post-test-package-container")) {
  ReactDOM.render(
    <EditPostTestPackage />,
    document.getElementById("edit-post-test-package-container")
  );
}
