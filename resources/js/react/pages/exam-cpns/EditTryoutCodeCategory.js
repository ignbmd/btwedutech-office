import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditTryoutCodeForm from "../../components/exam-cpns/tryout-code-category/CreateEditTryoutCodeCategoryForm";

const EditTryoutCode = () =>{
    return (
        <Row>
            <Col>
                <CreateEditTryoutCodeForm type="edit"/>
            </Col>
        </Row>
    )
}

export default EditTryoutCode;

if(document.getElementById("edit-tryout-code-category")){
    ReactDOM.render(<EditTryoutCode />, document.getElementById("edit-tryout-code-category"));
}