import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import AddCentralOperationalItemForm from "../../components/central-operational-item/AddCentralOperationalItemForm";

const AddCentralOperationalItem = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <AddCentralOperationalItemForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AddCentralOperationalItem;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <AddCentralOperationalItem />,
    document.getElementById("form-container")
  );
}
