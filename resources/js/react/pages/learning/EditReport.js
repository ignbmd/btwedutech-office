import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FormAddEditReport from "../../components/learning/report/FormAddEditReport";

const EditReport = () => {
  return (
    <Row>
      <Col sm="12">
        <FormAddEditReport type="edit" />
      </Col>
    </Row>
  );
};

export default EditReport;

if (document.getElementById("form-container")) {
  ReactDOM.render(<EditReport />, document.getElementById("form-container"));
}
