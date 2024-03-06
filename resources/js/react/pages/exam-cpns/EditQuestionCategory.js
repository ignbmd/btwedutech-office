import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditSubQuestionCategoryForm from "../../components/exam-cpns/question-category/CreateEditQuestionCategoryForm";

const EditInstruction = () => {
    return (
      <Row>
        <Col sm="12">
          <CreateEditSubQuestionCategoryForm type="edit" />
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
  