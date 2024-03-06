import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import LocationTable from "../../components/location/LocationTable";

const IndexLocation = () => {
  return (
    <Row>
      <Col sm="12">
        <LocationTable />
      </Col>
    </Row>
  );
};

export default IndexLocation;

if (document.getElementById("index-location-container")) {
  ReactDOM.render(
    <IndexLocation />,
    document.getElementById("index-location-container")
  );
}
