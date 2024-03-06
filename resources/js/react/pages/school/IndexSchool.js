import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import SchoolTable from "../../components/school/SchoolTable";

const IndexSchool = () => {
  return (
    <Row>
      <Col sm="12">
        <SchoolTable />
      </Col>
    </Row>
  );
};

export default IndexSchool;

if (document.getElementById("index-school-container")) {
  ReactDOM.render(
    <IndexSchool />,
    document.getElementById("index-school-container")
  );
}
