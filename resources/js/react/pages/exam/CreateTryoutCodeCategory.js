import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditTryoutCodeCategoryForm from "../../components/exam/tryout-code-category/CreateEditTryoutCodeCategoryForm";

const CreateTryoutCodeCategory = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditTryoutCodeCategoryForm type="create" />
      </Col>
    </Row>
  );
};

export default CreateTryoutCodeCategory;

if (document.getElementById("create-tryout-code-category")) {
  ReactDOM.render(
    <CreateTryoutCodeCategory />,
    document.getElementById("create-tryout-code-category")
  );
}
