import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditInstructionForm from "../../components/exam-cpns/instruction/CreateEditInstructionForm";

const EditInstruction = () => {
    return (
        <Row>
            <Col>
                <CreateEditInstructionForm type="edit"/>
            </Col>
        </Row>
    );
}

export default EditInstruction;

if (document.getElementById("edit-instruction-cpns"))
    ReactDOM.render(<EditInstruction />, document.getElementById("edit-instruction-cpns"));