import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditTryoutCodeForm from "../../components/exam/tryout-code/CreateEditTryoutCodeForm";

const CreateTryoutCode = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditTryoutCodeForm type="create" />
      </Col>
    </Row>
  );
};

export default CreateTryoutCode;

if (document.getElementById("create-tryout-code")) {
  ReactDOM.render(
    <CreateTryoutCode />,
    document.getElementById("create-tryout-code")
  );
}
