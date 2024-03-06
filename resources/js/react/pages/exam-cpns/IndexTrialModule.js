import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import TrialModuleTable from "../../components/exam-cpns/trial-module";

const IndexTrialModule = () => {
  return (
    <Row>
      <Col sm="12">
        <TrialModuleTable />
      </Col>
    </Row>
  );
};

export default IndexTrialModule;

if (document.getElementById("trial-module-container")) {
  ReactDOM.render(
    <IndexTrialModule />,
    document.getElementById("trial-module-container")
  );
}
