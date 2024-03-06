import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import PackageTable from "../../components/exam/assessment-package";

const IndexAssessmentPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <PackageTable />
      </Col>
    </Row>
  );
};

export default IndexAssessmentPackage;

if (document.getElementById("package-container")) {
  ReactDOM.render(
    <IndexAssessmentPackage />,
    document.getElementById("package-container")
  );
}
