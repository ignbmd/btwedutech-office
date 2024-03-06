import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import StudentListTable from "../../components/samapta/StudentListSamapta";
const StudentListSamapta = () => {
  return (
    <Row>
      <Col sm="12">
        <StudentListTable />
      </Col>
    </Row>
  );
};
export default StudentListSamapta;
if (document.getElementById("container")) {
  ReactDOM.render(<StudentListSamapta />, document.getElementById("container"));
}
