import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";
import FormEditBranch from "../../components/branch/FormEditBranch/FormEditBranch";

const EditBranch = () => {
  return (
    <Row>
      <Col sm="12">
        <Card>
          <CardBody>
            <FormEditBranch />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default EditBranch;

if (document.getElementById("form-container")) {
  ReactDOM.render(<EditBranch />, document.getElementById("form-container"));
}
