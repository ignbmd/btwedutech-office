import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import EditDiscountCodeForm from "../../components/discount-code/EditDiscountCodeForm";

const EditDiscountCode = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <EditDiscountCodeForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EditDiscountCode;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <EditDiscountCode />,
    document.getElementById("form-container")
  );
}
