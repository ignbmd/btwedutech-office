import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import StakesTable from "../../components/health-check/StakesTable";

const IndexStakes = () => {
  return (
    <Row>
      <Col sm="12">
        <StakesTable />
      </Col>
    </Row>
  )
}

export default IndexStakes

if (document.getElementById("health-check-stakes-container")) {
  ReactDOM.render(<IndexStakes />, document.getElementById("health-check-stakes-container"));
}
