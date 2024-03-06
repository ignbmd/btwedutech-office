import { useContext } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { StudentReportContext } from "../../../context/StudentReportContext";

const PTNStudentReportSummary = () => {
  const { studentResult } = useContext(StudentReportContext);
  return (
    <Row>
      <Col md="3">
        <Card>
          <CardBody>
            <div className="h4">UKA Diterima</div>
            <div className="h3">{studentResult?.summary?.received ?? "0"}</div>
          </CardBody>
        </Card>
      </Col>
      <Col md="3">
        <Card>
          <CardBody>
            <div className="h4">UKA Dikerjakan</div>
            <div className="h3">{studentResult?.summary?.completed ?? "0"}</div>
          </CardBody>
        </Card>
      </Col>
      <Col md="3">
        <Card>
          <CardBody>
            <div className="h4">Kepatuhan</div>
            <div className="h3">
              {studentResult?.summary?.completed_percentage
                ? `${studentResult?.summary?.completed_percentage}%`
                : "0%"}
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col md="3">
        <Card>
          <CardBody>
            <div className="h4">Kelulusan</div>
            <div className="h3">
              {studentResult?.summary?.passing_percentage
                ? `${studentResult?.summary?.passing_percentage}%`
                : "0%"}
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default PTNStudentReportSummary;
