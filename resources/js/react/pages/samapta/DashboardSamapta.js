import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import DashboardSamaptaTable from "../../components/samapta/DashboardSamapta";
import SamaptaProvider from "../../context/SamaptaContext";

const DashboardSamapta = () => {
  return (
    <Row>
      <Col sm="12">
        <DashboardSamaptaTable />
      </Col>
    </Row>
  );
};
export default DashboardSamapta;
if (document.getElementById("container")) {
  ReactDOM.render(
    <SamaptaProvider>
      <DashboardSamapta />
    </SamaptaProvider>,
    document.getElementById("container")
  );
}
