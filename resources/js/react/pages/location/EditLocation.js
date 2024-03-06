import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditLocationForm from "../../components/location/EditLocationForm";

const EditLocation = () => {
  return (
    <Row>
      <Col sm="12">
        <EditLocationForm />
      </Col>
    </Row>
  );
};

export default EditLocation;

if (document.getElementById("edit-location-container")) {
  ReactDOM.render(
    <EditLocation />,
    document.getElementById("edit-location-container")
  );
}
