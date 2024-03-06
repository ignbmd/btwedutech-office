import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ListClassSamaptaTable from "../../components/samapta/ListClassSamapta";
import SamaptaProvider from "../../context/SamaptaContext";
const ListClassSamapta = () => {
  return (
    <Row>
      <Col sm="12">
        <ListClassSamaptaTable />
      </Col>
    </Row>
  );
};
export default ListClassSamapta;
if (document.getElementById("container")) {
  ReactDOM.render(
    <SamaptaProvider>
      <ListClassSamapta />
    </SamaptaProvider>,
    document.getElementById("container")
  );
}
