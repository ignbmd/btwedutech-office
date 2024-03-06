import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FundTransferForm from "../../components/finance/FundTransferForm";

const FundTransfer = () => {
  return (
    <Row>
      <Col sm="12">
        <FundTransferForm />
      </Col>
    </Row>
  );
};

export default FundTransfer;

if (document.getElementById("fund-transfer-container")) {
  ReactDOM.render(
    <FundTransfer />,
    document.getElementById("fund-transfer-container")
  );
}
