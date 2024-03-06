import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditPackageForm from "../../components/exam-cpns/package/EditPackageForm";

const EditPackage = () => {
    return (
        <div>
            <Row>
                <Col>
                    <EditPackageForm type="edit"/>
                </Col>
            </Row>
        </div>
    );
}

export default EditPackage;

if (document.getElementById("edit-package-cpns")){
    ReactDOM.render(<EditPackage />, document.getElementById("edit-package-cpns"));
}