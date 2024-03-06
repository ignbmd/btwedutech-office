import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import DiscountCodeUsageTable from "../../components/discount-code/DiscountCodeUsageTable";

const IndexDiscountCodeUsage = () => {
  return (
    <Row>
      <Col sm="12">
        <DiscountCodeUsageTable />
      </Col>
    </Row>
  );
};

export default IndexDiscountCodeUsage;

if (document.getElementById("container")) {
  ReactDOM.render(
    <IndexDiscountCodeUsage />,
    document.getElementById("container")
  );
}
