import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import InstructionTable from '../../components/exam/instruction';

const IndexInstruction = () => {
  return (
    <Row>
      <Col sm="12">
        <InstructionTable />
      </Col>
    </Row>
  )
}

export default IndexInstruction

if (document.getElementById("instruction-container")) {
  ReactDOM.render(<IndexInstruction />, document.getElementById("instruction-container"));
}
