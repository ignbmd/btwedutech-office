import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateStudyMaterialDocumentForm from "../../components/exam/study-material-document/CreateStudyMaterialDocumentForm";

const CreateStudyMaterialDocument = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateStudyMaterialDocumentForm />
      </Col>
    </Row>
  );
};

export default CreateStudyMaterialDocument;

if (document.getElementById("create-study-material-document-container")) {
  ReactDOM.render(
    <CreateStudyMaterialDocument />,
    document.getElementById("create-study-material-document-container")
  );
}
