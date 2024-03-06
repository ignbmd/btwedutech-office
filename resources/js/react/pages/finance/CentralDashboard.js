import classNames from "classnames";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Card, CardBody, Col, Row, Button, Spinner } from "reactstrap";
import Select from "react-select";
import FundBillingHistoryTable from "../../components/finance/FundBillingHistoryTable";
import CentralLoanTable from "../../components/finance/CentralLoanTable";
import { getCentralDebts } from "../../data/central-debt-table";
import { priceFormatter } from "../../utility/Utils";
import "./central-dashboard.css";

const paymentGatewayAccountCodes = [
  {
    label: (
      <span>
        <img
          src="https://btw-cdn.com/assets/payment/logo/midtrans.webp"
          width={100}
        />
      </span>
    ),
    value: 10009,
  },
  {
    label: (
      <span>
        <img
          src="https://btw-cdn.com/assets/payment/logo/duitku.webp"
          width={100}
        />
      </span>
    ),
    value: 10005,
  },
];

const CentralDashboard = () => {
  const [paymentGatewayAccountCode, setPaymentGatewayAccountCode] = useState(
    paymentGatewayAccountCodes[0]
  );
  const [transferFunds, setTransferFunds] = useState();
  const [debts, setDebts] = useState();
  const [paymentGatewayAmount, setPaymentGatewayAmount] = useState(null);
  const [BCAAmount, setBCAAmount] = useState(null);
  const [BRIAmount, setBRIAmount] = useState(null);
  const [BNIAmount, setBNIAmount] = useState(null);

  const handlePaymentGatewayAccountCodeSelect = (e) => {
    setPaymentGatewayAccountCode(e);
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

  const getTransferFunds = async () => {
    try {
      const response = await axios.get("/api/finance/transfer-fund", {
        params: {
          branch_code: "PT0000",
        },
      });
      const data = response.data;
      return data?.data ?? null;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const getAccountTotalAmount = async (account_code) => {
    try {
      const response = await axios.get(
        `/api/finance/journal-records/calculate-amount`,
        { params: { account_code: account_code } }
      );
      const data = response.data;
      return data?.data ?? null;
    } catch (error) {
      console.error(error);
      return null;
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

  const setRows = async () => {
    let updatedRows = [];
    let updatedTransferFunds = [];
    updatedRows = await getCentralDebts();
    updatedTransferFunds = await getTransferFunds();
    setTransferFunds(updatedTransferFunds);
    setDebts(updatedRows);
    updateRowsWithBranchName(setDebts);
    updateRowsWithBranchName(setTransferFunds);
  };

  useEffect(() => {
    (async () => {
      setRows();
      setPaymentGatewayAmount(
        await getAccountTotalAmount(paymentGatewayAccountCode?.value)
      );
      setBCAAmount(await getAccountTotalAmount(10002)); // Load BCA balance
      setBNIAmount(await getAccountTotalAmount(10003)); // Load BNI balance
      setBRIAmount(await getAccountTotalAmount(10004)); // Load BRI balance
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setPaymentGatewayAmount(null);
      setPaymentGatewayAmount(
        await getAccountTotalAmount(paymentGatewayAccountCode?.value)
      );
    })();
  }, [paymentGatewayAccountCode?.value]);

  return (
    <>
      <Row>
        <Col sm="6">
          <Card>
            <CardBody>
              <div className="payment-gateway-balance">
                <div className="payment-gateway-balance__withdraw-section">
                  <Select
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        width: 150,
                        zIndex: 9999,
                      }),
                      control: (base) => ({
                        ...base,
                        border: 0,
                        width: 150,
                        boxShadow: "none",
                      }),
                    }}
                    isSearchable={false}
                    options={paymentGatewayAccountCodes}
                    classNamePrefix="select"
                    value={paymentGatewayAccountCode}
                    onChange={handlePaymentGatewayAccountCodeSelect}
                  />
                  <Button
                    size="md"
                    color="primary"
                    disabled={paymentGatewayAmount === null}
                    className="mt-25"
                    onClick={() =>
                      (window.location.href = "/keuangan/transfer-dana")
                    }
                  >
                    Transfer Dana
                  </Button>
                </div>
                {paymentGatewayAmount === null ? (
                  <Spinner />
                ) : (
                  <>
                    <p className="payment-gateway-balance__price-header">
                      Total Saldo
                    </p>
                    <span className="payment-gateway-balance__price-body">
                      {priceFormatter(paymentGatewayAmount)}
                    </span>
                  </>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm="6">
          <Card>
            <CardBody>
              <Row>
                <Col sm="12">
                  <div className="bank-balance">
                    <img
                      src="https://btw-cdn.com/assets/payment/logo/bca.webp"
                      width={100}
                    />
                    <span className="bank-balance__divider"></span>
                    {BCAAmount === null ? (
                      <Spinner />
                    ) : (
                      <span className="bank-balance__price">
                        {priceFormatter(BCAAmount)}
                      </span>
                    )}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm="12">
                  <div className="bank-balance">
                    <img
                      src="https://btw-cdn.com/assets/payment/logo/bri.webp"
                      width={100}
                    />
                    <span className="bank-balance__divider"></span>
                    {BRIAmount === null ? (
                      <Spinner />
                    ) : (
                      <span className="bank-balance__price">
                        {priceFormatter(BRIAmount)}
                      </span>
                    )}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col sm="12">
                  <div className="bank-balance">
                    <img
                      src="https://btw-cdn.com/assets/payment/logo/bni.webp"
                      width={100}
                    />
                    <span className="bank-balance__divider"></span>
                    {BNIAmount === null ? (
                      <Spinner />
                    ) : (
                      <span className="bank-balance__price">
                        {priceFormatter(BNIAmount)}
                      </span>
                    )}
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col sm="12">
          <Card>
            <CardBody>
              <FundBillingHistoryTable histories={transferFunds} />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col sm="12">
          <Card>
            <CardBody>
              <CentralLoanTable data={debts} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CentralDashboard;

if (document.getElementById("central-dashboard-container")) {
  ReactDOM.render(
    <CentralDashboard />,
    document.getElementById("central-dashboard-container")
  );
}
