import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditPackageTryoutFreeForm from "../../components/exam/tryout-free/EditPackageTryoutFreeForm";

const EditPackageTryoutFree = () => {
  return (
    <Row>
      <Col sm="12">
        <EditPackageTryoutFreeForm />
      </Col>
    </Row>
  );
};

export default EditPackageTryoutFree;

if (document.getElementById("edit-package-tryout-free-container")) {
  ReactDOM.render(
    <EditPackageTryoutFree />,
    document.getElementById("edit-package-tryout-free-container")
  );
}
