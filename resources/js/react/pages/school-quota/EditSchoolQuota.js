import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import EditSchoolQuotaForm from "../../components/school-quota/EditSchoolQuotaForm";

const EditSchoolQuota = () => {
  return (
    <Row>
      <Col sm="12">
        <EditSchoolQuotaForm />
      </Col>
    </Row>
  );
};

export default EditSchoolQuota;

if (document.getElementById("edit-school-quota-container")) {
  ReactDOM.render(
    <EditSchoolQuota />,
    document.getElementById("edit-school-quota-container")
  );
}
