import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditStakesForm from "../../components/health-check/CreateEditStakesForm";

const EditStakes = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditStakesForm type="edit" />
      </Col>
    </Row>
  );
};

export default EditStakes;

if (document.getElementById("edit-stakes-container")) {
  ReactDOM.render(<EditStakes />, document.getElementById("edit-stakes-container"));
}
