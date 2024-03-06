import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import EditPortionSettingForm from "../../components/portion-setting/EditPortionSettingForm";

const EditPortionSetting = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <EditPortionSettingForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EditPortionSetting;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <EditPortionSetting />,
    document.getElementById("form-container")
  );
}
