import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import FormEditAlumni from '../../components/alumni/FormEditAlumni';

const EditAlumni = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <FormEditAlumni />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EditAlumni;

if (document.getElementById("form-container")) {
  ReactDOM.render(
      <EditAlumni />,
    document.getElementById("form-container")
  );
}
