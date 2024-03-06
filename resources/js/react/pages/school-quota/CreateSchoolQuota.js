import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CreateSchoolQuotaForm from "../../components/school-quota/CreateSchoolQuotaForm";

const CreateSchoolQuota = () => {
  return (
    <Row>
      <Col sm="12">
        <CreateSchoolQuotaForm />
      </Col>
    </Row>
  );
};

export default CreateSchoolQuota;

if (document.getElementById("create-school-quota-container")) {
  ReactDOM.render(
    <CreateSchoolQuota />,
    document.getElementById("create-school-quota-container")
  );
}
