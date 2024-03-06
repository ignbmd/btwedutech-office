import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import DetailLocationTable from "../../components/location/DetailLocationTable";

const DetailLocation = () => {
  return (
    <Row>
      <Col sm="12">
        <DetailLocationTable />
      </Col>
    </Row>
  );
};

export default DetailLocation;

if (document.getElementById("detail-location-container")) {
  ReactDOM.render(
    <DetailLocation />,
    document.getElementById("detail-location-container")
  );
}
