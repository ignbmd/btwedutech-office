import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import SaleForm from "../../components/sale-assessment/SaleForm/SaleForm";

const SaleAssessment = () => {
  return (
    <Row>
      <Col sm="12">
        <SaleForm />
      </Col>
    </Row>
  );
};

export default SaleAssessment;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <SaleAssessment />,
    document.getElementById("form-container")
  );
}
