import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import PortionSettingTable from "../../components/portion-setting/PortionSettingTable";

const IndexPortionSetting = () => {
  return (
    <Row>
      <Col sm="12">
        <PortionSettingTable />
      </Col>
    </Row>
  );
};

export default IndexPortionSetting;

if (document.getElementById("container")) {
  ReactDOM.render(<IndexPortionSetting />, document.getElementById("container"));
}
