import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ParticipantListTable from "../../components/psikotest/participant/index";
import UploadParticipantModal from "../../components/psikotest/participant/upload-participant-modal";
import ParticipantProvider from "../../context/PsikotestParticipantContex";

const ParticipantList = () => {
  return (
    <Row>
      <Col md="12">
        <ParticipantListTable />
      </Col>
    </Row>
  );
};

export default ParticipantList;

if (document.getElementById("participant-list-container")) {
  ReactDOM.render(
    <ParticipantProvider>
      <ParticipantList />
    </ParticipantProvider>,
    document.getElementById("participant-list-container")
  );
}
