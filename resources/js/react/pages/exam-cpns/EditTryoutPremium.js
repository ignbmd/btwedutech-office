import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditTryoutPremiumForm from "../../components/exam-cpns/tryout-premium/CreateEditTryoutPremiumForm";

const EditTryoutPremium = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditTryoutPremiumForm type="edit" />
      </Col>
    </Row>
  );
};

export default EditTryoutPremium;

if (document.getElementById("edit-tryout-premium-container")) {
  ReactDOM.render(
    <EditTryoutPremium />,
    document.getElementById("edit-tryout-premium-container")
  );
}
