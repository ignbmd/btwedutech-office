import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import BranchDebtAndCreditIndex from "../../components/pay-and-bill/BranchIndex";

const CentralDebt = () => {
  return (
    <Row>
      <Col sm="12">
        <BranchDebtAndCreditIndex />
      </Col>
    </Row>
  )
}

export default CentralDebt

if (document.getElementById("branch-debt-credit-container")) {
  ReactDOM.render(<CentralDebt />, document.getElementById("branch-debt-credit-container"));
}
