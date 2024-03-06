import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import AffiliateDashboard from "../../components/affiliate/AffiliateDashboard";
const AffiliateDashboards = () => {
  return (
    <Row>
      <Col sm="12">
        <AffiliateDashboard />
      </Col>
    </Row>
  );
};
export default AffiliateDashboards;
if (document.getElementById("container")) {
  ReactDOM.render(
    <AffiliateDashboards />,
    document.getElementById("container")
  );
}
