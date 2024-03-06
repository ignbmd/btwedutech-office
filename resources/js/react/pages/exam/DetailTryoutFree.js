import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import DetailTryoutFreeSection from '../../components/exam/tryout-free/DetailTryoutFreeSection';

const DetailTryoutFree = () => {
  return (
    <Row>
      <Col sm="12">
        <DetailTryoutFreeSection />
      </Col>
    </Row>
  )
}

export default DetailTryoutFree

if (document.getElementById("detail-tryout-free-container")) {
  ReactDOM.render(<DetailTryoutFree />, document.getElementById("detail-tryout-free-container"));
}
