import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import SubQuestionCategoryTable from '../../components/exam-cpns/sub-question-category';

const IndexSubQuestionCategory = () => {
    return (
        <Row>
            <Col md="12">
                <SubQuestionCategoryTable />
            </Col>
        </Row>
    )
}

export default IndexSubQuestionCategory

if (document.getElementById("sub-question-category-cpns")){
    ReactDOM.render(<IndexSubQuestionCategory />, document.getElementById("sub-question-category-cpns"));
}