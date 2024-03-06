import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import InstructionTable from '../../components/exam-cpns/instruction';

const IndexInstruction = () => {
    return (
        <Row>
            <Col sm="12">
                <InstructionTable type="index"/>
            </Col>
        </Row>
    )
}

export default IndexInstruction;

if (document.getElementById("instruction-cpns-container")){
    ReactDOM.render(<IndexInstruction />, document.getElementById("instruction-cpns-container"));
}