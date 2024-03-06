import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import PostTestPackageTable from '../../components/exam-cpns/post-test-package';

const PostTestPackage = () =>{
    return(
        <div>
            <Row>
                <Col>
                    <PostTestPackageTable/>
                </Col>
            </Row>
        </div>
    )
}

export default PostTestPackage;

if (document.getElementById("post-test-package-cpns")){
    ReactDOM.render(<PostTestPackage/>, document.getElementById("post-test-package-cpns"));
}