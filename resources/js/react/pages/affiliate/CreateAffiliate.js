import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import CreateAffiliateForm from "../../components/affiliate/CreateAffiliateForm";

const CreateAffiliate = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <CreateAffiliateForm />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateAffiliate;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <CreateAffiliate />,
    document.getElementById("form-container")
  );
}
