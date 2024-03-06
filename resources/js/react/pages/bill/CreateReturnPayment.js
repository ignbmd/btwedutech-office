import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateReturnPaymentForm from "../../components/bill/CreateReturnPaymentForm/CreateReturnPaymentForm";

const CreateReturnPayment = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateReturnPaymentForm />
      </Col>
    </Row>
  );
};

export default CreateReturnPayment;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <CreateReturnPayment />,
    document.getElementById("form-container")
  );
}
