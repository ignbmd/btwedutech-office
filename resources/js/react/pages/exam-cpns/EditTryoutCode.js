import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditTryoutCodeForm from "../../components/exam-cpns/tryout-code/CreateEditTryoutCodeForm";

const EditTryoutCode = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditTryoutCodeForm type="edit" />
      </Col>
    </Row>
  );
};

export default EditTryoutCode;

if (document.getElementById("edit-tryout-code-container")) {
  ReactDOM.render(
    <EditTryoutCode />,
    document.getElementById("edit-tryout-code-container")
  );
}
