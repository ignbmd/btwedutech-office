import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FormAddReport from "../../components/learning/report/FormAddEditReport";

const AddEditReport = () => {
  return (
    <Row>
      <Col sm="12">
        <FormAddReport />
      </Col>
    </Row>
  );
};

export default AddEditReport;

if (document.getElementById("form-container")) {
  ReactDOM.render(<AddEditReport />, document.getElementById("form-container"));
}
