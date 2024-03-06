import axios from "axios";
import ReactDOM from "react-dom";
import { Col, Row } from "reactstrap";
import ContentLoader from "react-content-loader";
import React, { useEffect, useRef, useState } from "react";

import ExpenseContextProvider from "../../context/ExpenseContext";
import CentralDebtAndReceivableDetail from "../../components/pay-and-bill/CentralDebtAndReceivableDetail/CentralDebtAndReceivableDetail";
import CentralDebtAndReceivableHistory from "../../components/pay-and-bill/CentralDebtAndReceivableHistory/CentralDebtAndReceivableHistory";

import { getLastSegment } from "../../utility/Utils";
import { columns, data } from "../../data/central-pay-receivable-history";

const CentralCollectReceivable = () => {
  const [branch, setBranch] = useState();
  const [triggered, setTriggered] = useState(0);

  const branchCode = getLastSegment();
  const query = new URLSearchParams(window.location.search);
  const accountId = query.get("account_id");

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

  const handleTrigger = () => {
    setTriggered(current => current + 1);
  }

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
        {/* <CentralDebtAndReceivableDetail
          title={
            branch ? (
              `Piutang ke ${branch?.name}`
            ) : (
              <ContentLoader viewBox="0 0 400 25" className="w-100">
                <rect x="0" y="0" rx="5" ry="5" width="400" height="25" />
              </ContentLoader>
            )
          }
          type="bill"
          accountId={accountId}
          handleTrigger={handleTrigger}
          triggered={triggered}
        /> */}
        <CentralDebtAndReceivableHistory
          type="bill"
          columns={columns}
          data={data}
          accountId={accountId}
          triggered={triggered}
          branchName={branch?.name}
        />
      </Col>
    </Row>
  );
};

export default CentralCollectReceivable;

if (document.getElementById("central-collect-receivable-container")) {
  ReactDOM.render(
    <ExpenseContextProvider>
      <CentralCollectReceivable />
    </ExpenseContextProvider>,
    document.getElementById("central-collect-receivable-container")
  );
}
