import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import BankAccountRequestTable from "../../components/affiliate/BankAccountRequestTable";

const IndexBankAccountRequest = () => {
  return (
    <Row>
      <Col sm="12">
        <BankAccountRequestTable />
      </Col>
    </Row>
  );
};

export default IndexBankAccountRequest;

if (document.getElementById("container")) {
  ReactDOM.render(
    <IndexBankAccountRequest />,
    document.getElementById("container")
  );
}
