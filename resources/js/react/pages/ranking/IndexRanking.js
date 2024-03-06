import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import RankingTable from "../../components/ranking-student/RankingTable";
const IndexRanking = () => {
  return (
    <Row>
      <Col sm="12">
        <RankingTable />
      </Col>
    </Row>
  );
};
export default IndexRanking;
if (document.getElementById("container")) {
  ReactDOM.render(<IndexRanking />, document.getElementById("container"));
}