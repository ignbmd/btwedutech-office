import React, { useState, useEffect } from "react";
import { PlusSquare, MinusSquare } from "react-feather";
import { Nav, Card, TabPane, NavItem, NavLink, TabContent } from "reactstrap";

import { getCentralDebts } from "../../data/central-debt-table";
import { getCentralReceivables } from "../../data/central-receivable-table";

import CentralDebt from "./CentralDebt";
import CentralReceivables from "./CentralReceivables";

const DebtAndCredit = () => {
  const [debts, setDebts] = useState();
  const [receivables, setReceivables] = useState();
  const [tabActive, setTabActive] = useState("DEBT");

  const toggle = (tab) => {
    if (tabActive !== tab) {
      setTabActive(tab);
    }
  };

  const handleFetchBranch = async () => {
    try {
      const response = await fetch(`/api/branch/all`);
      const data = await response.json();
      return data?.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const updateRowsWithBranchName = async (callback) => {
    const branches = await handleFetchBranch();
    callback((currentRows) => {
      const newRows = currentRows.map((row) => {
        const updatedRow = {
          ...row,
          branch_name:
            branches.find((branch) => row.branch_code == branch.code)?.name ??
            "-",
        };
        return updatedRow;
      });

      return [...newRows];
    });
  };

  const setRows = async (type) => {
    let updatedRows = [];
    if (type === "DEBT") {
      updatedRows = await getCentralDebts();
      setDebts(updatedRows);
      updateRowsWithBranchName(setDebts);
    } else {
      updatedRows = await getCentralReceivables();
      setReceivables(updatedRows);
      updateRowsWithBranchName(setReceivables);
    }
  };

  useEffect(() => {
    (async () => {
      if (debts && receivables) return;
      setRows(tabActive);
    })();
  }, [tabActive]);

  return (
    <Card>
      <Nav tabs className="mb-0">
        <NavItem>
          <NavLink
            className="py-2"
            active={tabActive === "DEBT"}
            onClick={() => {
              toggle("DEBT");
            }}
          >
            <MinusSquare size={14} />
            <span className="align-middle">Daftar Hutang</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className="py-2"
            active={tabActive === "RECEIVABLE"}
            onClick={() => {
              toggle("RECEIVABLE");
            }}
          >
            <PlusSquare size={14} />
            <span className="align-middle">Daftar Piutang</span>
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className="pb-50" activeTab={tabActive}>
        <TabPane tabId="DEBT">
          <CentralDebt debts={debts} />
        </TabPane>
        <TabPane tabId="RECEIVABLE">
          <CentralReceivables receivables={receivables} />
        </TabPane>
      </TabContent>
    </Card>
  );
};

export default DebtAndCredit;
