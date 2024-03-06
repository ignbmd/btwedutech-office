import React, { useEffect, useState } from "react";
import { Card, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import {
  getPendingTaxPayment,
  getProcessedTaxPayment,
} from "../../../data/tax-payment-table";
import PendingTaxPaymentTable from "./PendingTaxPaymentTable";
import ProcessedTaxPaymentTable from "./ProcessedTaxPaymentTable";

const TaxPaymentTable = () => {
  const [pendingTaxPayments, setPendingTaxPayments] = useState();
  const [processedTaxPayments, setProcessedTaxPayments] = useState();
  const [activeTab, setActiveTab] = useState("PENDING");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const setRows = async (type) => {
    let updatedRows = [];
    if (type === "COMPLETE") {
      updatedRows = await getProcessedTaxPayment();
      setProcessedTaxPayments(updatedRows);
    } else {
      updatedRows = await getPendingTaxPayment();
      setPendingTaxPayments(updatedRows);
    }
  };

  useEffect(() => {
    (async () => {
      if (pendingTaxPayments && processedTaxPayments) return;
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
            active={activeTab === "COMPLETE"}
            onClick={() => {
              toggleTab("COMPLETE");
            }}
          >
            <span className="align-middle">Diproses</span>
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className="pb-50" activeTab={activeTab}>
        <TabPane tabId="PENDING">
          <PendingTaxPaymentTable data={pendingTaxPayments} />
        </TabPane>
        <TabPane tabId="COMPLETE">
          <ProcessedTaxPaymentTable data={processedTaxPayments} />
        </TabPane>
      </TabContent>
    </Card>
  );
};

export default TaxPaymentTable;
