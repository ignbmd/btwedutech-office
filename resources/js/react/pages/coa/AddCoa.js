import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import FormAddCoa from './../../components/coa/FormAddCoa';

const AddCoa = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <FormAddCoa />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AddCoa;

if (document.getElementById("form-container")) {
  ReactDOM.render(
      <AddCoa />,
    document.getElementById("form-container")
  );
}
