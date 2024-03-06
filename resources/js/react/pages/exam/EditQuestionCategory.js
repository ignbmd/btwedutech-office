import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditQuestionCategoryForm from "../../components/exam/question-category/CreateEditQuestionCategoryForm";

const EditInstruction = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditQuestionCategoryForm type="edit" />
      </Col>
    </Row>
  );
};

export default EditInstruction;

if (document.getElementById("edit-question-category-container")) {
  ReactDOM.render(
    <EditInstruction />,
    document.getElementById("edit-question-category-container")
  );
}
