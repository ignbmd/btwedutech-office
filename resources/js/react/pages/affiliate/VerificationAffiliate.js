import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import VerificationAffiliate from "../../components/affiliate/VerificationAccount";

const VerificationAffiliateIndex = () => {
  return (
    <Row>
      <Col sm="12">
        {/* <Card>
          <CardBody> */}
            <VerificationAffiliate />
          {/* </CardBody>
        </Card> */}
      </Col>
    </Row>
  );
};

export default VerificationAffiliateIndex;

if (document.getElementById("container")) {
  ReactDOM.render(<VerificationAffiliateIndex />, document.getElementById("container"));
}