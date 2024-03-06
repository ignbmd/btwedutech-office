import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import RevenueShareForm from "../../components/revenue-share/RevenueShareForm";

const AddRevenueShare = () => {
  return (
    <Row>
      <Col sm="12">
        <RevenueShareForm />
      </Col>
    </Row>
  );
};

export default AddRevenueShare;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <AddRevenueShare />,
    document.getElementById("form-container")
  );
}
