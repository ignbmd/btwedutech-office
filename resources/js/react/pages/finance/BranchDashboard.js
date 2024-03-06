import classNames from "classnames";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row, Button } from "reactstrap";
import Select from "react-select";
import {
  getBranchReceivable,
  getCentralPayDebtHistory,
} from "../../data/branch-credit-table";
import ContentLoader, { BulletList } from "react-content-loader";
import SpinnerCenter from "../../components/core/spinners/Spinner";
import WithdrawHistoryTable from "../../components/finance/WithdrawHistoryTable";
import { priceFormatter, getUserFromBlade } from "../../utility/Utils";
import axios from "axios";

const user = getUserFromBlade();
const { branch_code: branchCode } = user;

const BranchDashboard = () => {
  const [receivable, setReceivable] = useState();
  const [transferFunds, setTransferFunds] = useState();

  const getTransferFunds = async () => {
    try {
      const response = await axios.get("/api/finance/transfer-fund", {
        params: {
          branch_code: branchCode,
          show_branch_only: true,
        },
      });
      const data = response.data;
      return data?.data ?? null;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const setRows = async () => {
    const data = await getBranchReceivable();
    setReceivable(data);
    if (Object.keys(data).length > 0) {
      const historyData = await getTransferFunds();
      const formattedHistoryData = historyData.map((item) => ({
        ...item,
        payment_method: item.Contact?.bank_account_type,
      }));
      setTransferFunds(formattedHistoryData);
    } else {
      setTransferFunds([]);
    }
  };

  useEffect(() => {
    (async () => {
      if (transferFunds && receivable) return;
      setRows();
    })();
  }, []);

  return (
    <>
      <Row>
        <Col sm="12">
          <Card>
            <CardBody>
              <div>
                <h6>Total Piutang</h6>
                {receivable ? (
                  <>
                    <h1>{priceFormatter(receivable?.amount)}</h1>
                    <Button
                      color="primary"
                      className="mt-2"
                      onClick={() =>
                        (window.location.href = "/keuangan/tarik-dana")
                      }
                    >
                      Tarik Dana
                    </Button>
                  </>
                ) : (
                  <SpinnerCenter />
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col sm="12">
          <Card>
            <CardBody>
              <WithdrawHistoryTable histories={transferFunds} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default BranchDashboard;

if (document.getElementById("branch-dashboard-container")) {
  ReactDOM.render(
    <BranchDashboard />,
    document.getElementById("branch-dashboard-container")
  );
}
