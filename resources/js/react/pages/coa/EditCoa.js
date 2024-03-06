import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import FormEditCoa from './../../components/coa/FormEditCoa';

const EditCoa = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <FormEditCoa />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EditCoa;

if (document.getElementById("form-container")) {
  ReactDOM.render(
      <EditCoa />,
    document.getElementById("form-container")
  );
}
