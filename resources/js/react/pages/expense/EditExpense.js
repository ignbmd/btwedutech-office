import { useState } from "react";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";

import ExpenseForm from "../../components/expense/ExpenseForm/ExpenseForm";
import ExpenseContextProvider from "../../context/ExpenseContext";

const EditExpense = () => {
  const getExpenseId = () => {
    const dom = document.getElementById("expenseId");
    return JSON.parse(dom.innerText) ?? "";
  };

  return (
    <Row>
      <Col sm="12">
        <ExpenseForm expenseId={getExpenseId()} />
      </Col>
    </Row>
  );
};

export default EditExpense;

if (document.getElementById("form-container")) {
  ReactDOM.render(
    <ExpenseContextProvider>
      <EditExpense />
    </ExpenseContextProvider>,
    document.getElementById("form-container")
  );
}
