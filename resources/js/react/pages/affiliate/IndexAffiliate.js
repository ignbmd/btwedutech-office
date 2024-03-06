import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import AffiliateTable from "../../components/affiliate/AffiliateTable";

const IndexAffiliate = () => {
  return (
    <Row>
      <Col sm="12">
        <AffiliateTable />
      </Col>
    </Row>
  );
};

export default IndexAffiliate;

if (document.getElementById("container")) {
  ReactDOM.render(<IndexAffiliate />, document.getElementById("container"));
}
