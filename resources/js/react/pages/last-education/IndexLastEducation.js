import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import LastEducationTable from "../../components/last-education/LastEducationTable";

const IndexLastEducation = () => {
  return (
    <Row>
      <Col sm="12">
        <LastEducationTable />
      </Col>
    </Row>
  );
};

export default IndexLastEducation;

if (document.getElementById("index-last-education-container")) {
  ReactDOM.render(
    <IndexLastEducation />,
    document.getElementById("index-last-education-container")
  );
}
