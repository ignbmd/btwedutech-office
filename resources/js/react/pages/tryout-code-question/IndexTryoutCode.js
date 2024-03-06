import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import TryoutCodeTable from "../../components/tryout-code-question/TryoutCodeTable";

const IndexTryoutCode = () => {
  return (
    <Row>
      <Col sm="12">
        <TryoutCodeTable />
      </Col>
    </Row>
  );
};

export default IndexTryoutCode;

if (document.getElementById("tryout-code-container")) {
  ReactDOM.render(
    <IndexTryoutCode />,
    document.getElementById("tryout-code-container")
  );
}
