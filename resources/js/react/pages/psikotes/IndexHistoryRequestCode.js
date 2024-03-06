import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import HistoryRequestCodeTable from "../../components/psikotest/history-request-code";
import InterestAndTalentSchoolContextProvider from "../../context/InterestAndTalentSchoolContext";

const HistoryRequestCode = () => {
  return (
    <Row>
      <Col md="12">
        <HistoryRequestCodeTable />
      </Col>
    </Row>
  );
};

export default HistoryRequestCode;

if (document.getElementById("history-request-code")) {
  ReactDOM.render(
    <InterestAndTalentSchoolContextProvider>
      <HistoryRequestCode />
    </InterestAndTalentSchoolContextProvider>,
    document.getElementById("history-request-code")
  );
}
