import React from 'react'
import ReactDOM from "react-dom";
import { Card, Col, Row } from 'reactstrap';

import UserRetentionChart from '../../components/components/UserRetentionChart';

const IndexDashboard = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <UserRetentionChart />
        </Card>
      </Col>
    </Row>
  )
}

export default IndexDashboard

if (document.getElementById("dashboard-container")) {
  ReactDOM.render(<IndexDashboard />, document.getElementById("dashboard-container"));
}
