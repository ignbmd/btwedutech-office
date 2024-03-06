import React from 'react'
import ReactDOM from "react-dom";
import { Col, Row } from 'reactstrap';

import PackageTable from '../../components/exam/package';

const IndexPackage = () => {
  return (
    <Row>
      <Col sm="12">
        <PackageTable />
      </Col>
    </Row>
  )
}

export default IndexPackage

if (document.getElementById("package-container")) {
  ReactDOM.render(<IndexPackage />, document.getElementById("package-container"));
}
