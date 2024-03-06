import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import StudyMaterialDocumentTable from "../../components/exam-cpns/study-material-document";

const IndexStudyMaterialDocument = () => {
  return (
    <Row>
      <Col sm="12">
        <StudyMaterialDocumentTable />
      </Col>
    </Row>
  );
};

export default IndexStudyMaterialDocument;

if (document.getElementById("study-material-document-container")) {
  ReactDOM.render(
    <IndexStudyMaterialDocument />,
    document.getElementById("study-material-document-container")
  );
}
