import React from "react";
import clsx from "clsx";
import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";

const AffiliateDashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const AffiliateTotalData = await fetchData();
      setData(AffiliateTotalData);
    })();
    return () => {
      clearInterval();
      clearTimeout();
    };
  }, []);

  async function fetchData() {
    const response = await axios.get("/api/affiliates/total");
    const body = await response.data;
    return body?.data;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }
  return (
    <Fragment>
      <Row style={{ rowGap: "28px" }}>
        <Col md="4" style={{ minHeight: "100%", height: "auto" }}>
          <Card
            inverse
            style={{
              margin: "0",
              height: "100%",
            }}
          >
            <CardBody>
              <div
                className="d-flex justify-content-between flex-column"
                style={{ minHeight: "100%", height: "auto" }}
              >
                <h3 className="font-weight-bold">Total Akun Mitra</h3>
                <h3 className={clsx("font-weight-bolder mt-3")}>
                  {data.total_affiliate}
                </h3>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="4" style={{ minHeight: "100%", height: "auto" }}>
          <Card
            inverse
            style={{
              margin: "0",
              height: "100%",
            }}
          >
            <CardBody>
              <div
                className="d-flex justify-content-between flex-column h-100"
                style={{ minHeight: "100%", height: "auto" }}
              >
                <h3 className="font-weight-bold">
                  Jumlah Akun Yang Sudah Di Verifikasi
                </h3>
                <h3 className={clsx("font-weight-bolder mt-3")}>
                  {data.total_verif_status_true}
                </h3>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="4" style={{ minHeight: "100%", height: "auto" }}>
          <Card
            inverse
            style={{
              height: "100%",
              margin: "0",
            }}
          >
            <CardBody>
              <div
                className="d-flex justify-content-between flex-column h-100"
                style={{ minHeight: "100%", height: "auto" }}
              >
                <h3 className="font-weight-bold">
                  Jumlah Akun Yang Belum Di Verifikasi
                </h3>
                <h3 className={clsx("font-weight-bolder mt-3")}>
                  {data.total_verif_status_false}
                </h3>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="4" style={{ minHeight: "100%", height: "auto" }}>
          <Card
            inverse
            style={{
              height: "100%",
              margin: "0",
            }}
          >
            <CardBody>
              <div
                className="d-flex justify-content-between flex-column h-100"
                style={{ minHeight: "100%", height: "auto" }}
              >
                <h3 className="font-weight-bold">
                  Jumlah Request Withdraw Pending
                </h3>
                <h3 className={clsx("font-weight-bolder mt-3")}>
                  {data.total_withdraw}
                </h3>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="4" style={{ minHeight: "100%", height: "auto" }}>
          <Card
            inverse
            style={{
              height: "100%",
              margin: "0",
            }}
          >
            <CardBody>
              <div
                className="d-flex justify-content-between flex-column h-100"
                style={{ minHeight: "100%", height: "auto" }}
              >
                <h3 className="font-weight-bold">Total Semua Saldo Mitra</h3>
                <h3 className={clsx("font-weight-bolder mt-3")}>
                  {formatCurrency(data.total_wallet)}
                </h3>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md="4" style={{ minHeight: "100%", height: "auto" }}>
          <Card
            inverse
            style={{
              height: "100%",
              margin: "0",
            }}
          >
            <CardBody>
              <div
                className="d-flex justify-content-between flex-column h-100"
                style={{ minHeight: "100%", height: "auto" }}
              >
                <h3 className="d-flex font-weight-bold">
                  Jumlah Bukti Pembayaran Pajak Yang Belum Di Upload / Pending
                </h3>
                <h3 className={clsx("d-flex font-weight-bolder mt-3")}>
                  {data.total_tax_payment}
                </h3>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default AffiliateDashboard;
