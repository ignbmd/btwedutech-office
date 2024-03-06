import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditFundWithdrawForm from "../../components/finance/EditFundWithdrawForm";

const EditFundWithdraw = () => {
  return (
    <Row>
      <Col sm="12">
        <EditFundWithdrawForm />
      </Col>
    </Row>
  );
};

export default EditFundWithdraw;

if (document.getElementById("edit-fund-withdraw-container")) {
  ReactDOM.render(
    <EditFundWithdraw />,
    document.getElementById("edit-fund-withdraw-container")
  );
}
