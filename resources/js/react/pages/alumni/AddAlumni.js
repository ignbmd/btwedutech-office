import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import FormAddAlumni from './../../components/alumni/FormAddAlumni';

const AddAlumni = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <FormAddAlumni />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AddAlumni;

if (document.getElementById("form-container")) {
  ReactDOM.render(
      <AddAlumni />,
    document.getElementById("form-container")
  );
}
