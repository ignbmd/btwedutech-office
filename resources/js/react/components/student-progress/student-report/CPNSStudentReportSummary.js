import { useContext } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { StudentReportContext } from "../../../context/StudentReportContext";

const CPNSStudentReportSummary = () => {
  const { studentResult } = useContext(StudentReportContext);
  return (
    <Row>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">UKA Diterima</div>
            <div className="h3">{studentResult?.summary?.received ?? "-"}</div>
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">UKA Dikerjakan</div>
            <div className="h3">{studentResult?.summary?.completed ?? "-"}</div>
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">Lolos UKA</div>
            <div className="h3">{studentResult?.summary?.passed ?? "-"}</div>
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">Kepatuhan</div>
            <div className="h3">
              {studentResult?.summary?.completed_percentage
                ? `${studentResult?.summary?.completed_percentage}%`
                : "-"}
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">Kelulusan</div>
            <div className="h3">
              {studentResult?.summary?.passing_percentage
                ? `${studentResult?.summary?.passing_percentage}%`
                : "-"}
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default CPNSStudentReportSummary;
