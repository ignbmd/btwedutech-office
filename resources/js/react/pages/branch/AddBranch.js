import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FormAddBranch from "../../components/branch/FormAddBranch/FormAddBranch";
import AddBranchContextProvider from "../../context/AddBranchContext";

const AddBranch = () => {
  return (
    <Row>
      <Col sm="12">
        <FormAddBranch />
      </Col>
    </Row>
  );
};

export default AddBranch;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <AddBranchContextProvider>
      <AddBranch />
    </AddBranchContextProvider>,
    document.getElementById("form-container")
  );
}
