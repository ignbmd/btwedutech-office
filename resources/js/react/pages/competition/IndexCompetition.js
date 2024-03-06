import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";
import CompetitionTable from "../../components/competition/CompetitionTable";

const IndexCompetition = () => {
  return (
    <Row>
      <Col sm="12">
        <CompetitionTable />
      </Col>
    </Row>
  );
};

export default IndexCompetition;

if (document.getElementById("index-competition-container")) {
  ReactDOM.render(
    <IndexCompetition />,
    document.getElementById("index-competition-container")
  );
}
