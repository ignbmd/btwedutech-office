import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import DiscountCodeTable from "../../components/discount-code/DiscountCodeTable";

const IndexDiscountCode = () => {
  return (
    <Row>
      <Col sm="12">
        <DiscountCodeTable />
      </Col>
    </Row>
  );
};

export default IndexDiscountCode;

if (document.getElementById("container")) {
  ReactDOM.render(<IndexDiscountCode />, document.getElementById("container"));
}
