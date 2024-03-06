import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import SaleForm from "../../components/sale-siplah/SaleForm/SaleForm";

const SaleSiplah = () => {
  return (
    <Row>
      <Col sm="12">
        <SaleForm />
      </Col>
    </Row>
  );
};

export default SaleSiplah;

if (document.getElementById("form-container")) {
  ReactDOM.render(<SaleSiplah />, document.getElementById("form-container"));
}
