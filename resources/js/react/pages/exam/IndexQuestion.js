import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';
import QuestionTable from '../../components/exam';

const IndexQuestion = () => {
  return (
    <Row>
      <Col sm="12">
        <QuestionTable />
      </Col>
    </Row>
  )
}

export default IndexQuestion

if (document.getElementById("question-container")) {
  ReactDOM.render(<IndexQuestion />, document.getElementById("question-container"));
}
