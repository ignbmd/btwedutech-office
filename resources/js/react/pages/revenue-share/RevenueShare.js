import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import RevenueShareTable from '../../components/revenue-share';

const RevenueShare = () => {
  return (
    <Row>
      <Col sm="12">
        <RevenueShareTable />
      </Col>
    </Row>
  )
}

export default RevenueShare

if (document.getElementById("revenue-share-container")) {
  ReactDOM.render(<RevenueShare />, document.getElementById("revenue-share-container"));
}
