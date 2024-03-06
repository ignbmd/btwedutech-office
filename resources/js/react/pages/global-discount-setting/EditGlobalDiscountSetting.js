import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import EditGlobalDiscountSettingForm from "../../components/discount-affiliate-setting/EditGlobalDiscountSettingForm";

const EditGlobalDiscountSetting = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <EditGlobalDiscountSettingForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EditGlobalDiscountSetting;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <EditGlobalDiscountSetting />,
    document.getElementById("form-container")
  );
}
