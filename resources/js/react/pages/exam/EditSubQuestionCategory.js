import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditSubQuestionCategoryForm from "../../components/exam/sub-question-category/CreateEditSubQuestionCategoryForm";

const EditSubQuestionCategory = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditSubQuestionCategoryForm type="edit" />
      </Col>
    </Row>
  );
};

export default EditSubQuestionCategory;

if (document.getElementById("edit-question-sub-category-container")) {
  ReactDOM.render(
    <EditSubQuestionCategory />,
    document.getElementById("edit-question-sub-category-container")
  );
}
