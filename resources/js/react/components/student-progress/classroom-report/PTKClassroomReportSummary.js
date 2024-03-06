import { Fragment, useContext } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { ClassroomReportContext } from "../../../context/ClassroomReportContext";

const PTKClassroomReportSummary = () => {
  const { selectedClassroom, selectedUkaModule, classroomResults } = useContext(
    ClassroomReportContext
  );
  return (
    <Fragment>
      <Row>
        <Col md="12">
          <div className="h2 mb-1">
            {selectedClassroom?.title} | {selectedUkaModule?.label}
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata TWK</div>
              <div className="h3">{classroomResults?.average?.twk ?? "-"}</div>
            </CardBody>
          </Card>
        </Col>
        <Col>
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata TIU</div>
              <div className="h3">{classroomResults?.average?.tiu ?? "-"}</div>
            </CardBody>
          </Card>
        </Col>
        <Col>
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata TKP</div>
              <div className="h3">{classroomResults?.average?.tkp ?? "-"}</div>
            </CardBody>
          </Card>
        </Col>
        <Col>
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata SKD</div>
              <div className="h3">
                {classroomResults?.average?.total ?? "-"}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default PTKClassroomReportSummary;
