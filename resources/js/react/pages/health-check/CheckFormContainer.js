import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CheckForm from "../../components/health-check/CheckForm";

const CheckFormContainer = () => {
  return (
    <Row>
      <Col sm="12">
        <CheckForm />
      </Col>
    </Row>
  );
};

export default CheckFormContainer;

if (document.getElementById("check-form-container")) {
  ReactDOM.render(<CheckFormContainer />, document.getElementById("check-form-container"));
}
