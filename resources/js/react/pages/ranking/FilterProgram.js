import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import FilterProgramTable from "../../components/ranking-student/FilterTable";
const FilterProgram = () => {
  return (
    <Row>
      <Col sm="12">
        <FilterProgramTable />
      </Col>
    </Row>
  );
};
export default FilterProgram;
if (document.getElementById("container")) {
  ReactDOM.render(<FilterProgram />, document.getElementById("container"));
}