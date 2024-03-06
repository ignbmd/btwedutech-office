import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ModulePreviewSection from "../../components/exam-cpns/module/ModulePreviewSection";

const ModulePreview = () => {
  return (
    <Row>
      <Col sm="12">
        <ModulePreviewSection />
      </Col>
    </Row>
  );
};

export default ModulePreview;

if (document.getElementById("module-preview-container")) {
  ReactDOM.render(
    <ModulePreview />,
    document.getElementById("module-preview-container")
  );
}
