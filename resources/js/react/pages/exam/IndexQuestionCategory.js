import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import QuestionCategoryTable from '../../components/exam/question-category';

const IndexQuestionCategory = () => {
  return (
    <Row>
      <Col sm="12">
        <QuestionCategoryTable />
      </Col>
    </Row>
  )
}

export default IndexQuestionCategory

if (document.getElementById("question-category-container")) {
  ReactDOM.render(<IndexQuestionCategory />, document.getElementById("question-category-container"));
}
