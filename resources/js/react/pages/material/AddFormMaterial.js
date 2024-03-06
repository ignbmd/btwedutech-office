import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FormAddEditMaterial from "../../components/material/FormAddEditMaterial";

const AddFormMaterial = () => {
  return (
    <Row>
      <Col sm="12">
        <FormAddEditMaterial type="add" />
      </Col>
    </Row>
  );
};

export default AddFormMaterial;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <AddFormMaterial />,
    document.getElementById("form-container")
  );
}
