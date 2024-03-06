import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditPreTestPackageForm from "../../components/exam-cpns/pre-test-package/EditPreTestPackageForm";

const EditPreTestPackage = () => {
    return (
        <>
            <Row>
                <Col md="12">
                    <EditPreTestPackageForm />
                </Col>
            </Row>
        </>
    );
}

export default EditPreTestPackage;

if (document.getElementById("edit-pre-test-package-cpns")){
    ReactDOM.render(<EditPreTestPackage />, document.getElementById("edit-pre-test-package-cpns"));
}