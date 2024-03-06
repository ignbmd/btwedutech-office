import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import CreatePostTestPackageForm from '../../components/exam-cpns/post-test-package/CreatePostTestPackageForm';

const CreatePostTest = () => {
    return (
        <div>
            <Row>
                <Col>
                    <CreatePostTestPackageForm />
                </Col>
            </Row>
        </div>
    )
}

export default CreatePostTest

if (document.getElementById("create-post-test-package-container")){
    ReactDOM.render(<CreatePostTest />, document.getElementById("create-post-test-package-container"));
}
