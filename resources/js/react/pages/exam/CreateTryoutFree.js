import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateTryoutFreeForm from "../../components/exam/tryout-free/CreateTryoutFreeForm";

const CreateTryoutFree = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateTryoutFreeForm />
      </Col>
    </Row>
  );
};

export default CreateTryoutFree;

if (document.getElementById("create-tryout-free")) {
  ReactDOM.render(
    <CreateTryoutFree />,
    document.getElementById("create-tryout-free")
  );
}
