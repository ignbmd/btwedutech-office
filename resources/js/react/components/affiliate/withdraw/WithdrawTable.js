import React, { useEffect, useState } from "react";
import { Card, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import { getPendingWithdraws } from "../../../data/pending-withdraw-table";
import { getRejectedWithdraws } from "../../../data/rejected-withdraw-table";
import { getApprovedWithdraws } from "../../../data/approved-withdraw-table";
import PendingWithdrawTable from "./PendingWithdrawTable";
import ApprovedWithdrawTable from "./ApprovedWithdrawTable";
import RejectedWithdrawTable from "./RejectedWithdrawTable";

const WithdrawTable = () => {
  const [pendingWithdraws, setPendingWithdraws] = useState();
  const [approvedWithdraws, setApprovedWithdraws] = useState();
  const [rejectedWithdraws, setRejectedWithdraws] = useState();
  const [activeTab, setActiveTab] = useState("PENDING");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const setRows = async (type) => {
    let updatedRows = [];
    if (type === "SUCCESS") {
      updatedRows = await getApprovedWithdraws();
      setApprovedWithdraws(updatedRows);
    } else if (type === "REJECTED") {
      updatedRows = await getRejectedWithdraws();
      setRejectedWithdraws(updatedRows);
    } else {
      updatedRows = await getPendingWithdraws();
      setPendingWithdraws(updatedRows);
    }
  };

  useEffect(() => {
    (async () => {
      if (pendingWithdraws && approvedWithdraws && rejectedWithdraws) return;
      setRows(activeTab);
    })();
  }, [activeTab]);

  return (
    <Card>
      <Nav tabs className="mb-0">
        <NavItem>
          <NavLink
            className="py-2"
            active={activeTab === "PENDING"}
            onClick={() => {
              toggleTab("PENDING");
            }}
          >
            <span className="align-middle">Pending</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className="py-2"
            active={activeTab === "SUCCESS"}
            onClick={() => {
              toggleTab("SUCCESS");
            }}
          >
            <span className="align-middle">Diproses</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className="py-2"
            active={activeTab === "REJECTED"}
            onClick={() => {
              toggleTab("REJECTED");
            }}
          >
            <span className="align-middle">Ditolak</span>
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className="pb-50" activeTab={activeTab}>
        <TabPane tabId="PENDING">
          <PendingWithdrawTable data={pendingWithdraws} />
        </TabPane>
        <TabPane tabId="SUCCESS">
          <ApprovedWithdrawTable data={approvedWithdraws} />
        </TabPane>
        <TabPane tabId="REJECTED">
          <RejectedWithdrawTable data={rejectedWithdraws} />
        </TabPane>
      </TabContent>
    </Card>
  );
};

export default WithdrawTable;
