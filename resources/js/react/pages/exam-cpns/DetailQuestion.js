import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';
import DetailQuestionSection from '../../components/exam/DetailQuestionSection';

const DetailQuestion = () => {
  return (
    <Row>
      <Col sm="12">
        <DetailQuestionSection />
      </Col>
    </Row>
  )
}

export default DetailQuestion

if (document.getElementById("detail-question-container")) {
  ReactDOM.render(<DetailQuestion />, document.getElementById("detail-question-container"));
}
