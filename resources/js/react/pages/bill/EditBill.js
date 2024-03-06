import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditBillForm from "../../components/bill/EditBill/EditBillForm";

const EditBill = () => {
  return (
    <Row>
      <Col sm="12">
        <EditBillForm />
      </Col>
    </Row>
  );
};

export default EditBill;

if (document.getElementById("form-container")) {
  ReactDOM.render(<EditBill />, document.getElementById("form-container"));
}
