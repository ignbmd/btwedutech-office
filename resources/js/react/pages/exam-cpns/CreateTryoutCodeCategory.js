import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditTryoutCodeForm from "../../components/exam-cpns/tryout-code-category/CreateEditTryoutCodeCategoryForm";

const CreateTryoutCodeCategory = () =>{
    return (
        <Row>
            <Col>
                <CreateEditTryoutCodeForm type="create"/>
            </Col>
        </Row>
    )
}

export default CreateTryoutCodeCategory;

if(document.getElementById("create-tryout-code-category")){
    ReactDOM.render(<CreateTryoutCodeCategory/>, document.getElementById("create-tryout-code-category"));
}