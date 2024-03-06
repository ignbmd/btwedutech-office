import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import WalletTable from "../../components/affiliate/WalletTable";

const IndexWallet = () => {
  return (
    <Row>
      <Col sm="12">
        <WalletTable />
      </Col>
    </Row>
  );
};

export default IndexWallet;

if (document.getElementById("container")) {
  ReactDOM.render(<IndexWallet />, document.getElementById("container"));
}
