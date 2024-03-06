import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import TaxPaymentTable from "../../../components/affiliate/tax-payment";
const TaxPayment = () => {
  return (
    <Row>
      <Col sm="12">
        <TaxPaymentTable />
      </Col>
    </Row>
  );
};
export default TaxPayment;
if (document.getElementById("container")) {
  ReactDOM.render(<TaxPayment />, document.getElementById("container"));
}
