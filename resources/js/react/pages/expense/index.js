import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ExpenseSection from "../../components/expense/index";
import ExpenseContextProvider from "../../context/ExpenseContext";

const Expense = () => {
  return (
    <Row>
      <Col sm="12">
        <ExpenseSection />
      </Col>
    </Row>
  );
};

export default Expense;

if (document.getElementById("expense")) {
  ReactDOM.render(
    <ExpenseContextProvider>
      <Expense />
    </ExpenseContextProvider>,
    document.getElementById("expense")
  );
}
