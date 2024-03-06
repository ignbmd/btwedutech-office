import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import PreTestPackageTable from "../../components/exam/pre-test-package";

const IndexPreTestPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <PreTestPackageTable />
      </Col>
    </Row>
  );
};

export default IndexPreTestPackage;

if (document.getElementById("pre-test-package-container")) {
  ReactDOM.render(
    <IndexPreTestPackage />,
    document.getElementById("pre-test-package-container")
  );
}
