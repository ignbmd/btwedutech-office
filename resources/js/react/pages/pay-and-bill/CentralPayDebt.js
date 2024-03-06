import axios from "axios";
import { useRef } from "react";
import ReactDOM from "react-dom";
import { useEffect } from "react";
import { Col, Row } from "reactstrap";
import React, { useState } from "react";
import ContentLoader from "react-content-loader";

import ExpenseContextProvider from "../../context/ExpenseContext";
import { columns, data } from "../../data/central-pay-debt-history";
import CentralDebtAndReceivableDetail from "../../components/pay-and-bill/CentralDebtAndReceivableDetail/CentralDebtAndReceivableDetail";
import CentralDebtAndReceivableHistory from "../../components/pay-and-bill/CentralDebtAndReceivableHistory/CentralDebtAndReceivableHistory";
import { getLastSegment } from "../../utility/Utils";


const CentralPayDebt = () => {
  const [branch, setBranch] = useState();
  const [triggered, setTriggered] = useState(0);

  const branchCode = getLastSegment();
  const query = new URLSearchParams(window.location.search);
  const accountId = query.get("account_id");

  const handleTrigger = () => {
    setTriggered((current) => current + 1);
  };

  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const fetchBranch = async () => {
    try {
      const res = await axios.get(`/api/branch/${branchCode}`, {
        cancelToken: source.token,
      });
      const data = res.data?.data ?? null;
      if (!isCanceled.current) {
        setBranch(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchBranch();

    return () => {
      isCanceled.current = true;
      source.cancel();
    };
  }, []);

  return (
    <Row>
      <Col sm="12">
        <CentralDebtAndReceivableDetail
          title={
            branch ? (
              `Piutang ke ${branch?.name}`
            ) : (
              <ContentLoader viewBox="0 0 400 25" className="w-100">
                <rect x="0" y="0" rx="5" ry="5" width="400" height="25" />
              </ContentLoader>
            )
          }
          type="pay"
          accountId={accountId}
          handleTrigger={handleTrigger}
          triggered={triggered}
        />
        <CentralDebtAndReceivableHistory
          type="pay"
          columns={columns}
          data={data}
          accountId={accountId}
          triggered={triggered}
        />
      </Col>
    </Row>
  );
};

export default CentralPayDebt;

if (document.getElementById("central-pay-debt-container")) {
  ReactDOM.render(
    <ExpenseContextProvider>
      <CentralPayDebt />
    </ExpenseContextProvider>,
    document.getElementById("central-pay-debt-container")
  );
}
