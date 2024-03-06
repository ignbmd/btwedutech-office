import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import WithdrawTable from "../../../components/affiliate/withdraw/WithdrawTable";

const IndexWithdraw = () => {
  return (
    <Row>
      <Col sm="12">
        <WithdrawTable />
      </Col>
    </Row>
  );
};
export default IndexWithdraw;
if (document.getElementById("container")) {
  ReactDOM.render(<IndexWithdraw />, document.getElementById("container"));
}