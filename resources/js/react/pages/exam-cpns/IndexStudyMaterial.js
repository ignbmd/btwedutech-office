import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import StudyMaterialTable from "../../components/exam-cpns/study-material";

const IndexStudyMaterial = () => {
  return (
    <Row>
      <Col sm="12">
        <StudyMaterialTable />
      </Col>
    </Row>
  );
};

export default IndexStudyMaterial;

if (document.getElementById("study-material-container")) {
  ReactDOM.render(
    <IndexStudyMaterial />,
    document.getElementById("study-material-container")
  );
}
