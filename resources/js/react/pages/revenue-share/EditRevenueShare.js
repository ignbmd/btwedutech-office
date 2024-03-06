import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import RevenueShareForm from "../../components/revenue-share/RevenueShareForm";

const EditRevenueShare = () => {
  const id = document.getElementById("branchEarningId")?.innerHTML;
  return (
    <Row>
      <Col sm="12">
        <RevenueShareForm id={id} />
      </Col>
    </Row>
  );
};

export default EditRevenueShare;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <EditRevenueShare />,
    document.getElementById("form-container")
  );
}
