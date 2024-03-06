import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreatePackageForm from "../../components/exam-cpns/package/CreatePackage";

const CreatePackageCpns = () => {
    return (
        <Row>
            <Col md="12">
                <CreatePackageForm type="create"/>
            </Col>
        </Row>
    );
}

export default CreatePackageCpns;

if (document.getElementById("create-package-cpns")){
    ReactDOM.render(<CreatePackageCpns />, document.getElementById("create-package-cpns"));
}