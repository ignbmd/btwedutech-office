import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ExpenseContextProvider from "../../context/ExpenseContext";
import BranchPaysDebtNowForm from "../../components/pay-and-bill/BranchPaysDebtNowForm/BranchPaysDebtNowForm";

const BranchPaysDebtNow = () => {
  return (
    <Row>
      <Col sm="12">
        <BranchPaysDebtNowForm />
      </Col>
    </Row>
  );
};

export default BranchPaysDebtNow;

if (document.getElementById("branch-pays-debt-now-container")) {
  ReactDOM.render(
    <ExpenseContextProvider>
      <BranchPaysDebtNow />
    </ExpenseContextProvider>,
    document.getElementById("branch-pays-debt-now-container")
  );
}
