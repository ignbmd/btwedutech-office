import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import AllMedicalCheckupHistoryTable from '../../components/health-check/AllMedicalCheckupHistoryTable';

const AllMedicalCheckup = () => {
  return (
    <Row>
      <Col sm="12">
        <AllMedicalCheckupHistoryTable />
      </Col>
    </Row>
  )
}

export default AllMedicalCheckup

if (document.getElementById("all-medical-checkup-container")) {
  ReactDOM.render(<AllMedicalCheckup />, document.getElementById("all-medical-checkup-container"));
}
