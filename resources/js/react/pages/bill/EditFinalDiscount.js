import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row } from "reactstrap";

import FormEditFinalDiscount from './../../components/bill/EditFinalDiscount/FormEditFinalDiscount';

const EditFinalDiscount = () => {
  return (
    <Row>
      <Col sm="12">
        <FormEditFinalDiscount />
      </Col>
    </Row>
  );
};

export default EditFinalDiscount;

if (document.getElementById("form-container")) {
  ReactDOM.render(
      <EditFinalDiscount />,
    document.getElementById("form-container")
  );
}
