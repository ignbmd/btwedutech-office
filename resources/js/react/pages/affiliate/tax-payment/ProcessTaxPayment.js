import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ProcessTaxPayment from "../../../components/affiliate/tax-payment/ProcessTaxPayment";
const ProcessTaxPaymentForm = () => {
  return (
    <Row>
      <Col sm="12">
        <ProcessTaxPayment />
      </Col>
    </Row>
  );
};
export default ProcessTaxPaymentForm;
if (document.getElementById("container")) {
  ReactDOM.render(<ProcessTaxPaymentForm />, document.getElementById("container"));
}