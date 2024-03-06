import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateStudyMaterialForm from "../../components/exam/study-material/CreateStudyMaterialForm";

const CreateStudyMaterial = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateStudyMaterialForm />
      </Col>
    </Row>
  );
};

export default CreateStudyMaterial;

if (document.getElementById("create-study-material-container")) {
  ReactDOM.render(
    <CreateStudyMaterial />,
    document.getElementById("create-study-material-container")
  );
}
