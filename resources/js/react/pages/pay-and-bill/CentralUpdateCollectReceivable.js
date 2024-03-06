import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import CentralUpdateCollectReceivableDetail from "../../components/pay-and-bill/CentralUpdateCollectReceivableDetail/CentralUpdateCollectReceivableDetail";

const CentralUpdateCollectReceivable = () => {
  return (
    <Row>
      <Col sm="12">
        <CentralUpdateCollectReceivableDetail />
      </Col>
    </Row>
  );
};

export default CentralUpdateCollectReceivable;

if (document.getElementById("central-update-collect-receivable-container")) {
  ReactDOM.render(
    <CentralUpdateCollectReceivable />,
    document.getElementById("central-update-collect-receivable-container")
  );
}
