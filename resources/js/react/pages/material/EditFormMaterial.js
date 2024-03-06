import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FormAddEditMaterial from "../../components/material/FormAddEditMaterial";

const EditFormMaterial = () => {
  return (
    <Row>
      <Col sm="12">
        <FormAddEditMaterial type="edit" />
      </Col>
    </Row>
  );
};

export default EditFormMaterial;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <EditFormMaterial />,
    document.getElementById("form-container")
  );
}
