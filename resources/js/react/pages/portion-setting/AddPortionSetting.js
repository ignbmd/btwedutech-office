import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import AddPortionSettingForm from "../../components/portion-setting/AddPortionSettingForm";

const AddPortionSetting = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <AddPortionSettingForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default AddPortionSetting;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <AddPortionSetting />,
    document.getElementById("form-container")
  );
}
