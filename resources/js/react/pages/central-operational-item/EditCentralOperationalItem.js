import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import EditCentralOperationalItemForm from "../../components/central-operational-item/EditCentralOperationalItemForm";

const EditCentralOperationalItem = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <EditCentralOperationalItemForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EditCentralOperationalItem;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <EditCentralOperationalItem />,
    document.getElementById("form-container")
  );
}
