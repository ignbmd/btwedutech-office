import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import PackageTable from '../../components/exam-cpns/package';

const IndexPackage = () => {
    return (
        <Row>
            <Col md="12">
                <PackageTable type="index"/>
            </Col>
        </Row>
    )
}

export default IndexPackage;

if (document.getElementById("index-package-cpns")){
    ReactDOM.render(<IndexPackage />, document.getElementById("index-package-cpns"));
}