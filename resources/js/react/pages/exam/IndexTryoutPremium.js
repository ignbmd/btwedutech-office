import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import TryoutPremiumTable from '../../components/exam/tryout-premium';

const IndexTryoutPremium = () => {
  return (
    <Row>
      <Col sm="12">
        <TryoutPremiumTable />
      </Col>
    </Row>
  )
}

export default IndexTryoutPremium

if (document.getElementById("tryout-premium-container")) {
  ReactDOM.render(<IndexTryoutPremium />, document.getElementById("tryout-premium-container"));
}
