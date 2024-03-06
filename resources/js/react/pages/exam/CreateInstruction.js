import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditInstructionForm from "../../components/exam/instruction/CreateEditInstructionForm";

const CreateInstruction = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditInstructionForm type="create" />
      </Col>
    </Row>
  );
};

export default CreateInstruction;

if (document.getElementById("create-instruction")) {
  ReactDOM.render(
    <CreateInstruction />,
    document.getElementById("create-instruction")
  );
}
