import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import EditQuestionForm from '../../components/exam/EditQuestionForm';

const EditQuestion = () => {
  return (
    <Row>
      <Col sm="12">
        <EditQuestionForm />
      </Col>
    </Row>
  )
}

export default EditQuestion

if (document.getElementById("edit-question-container")) {
  ReactDOM.render(<EditQuestion />, document.getElementById("edit-question-container"));
}
