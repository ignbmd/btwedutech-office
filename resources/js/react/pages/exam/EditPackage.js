import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditPackageForm from "../../components/exam/package/EditPackageForm";

const EditPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <EditPackageForm />
      </Col>
    </Row>
  );
};

export default EditPackage;

if (document.getElementById("edit-package-container")) {
  ReactDOM.render(
    <EditPackage />,
    document.getElementById("edit-package-container")
  );
}
