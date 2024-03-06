import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CentralOperationalItemTable from "../../components/central-operational-item/CentralOperationalItemTable";

const IndexCentralOperationalItem = () => {
  return (
    <Row>
      <Col sm="12">
        <CentralOperationalItemTable />
      </Col>
    </Row>
  );
};

export default IndexCentralOperationalItem;

if (document.getElementById("container")) {
  ReactDOM.render(
    <IndexCentralOperationalItem />,
    document.getElementById("container")
  );
}
