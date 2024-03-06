import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import QuestionCategory from '../../components/exam-cpns/question-category';

const IndexQuestionCategory = () => {
    return (
        <Row>
            <Col md="12">
                <QuestionCategory />
            </Col>
        </Row>
    )
}

export default IndexQuestionCategory;

if (document.getElementById("question-category-container")){
    ReactDOM.render(<IndexQuestionCategory />, document.getElementById("question-category-container"));
}