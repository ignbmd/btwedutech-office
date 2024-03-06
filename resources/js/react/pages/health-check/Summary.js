import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import SummarySection from "../../components/health-check/SummarySection";

const Summary = () => {
  return <SummarySection />;
};

export default Summary;

if (document.getElementById("medical-checkup-summary-container")) {
  ReactDOM.render(
    <Summary />,
    document.getElementById("medical-checkup-summary-container")
  );
}
