import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import BranchPaysDebtForm from "../../components/pay-and-bill/BranchPaysDebtForm/BranchPaysDebtForm";

const BranchPaysDebt = () => {
  return (
    <Row>
      <Col sm="12">
        <BranchPaysDebtForm />
      </Col>
    </Row>
  );
};

export default BranchPaysDebt;

if (document.getElementById("branch-pays-debt-container")) {
  ReactDOM.render(
    <BranchPaysDebt />,
    document.getElementById("branch-pays-debt-container")
  );
}
