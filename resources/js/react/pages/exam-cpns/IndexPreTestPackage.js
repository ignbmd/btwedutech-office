import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import PreTestPackageTable from "../../components/exam-cpns/pre-test-package";

const PreTestPackage = () => {
    return (
        <Row>
            <Col>
                <PreTestPackageTable />
            </Col>
        </Row>
    );
}

export default PreTestPackage;

if (document.getElementById("pre-test-package-container")){
    ReactDOM.render(<PreTestPackage />, document.getElementById("pre-test-package-container"));
}