import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import SaleForm from "../../components/sale/SaleForm/SaleForm";

const Sale = () => {
  return (
    <Row>
      <Col sm="12">
        <SaleForm />
      </Col>
    </Row>
  );
};

export default Sale;

if (document.getElementById("form-container")) {
  ReactDOM.render(<Sale />, document.getElementById("form-container"));
}
