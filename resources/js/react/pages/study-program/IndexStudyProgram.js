import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";
import StudyProgramTable from "../../components/study-program/StudyProgramTable";

const IndexStudyProgram = () => {
  return (
    <Row>
      <Col sm="12">
        <StudyProgramTable />
      </Col>
    </Row>
  );
};

export default IndexStudyProgram;

if (document.getElementById("index-study-program-container")) {
  ReactDOM.render(
    <IndexStudyProgram />,
    document.getElementById("index-study-program-container")
  );
}
