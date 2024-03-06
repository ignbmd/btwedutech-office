import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditStudyMaterialForm from "../../components/exam-cpns/study-material/EditStudyMaterialForm";

const EditStudyMaterial = () => {
  return (
    <Row>
      <Col sm="12">
        <EditStudyMaterialForm />
      </Col>
    </Row>
  );
};

export default EditStudyMaterial;

if (document.getElementById("edit-study-material-container")) {
  ReactDOM.render(
    <EditStudyMaterial />,
    document.getElementById("edit-study-material-container")
  );
}
