import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import TryoutFreeTable from '../../components/exam/tryout-free';

const IndexTryoutFree = () => {
  return (
    <Row>
      <Col sm="12">
        <TryoutFreeTable />
      </Col>
    </Row>
  )
}

export default IndexTryoutFree

if (document.getElementById("tryout-free-container")) {
  ReactDOM.render(<IndexTryoutFree />, document.getElementById("tryout-free-container"));
}
