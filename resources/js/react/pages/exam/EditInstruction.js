import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import CreateEditInstructionForm from '../../components/exam/instruction/CreateEditInstructionForm';

const EditInstruction = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditInstructionForm type="edit" />
      </Col>
    </Row>
  )
}

export default EditInstruction

if (document.getElementById("edit-instruction-container")) {
  ReactDOM.render(<EditInstruction />, document.getElementById("edit-instruction-container"));
}
