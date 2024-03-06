import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FundWithdrawForm from "../../components/finance/FundWithdrawForm";

const FundWithdraw = () => {
  return (
    <Row>
      <Col sm="12">
        <FundWithdrawForm />
      </Col>
    </Row>
  );
};

export default FundWithdraw;

if (document.getElementById("fund-withdraw-container")) {
  ReactDOM.render(
    <FundWithdraw />,
    document.getElementById("fund-withdraw-container")
  );
}
