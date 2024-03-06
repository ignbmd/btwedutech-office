import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreatePreTestPackageForm from "../../components/exam-cpns/pre-test-package/CreatePreTestPackageForm";

const CreatePreTestPackage = () => {
    return (
        <Row>
            <Col>
                <CreatePreTestPackageForm />
            </Col>
        </Row>
    );
}

export default CreatePreTestPackage;

if (document.getElementById("create-pre-test-package")){
    ReactDOM.render(<CreatePreTestPackage />, document.getElementById("create-pre-test-package"));
}