import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import EditAffiliateForm from "../../components/affiliate/EditAffiliateForm";

const EditAffiliate = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <EditAffiliateForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EditAffiliate;

if (document.getElementById("form-container")) {
  ReactDOM.render(<EditAffiliate />, document.getElementById("form-container"));
}
