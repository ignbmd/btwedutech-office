import { useContext } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { StudentReportContext } from "../../../context/StudentReportContext";

const StudentPrePostTestReportSummary = () => {
  const { studentPrePostTestReportSummary } = useContext(StudentReportContext);
  return (
    <Row>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">Pre Test Dikerjakan</div>
            <div className="h3">
              {studentPrePostTestReportSummary?.count_pre_test}{" "}
              <span style={{ fontSize: "1rem" }} className="font-weight-bold">
                /dari {studentPrePostTestReportSummary?.total_pre_test}
              </span>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">Post Test Dikerjakan</div>
            <div className="h3">
              {studentPrePostTestReportSummary?.count_post_test}{" "}
              <span style={{ fontSize: "1rem" }} className="font-weight-bold">
                /dari {studentPrePostTestReportSummary?.total_post_test}
              </span>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">Kepatuhan Mengerjakan</div>
            <div className="h3">
              {typeof studentPrePostTestReportSummary?.percentage == "number"
                ? `${studentPrePostTestReportSummary?.percentage}%`
                : "-"}
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default StudentPrePostTestReportSummary;
