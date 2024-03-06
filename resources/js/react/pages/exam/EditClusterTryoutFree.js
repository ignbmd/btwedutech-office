import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditClusterTryoutFreeForm from "../../components/exam/tryout-free/EditClusterTryoutFreeForm";

const EditClusterTryoutFree = () => {
  return (
    <Row>
      <Col sm="12">
        <EditClusterTryoutFreeForm />
      </Col>
    </Row>
  );
};

export default EditClusterTryoutFree;

if (document.getElementById("edit-cluster-tryout-free-container")) {
  ReactDOM.render(
    <EditClusterTryoutFree />,
    document.getElementById("edit-cluster-tryout-free-container")
  );
}
