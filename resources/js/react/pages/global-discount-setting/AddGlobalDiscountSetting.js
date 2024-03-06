import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import AddGlobalDiscountSettingForm from "../../components/discount-affiliate-setting/AddGlobalDiscountSettingForm";

const AddGlobalDiscountSetting = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <AddGlobalDiscountSettingForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AddGlobalDiscountSetting;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <AddGlobalDiscountSetting />,
    document.getElementById("form-container")
  );
}
