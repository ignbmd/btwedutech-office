import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ExamModuleContextProvider from "../../context/ExamModuleContext";
import CreateEditModuleForm from "../../components/exam/module/CreateEditModuleForm";

const CreateModule = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditModuleForm type="create" />
      </Col>
    </Row>
  );
};

export default CreateModule;

if (document.getElementById("create-module-form")) {
  ReactDOM.render(
    <ExamModuleContextProvider>
      <CreateModule />
    </ExamModuleContextProvider>,
    document.getElementById("create-module-form")
  );
}
