import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateNewBillSection from "../../components/bill/CreateNewBillSection/CreateNewBillSection";

const CreateNewBill = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateNewBillSection />
      </Col>
    </Row>
  );
};

export default CreateNewBill;

if (document.getElementById("section-container")) {
  ReactDOM.render(<CreateNewBill />, document.getElementById("section-container"));
}
