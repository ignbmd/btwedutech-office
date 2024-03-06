import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateEditTryoutPremiumForm from "../../components/exam/tryout-premium/CreateEditTryoutPremiumForm";

const CreateTryoutPremium = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateEditTryoutPremiumForm type="create" />
      </Col>
    </Row>
  );
};

export default CreateTryoutPremium;

if (document.getElementById("create-tryout-premium")) {
  ReactDOM.render(
    <CreateTryoutPremium />,
    document.getElementById("create-tryout-premium")
  );
}
