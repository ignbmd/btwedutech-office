import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import TryoutCodeTable from "../../components/exam-cpns/tryout-code-category";

const TryoutCodeCategory = () => {
    return (
        <Row>
            <Col>
                <TryoutCodeTable type="index"/>
            </Col>
        </Row>
    )
}

export default TryoutCodeCategory ;

if (document.getElementById("tryout-code-category-container")){
    ReactDOM.render(<TryoutCodeCategory/>, document.getElementById("tryout-code-category-container"));
}