import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditStakesForm from "../../components/health-check/CreateEditStakesForm";

const CreateStakes = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditStakesForm type="create" />
      </Col>
    </Row>
  );
};

export default CreateStakes;

if (document.getElementById("create-stakes-container")) {
  ReactDOM.render(<CreateStakes />, document.getElementById("create-stakes-container"));
}
