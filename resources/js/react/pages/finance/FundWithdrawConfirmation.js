import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FundWithdrawConfirmationForm from "../../components/finance/FundWithdrawConfirmationForm";

const FundWithdrawConfirmation = () => {
  return (
    <Row>
      <Col sm="12">
        <FundWithdrawConfirmationForm />
      </Col>
    </Row>
  );
};

export default FundWithdrawConfirmation;

if (document.getElementById("fund-withdraw-confirmation-container")) {
  ReactDOM.render(
    <FundWithdrawConfirmation />,
    document.getElementById("fund-withdraw-confirmation-container")
  );
}
