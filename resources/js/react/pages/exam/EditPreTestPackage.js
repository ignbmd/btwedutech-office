import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditPreTestPackageForm from "../../components/exam/pre-test-package/EditPreTestPackageForm";

const EditPreTestPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <EditPreTestPackageForm />
      </Col>
    </Row>
  );
};

export default EditPreTestPackage;

if (document.getElementById("edit-pre-test-package-container")) {
  ReactDOM.render(
    <EditPreTestPackage />,
    document.getElementById("edit-pre-test-package-container")
  );
}
