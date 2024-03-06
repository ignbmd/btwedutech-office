import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ExpenseForm from "../../components/expense/ExpenseForm/ExpenseForm";
import ExpenseContextProvider from "../../context/ExpenseContext";

const CreateExpense = () => {
  return (
    <Row>
      <Col sm="12">
        <ExpenseForm />
      </Col>
    </Row>
  );
};

export default CreateExpense;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <ExpenseContextProvider>
      <CreateExpense />
    </ExpenseContextProvider>,
    document.getElementById("form-container")
  );
}
