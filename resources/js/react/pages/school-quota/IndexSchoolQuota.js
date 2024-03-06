import React from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import SchoolQuotaTable from "../../components/school-quota/SchoolQuotaTable";

const IndexSchoolQuota = () => {
  return (
    <Row>
      <Col sm="12">
        <SchoolQuotaTable />
      </Col>
    </Row>
  );
};

export default IndexSchoolQuota;

if (document.getElementById("index-school-quota-container")) {
  ReactDOM.render(
    <IndexSchoolQuota />,
    document.getElementById("index-school-quota-container")
  );
}
