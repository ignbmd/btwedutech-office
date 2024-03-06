import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import PostTestPackageTable from "../../components/exam/post-test-package";

const IndexPostTestPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <PostTestPackageTable />
      </Col>
    </Row>
  );
};

export default IndexPostTestPackage;

if (document.getElementById("post-test-package-container")) {
  ReactDOM.render(
    <IndexPostTestPackage />,
    document.getElementById("post-test-package-container")
  );
}
