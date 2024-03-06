import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FormAddSchedule from "../../components/learning/schedule/FormAddSchedule";

const AddSchedule = () => {
  return (
    <Row>
      <Col sm="12">
          <FormAddSchedule />
      </Col>
    </Row>
  )
};

export default AddSchedule;

if (document.getElementById("form-container")) {
  ReactDOM.render(<AddSchedule />, document.getElementById("form-container"));
}
