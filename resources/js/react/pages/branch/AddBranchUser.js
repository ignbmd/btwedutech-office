import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import FormAddBranchUser from "../../components/branch/FormAddBranchUser/FormAddBranchUser";

const EditBranchUser = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <FormAddBranchUser />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EditBranchUser;

if (document.getElementById("form-container")) {
  ReactDOM.render(<EditBranchUser />, document.getElementById("form-container"));
}
