import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import AddSessionTryoutFreeForm from "../../components/exam/tryout-free/AddSessionTryoutFreeForm";

const AddSessionTryoutFree = () => {
  return (
    <Row>
      <Col sm="12">
        <AddSessionTryoutFreeForm />
      </Col>
    </Row>
  );
};

export default AddSessionTryoutFree;

if (document.getElementById("add-session-tryout-free-container")) {
  ReactDOM.render(
    <AddSessionTryoutFree />,
    document.getElementById("add-session-tryout-free-container")
  );
}
