import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditTrialModuleForm from "../../components/exam/trial-module/CreateEditTrialModuleForm";

const EditTrialModule = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditTrialModuleForm type="edit" />
      </Col>
    </Row>
  );
};

export default EditTrialModule;

if (document.getElementById("edit-trial-module")) {
  ReactDOM.render(
    <EditTrialModule />,
    document.getElementById("edit-trial-module")
  );
}
