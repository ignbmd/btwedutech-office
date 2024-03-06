import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditQuestionCategoryForm from "../../components/exam/question-category/CreateEditQuestionCategoryForm";

const CreateQuestionCategory = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditQuestionCategoryForm type="create" />
      </Col>
    </Row>
  );
};

export default CreateQuestionCategory;

if (document.getElementById("create-question-category-container")) {
  ReactDOM.render(
    <CreateQuestionCategory />,
    document.getElementById("create-question-category-container")
  );
}
