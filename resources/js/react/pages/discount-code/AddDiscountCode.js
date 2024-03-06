import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import AddDiscountCodeForm from "../../components/discount-code/AddDiscountCodeForm";

const AddDiscountCode = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <AddDiscountCodeForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AddDiscountCode;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <AddDiscountCode />,
    document.getElementById("form-container")
  );
}
