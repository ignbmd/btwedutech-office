import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditPackageForm from "../../components/exam/assessment-package/EditPackageForm";

const EditAssessmentPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <EditPackageForm />
      </Col>
    </Row>
  );
};

export default EditAssessmentPackage;

if (document.getElementById("edit-package-container")) {
  ReactDOM.render(
    <EditAssessmentPackage />,
    document.getElementById("edit-package-container")
  );
}
