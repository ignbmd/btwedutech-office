import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ModuleTable from "../../components/exam-cpns/module";

const IndexModule = () => {
  return (
    <Row>
      <Col sm="12">
        <ModuleTable />
      </Col>
    </Row>
  );
};

export default IndexModule;

if (document.getElementById("module-container")) {
  ReactDOM.render(<IndexModule />, document.getElementById("module-container"));
}
