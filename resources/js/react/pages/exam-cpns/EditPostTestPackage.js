import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditPreTestPackageForm from "../../components/exam-cpns/post-test-package/EditPostTestPackageForm";

const EditPackageTest = () =>{
    return(
        <div>
            <Row>
                <Col>
                    <EditPreTestPackageForm />
                </Col>
            </Row>
        </div>
    );
}

export default EditPackageTest;

if (document.getElementById("edit-post-test-package-container")){
    ReactDOM.render(<EditPackageTest />, document.getElementById("edit-post-test-package-container"));
}