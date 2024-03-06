import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ConfirmWithdraw from "../../../components/affiliate/withdraw/ConfirmForm";
const ProsesWithdraw = () => {
  return (
    <Row>
      <Col sm="12">
        <ConfirmWithdraw />
      </Col>
    </Row>
  );
};
export default ProsesWithdraw;
if (document.getElementById("container")) {
  ReactDOM.render(<ProsesWithdraw />, document.getElementById("container"));
}