import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditSubQuestionCategoryForm from "../../components/exam-cpns/sub-question-category/CreateEditSubQuestionCategoryForm";

const EditSubQuestionCategory = () => {
    return (
        <Row>
            <Col md="12">
                <CreateEditSubQuestionCategoryForm type="edit" />
            </Col>
        </Row>
    );
}

export default EditSubQuestionCategory;

if (document.getElementById("edit-sub-question-category-cpns")){
    ReactDOM.render(
        <EditSubQuestionCategory />,
    document.getElementById("edit-sub-question-category-cpns"));
}