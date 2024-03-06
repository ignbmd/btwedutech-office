import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import FormEditTransactionHistory from './../../components/transaction-history/FormEditTransactionHistory';

const EditTransactionHistory = () => {
  return (
    <Row>
      <Col sm="12">
        <FormEditTransactionHistory />
      </Col>
    </Row>
  );
};

export default EditTransactionHistory;

if (document.getElementById("form-container")) {
  ReactDOM.render(
      <EditTransactionHistory />,
    document.getElementById("form-container")
  );
}
