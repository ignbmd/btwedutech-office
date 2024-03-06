import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditTrialModuleForm from "../../components/exam/trial-module/CreateEditTrialModuleForm";

const CreateTrialModule = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditTrialModuleForm type="create" />
      </Col>
    </Row>
  );
};

export default CreateTrialModule;

if (document.getElementById("create-trial-module")) {
  ReactDOM.render(
    <CreateTrialModule />,
    document.getElementById("create-trial-module")
  );
}
