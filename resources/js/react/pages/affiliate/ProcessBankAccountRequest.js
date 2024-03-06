import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import ProcessBankAccountRequestForm from "../../components/affiliate/ProcessBankAccountRequestForm";

const ProcessBankAccountRequest = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <ProcessBankAccountRequestForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ProcessBankAccountRequest;

if (document.getElementById("container")) {
  ReactDOM.render(
    <ProcessBankAccountRequest />,
    document.getElementById("container")
  );
}
