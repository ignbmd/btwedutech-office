import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ExamModuleContextProvider from "../../context/ExamModuleContext";
import CreateEditModuleForm from "../../components/exam-cpns/module/CreateEditModuleForm";

const EditModule = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditModuleForm type="edit" />
      </Col>
    </Row>
  );
};

export default EditModule;

if (document.getElementById("edit-module-form")) {
  ReactDOM.render(
    <ExamModuleContextProvider>
      <EditModule />
    </ExamModuleContextProvider>,
    document.getElementById("edit-module-form")
  );
}
