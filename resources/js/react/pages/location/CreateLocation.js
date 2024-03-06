import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateLocationForm from "../../components/location/CreateLocationForm";

const CreateLocation = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateLocationForm />
      </Col>
    </Row>
  );
};

export default CreateLocation;

if (document.getElementById("create-location-container")) {
  ReactDOM.render(
    <CreateLocation />,
    document.getElementById("create-location-container")
  );
}
