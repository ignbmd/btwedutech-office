import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import TryoutCodeCategoryTable from "../../components/exam/tryout-code-category";

const IndexTryoutCode = () => {
  return (
    <Row>
      <Col sm="12">
        <TryoutCodeCategoryTable />
      </Col>
    </Row>
  );
};

export default IndexTryoutCode;

if (document.getElementById("tryout-code-category-container")) {
  ReactDOM.render(
    <IndexTryoutCode />,
    document.getElementById("tryout-code-category-container")
  );
}
