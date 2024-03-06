import ReactDOM from "react-dom";
import React from 'react'
import { Col, Row } from 'reactstrap';
import DebtAndCredit from "../../components/pay-and-bill";

const PayAndBill = () => {
  return (
    <Row>
      <Col sm="12">
        <DebtAndCredit />
      </Col>
    </Row>
  )
}

export default PayAndBill

if (document.getElementById("pay-and-bill-container")) {
  ReactDOM.render(<PayAndBill />, document.getElementById("pay-and-bill-container"));
}
