import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditTryoutCodeCategoryForm from "../../components/exam/tryout-code-category/CreateEditTryoutCodeCategoryForm";

const EditTryoutCodeCategory = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditTryoutCodeCategoryForm type="edit" />
      </Col>
    </Row>
  );
};

export default EditTryoutCodeCategory;

if (document.getElementById("edit-tryout-code-category")) {
  ReactDOM.render(
    <EditTryoutCodeCategory />,
    document.getElementById("edit-tryout-code-category")
  );
}
