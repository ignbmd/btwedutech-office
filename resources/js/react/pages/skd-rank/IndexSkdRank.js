import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";
import IndexSkdRankForm from "../../components/skd-rank/IndexSkdRankForm";

const IndexSkdRank = () => {
  return (
    <Row>
      <Col sm="12">
        <IndexSkdRankForm />
      </Col>
    </Row>
  );
};

export default IndexSkdRank;

if (document.getElementById("index-skd-rank-container")) {
  ReactDOM.render(
    <IndexSkdRank />,
    document.getElementById("index-skd-rank-container")
  );
}
