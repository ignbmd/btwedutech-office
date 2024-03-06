import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditStudyMaterialDocumentForm from "../../components/exam/study-material-document/EditStudyMaterialDocumentForm";

const EditStudyMaterialDocument = () => {
  return (
    <Row>
      <Col sm="12">
        <EditStudyMaterialDocumentForm />
      </Col>
    </Row>
  );
};

export default EditStudyMaterialDocument;

if (document.getElementById("edit-study-material-document-container")) {
  ReactDOM.render(
    <EditStudyMaterialDocument />,
    document.getElementById("edit-study-material-document-container")
  );
}
