import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import HistoryTable from '../../components/health-check/HistoryTable';

const History = () => {
  return (
    <Row>
      <Col sm="12">
        <HistoryTable />
      </Col>
    </Row>
  )
}

export default History

if (document.getElementById("medical-checkup-history-container")) {
  ReactDOM.render(<History />, document.getElementById("medical-checkup-history-container"));
}
