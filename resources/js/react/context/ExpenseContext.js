import { createContext, useState } from "react";
import { getBranches } from "../data/branch";
import { getAccountByBranchAndCategory } from "../data/finance-account";
import { getContactsByBranchCode, getContacts } from "../data/finance-contact";
import {
  getExpenseByBranchCode,
  getExpenseById,
  getExpenseCalculationByBranchCode,
} from "../data/finance-expense";

export const ExpenseContext = createContext({
  accountFromOption: [],
  loadAccountFromOption: async (branchCode) => {},

  accountToOption: [],
  loadAccountToOption: async (branchCode) => {},

  contactOption: [],
  loadContactOption: async () => {},
  loadContactOptionByBranchCode: async (branchCode = null) => {},

  expenses: [],
  loadExpensesByBranchCode: async (branchCode = null) => {},
  getFilteredExpenses: (key) => [],

  expenseCalculation: null,
  loadExpenseCalculationByBranchCode: async (branchCode = null) => {},

  branchOption: [],
  loadBranchOption: async () => {},

  editExpense: null,
  loadEditExpense: async (id) => {},
  clearEditExpense: () => {},

  selectedContactId: null,
  setSelectedContactId: (payload) => {},
});

const ExpenseContextProvider = (props) => {
  const [accountFromOption, setAccountFromOption] = useState([]);
  const [accountToOption, setAccountToOption] = useState([]);

  const [contactOption, setContactOption] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseCalculation, setExpenseCalculation] = useState(null);
  const [branchOption, setBranchOption] = useState([]);
  const [editExpense, setEditExpense] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);

  const loadContactOptionByBranchCode = async (branchCode = null) => {
    setContactOption(await getContactsByBranchCode(branchCode));
  };

  const loadAccountFromOption = async (branchCode) => {
    if (accountFromOption.length) return;
    setAccountFromOption(await getAccountByBranchAndCategory(branchCode, [1]));
  };

  const loadAccountToOption = async (branchCode) => {
    if (accountToOption.length) return;
    setAccountToOption(await getAccountByBranchAndCategory(branchCode, [5]));
  };

  const loadContactOption = async () => {
    setContactOption(await getContacts());
  };

  const loadExpensesByBranchCode = async (branchCode = null) => {
    setExpenses(await getExpenseByBranchCode(branchCode));
  };

  const getFilteredExpenses = (key = "") => {
    return expenses.filter((expense) => {
      const lowerKey = key.toLowerCase();

      const matchTitle = String(expense?.contact_name)
        .toLowerCase()
        .includes(lowerKey);

      const matchAmount = String(expense?.amount)
        .toLowerCase()
        .includes(lowerKey);

      const matchRefNumber = String(expense?.ref_number)
        .toLowerCase()
        .includes(lowerKey);

      const matchCreatedAt = moment(expense?.created_at)
        .format("DD-MM-YYYY")
        .includes(lowerKey);

      const anyMatch = [
        matchTitle,
        matchAmount,
        matchCreatedAt,
        matchRefNumber,
      ].some(Boolean);

      return anyMatch;
    });
  };

  const loadExpenseCalculationByBranchCode = async (branchCode) => {
    setExpenseCalculation(await getExpenseCalculationByBranchCode(branchCode));
  };

  const loadBranchOption = async () => {
    setBranchOption(await getBranches());
  };

  const loadEditExpense = async (id) => {
    setEditExpense(await getExpenseById(id));
  };

  const clearEditExpense = () => {
    setEditExpense(null);
  };

  return (
    <ExpenseContext.Provider
      value={{
        accountFromOption,
        loadAccountFromOption,

        accountToOption,
        loadAccountToOption,

        contactOption,
        loadContactOption,
        loadContactOptionByBranchCode,

        expenses,
        loadExpensesByBranchCode,
        getFilteredExpenses,

        expenseCalculation,
        loadExpenseCalculationByBranchCode,

        branchOption,
        loadBranchOption,

        editExpense,
        loadEditExpense,
        clearEditExpense,

        selectedContactId,
        setSelectedContactId,
      }}
    >
      {props.children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseContextProvider;
