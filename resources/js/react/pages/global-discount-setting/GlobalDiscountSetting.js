import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import GlobalDiscountSettingTable from "../../components/discount-affiliate-setting/GlobalDiscountSettingTable";

const GlobalDiscountSetting = () => {
  return (
    <Row>
      <Col sm="12">
        <GlobalDiscountSettingTable />
      </Col>
    </Row>
  );
};

export default GlobalDiscountSetting;

if (document.getElementById("container")) {
  ReactDOM.render(
    <GlobalDiscountSetting />,
    document.getElementById("container")
  );
}
