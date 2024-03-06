import { Fragment, useContext } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { ClassroomReportContext } from "../../../context/ClassroomReportContext";
import ContentLoader from "react-content-loader";

const PTNClassroomReportSummary = () => {
  const {
    selectedClassroom,
    selectedUkaModule,
    selectedUkaType,
    classroomResults,
    isFetchingClassroomResults,
  } = useContext(ClassroomReportContext);
  return selectedClassroom &&
    selectedUkaModule &&
    selectedUkaType &&
    !isFetchingClassroomResults ? (
    <Fragment>
      <Row>
        <Col md="12">
          <div className="h2 mb-1">
            {selectedClassroom?.title} | {selectedUkaModule?.label}
          </div>
        </Col>
      </Row>
      <Row>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata PU</div>
              <div className="h3">{classroomResults?.average?.PU ?? "-"}</div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata PPU</div>
              <div className="h3">{classroomResults?.average?.PPU ?? "-"}</div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata PBM</div>
              <div className="h3">{classroomResults?.average?.PBM ?? "-"}</div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata PK</div>
              <div className="h3">{classroomResults?.average?.PK ?? "-"}</div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata LBIND</div>
              <div className="h3">
                {classroomResults?.average?.LBINDO ?? "-"}
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata LBING</div>
              <div className="h3">
                {classroomResults?.average?.LBING ?? "-"}
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata PM</div>
              <div className="h3">{classroomResults?.average?.PM ?? "-"}</div>
            </CardBody>
          </Card>
        </Col>
        <Col md="3">
          <Card>
            <CardBody>
              <div className="h4">Nilai rata - rata UTBK</div>
              <div className="h3">
                {classroomResults?.average?.total ?? "-"}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  ) : (
    <ContentLoader
      speed={2}
      width={400}
      height={160}
      viewBox="0 0 400 160"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <rect x="0" y="56" rx="3" ry="3" width="410" height="6" />
      <rect x="0" y="72" rx="3" ry="3" width="410" height="6" />
      <rect x="0" y="88" rx="3" ry="3" width="410" height="6" />
    </ContentLoader>
  );
};

export default PTNClassroomReportSummary;
