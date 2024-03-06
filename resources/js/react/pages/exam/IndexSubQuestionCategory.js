import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import SubQuestionCategoryTable from '../../components/exam/sub-question-category';

const IndexSubQuestionCategory = () => {
  return (
    <Row>
      <Col sm="12">
        <SubQuestionCategoryTable />
      </Col>
    </Row>
  )
}

export default IndexSubQuestionCategory

if (document.getElementById("sub-question-category-container")) {
  ReactDOM.render(<IndexSubQuestionCategory />, document.getElementById("sub-question-category-container"));
}
