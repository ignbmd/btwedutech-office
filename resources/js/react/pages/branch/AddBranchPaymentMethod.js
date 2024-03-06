import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FormAddBranchPaymentMethod from "../../components/branch/FormAddBranchPaymentMethod/FormAddBranchPaymentMethod";

const AddBranchPaymentMethod = () => {
  return (
    <Row>
      <Col sm="12">
        <FormAddBranchPaymentMethod />
      </Col>
    </Row>
  );
};

export default AddBranchPaymentMethod;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <AddBranchPaymentMethod />,
    document.getElementById("form-container")
  );
}
