import { useContext } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { StudentReportContext } from "../../../context/StudentReportContext";

const studentPresenceSummarySummary = () => {
  const { studentPresenceSummary } = useContext(StudentReportContext);
  return (
    <Row>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">Total Pertemuan</div>
            <div className="h3">
              {studentPresenceSummary?.schedule_count ?? "-"}
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">Total Kehadiran</div>
            <div className="h3">
              {studentPresenceSummary?.attend_count ?? "-"}
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">Total Tidak Hadir</div>
            <div className="h3">
              {studentPresenceSummary?.absent_count ?? "-"}
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col>
        <Card>
          <CardBody>
            <div className="h4">Persentase Kehadiran</div>
            <div className="h3">
              {studentPresenceSummary?.schedule_count
                ? `${studentPresenceSummary?.attend_percentage}%`
                : "-"}
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default studentPresenceSummarySummary;
