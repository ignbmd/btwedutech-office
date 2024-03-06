import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import TransactionHistoryTable from "../../components/affiliate/TransactionHistoryTable";

const IndexTransactionHistory = () => {
  return (
    <Row>
      <Col sm="12">
        <TransactionHistoryTable />
      </Col>
    </Row>
  );
};

export default IndexTransactionHistory;

if (document.getElementById("container")) {
  ReactDOM.render(
    <IndexTransactionHistory />,
    document.getElementById("container")
  );
}
