import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import StudentReportSamaptaTable from "../../components/samapta/StudentReportSamaptaTable";
const StudentReportSamapta = () => {
  return (
    <Row>
      <Col sm="12">
        <StudentReportSamaptaTable />
      </Col>
    </Row>
  );
};
export default StudentReportSamapta;
if (document.getElementById("container")) {
  ReactDOM.render(
    <StudentReportSamapta />,
    document.getElementById("container")
  );
}
