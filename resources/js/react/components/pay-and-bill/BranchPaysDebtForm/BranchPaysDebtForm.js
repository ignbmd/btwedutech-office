import classnames from "classnames";
import React, { useEffect, useState } from "react";
import { Circle, DollarSign, Edit, Pocket } from "react-feather";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  FormGroup,
  Label,
  Button,
} from "reactstrap";
import { List } from "react-content-loader";

import { manualPayment } from "../../../config/payment";
import ImagePreview from "../../core/image/ImagePreview";
import FileUpload from "../../core/file-upload/FileUpload";
import { useFileUpload } from "../../../hooks/useFileUpload";
import { getLastSegment, priceFormatter } from "../../../utility/Utils";


const BranchPaysDebtForm = () => {
  const [detail, setDetail] = useState();
  const [paymentDetail, setPaymentDetail] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [proofFile] = useState({ proof: [] });
  const {
    files,
    fileErrors,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
    checkIsFileValid,
  } = useFileUpload(proofFile);

  const historyId = getLastSegment();

  const getManualPaymentPayload = (name) => {
    const bankMatchName = name.match(/bca|bri|bni/i);
    if (bankMatchName) {
      return manualPayment.find(
        (item) => item.code === `MANUAL_TF_${bankMatchName}`
      );
    }
  };

  useEffect(() => {
    setIsSubmitting(true);
    (async () => {
      try {
        const response = await axios.get(
          `/api/finance/pay-and-bill/history/${historyId}`
        );
        const data = response.data?.data ?? null;
        const sourceAccountName = data.source_account?.name;
        let paymentData = null;
        if (sourceAccountName.match(/^kas$/i)) {
          paymentData = {
            label: sourceAccountName,
            type: "cash",
          };
        } else {
          paymentData = {
            ...getManualPaymentPayload(data.source_account?.name),
            type: "transfer",
          };
        }
        if (data.status == "COMPLETED" || data.status == "REJECTED") {
          return (window.location.href = "/bayar-dan-tagih");
        }
        setIsSubmitting(false);
        setDetail(
          data
            ? {
                ...data,
                document: data.document.reverse(),
              }
            : data
        );
        setPaymentDetail(paymentData);
      } catch (error) {
        setIsSubmitting(false);
        console.log(error);
      }
    })();
  }, []);

  const getFormDataValues = () => {
    const fd = new FormData();
    fd.append("id", historyId);
    fd.append("amount", detail.amount);
    fd.append("payment_method", detail.source_account.name);
    fd.append("branch_code", detail.branch_code);
    if (paymentDetail?.type === "transfer") {
      files.proof.forEach((file) => {
        fd.append("proof", file);
      });
    }

    return fd;
  };

  const handleSubmit = async () => {
    const isValid = checkIsFileValid();
    if (!isValid) return;

    setIsSubmitting(true);
    const fd = getFormDataValues();
    try {
      const response = await axios.post(
        `/api/finance/pay-and-bill/history-branch`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setIsSubmitting(false);
      window.location.href = "/bayar-dan-tagih";
    } catch (error) {
      setIsSubmitting(false);
      console.log(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Penagihan Piutang Pusat No #{detail ? detail.id : ""}
        </CardTitle>
      </CardHeader>
      <CardBody>
        {/* <p className="mb-0">
          <small>Dibuat pada 21 April 2021 15:00 WIB</small>
        </p>
        <p className="mb-0">
          <small>Dibuat oleh: Bu Made</small>
        </p> */}
        {detail === undefined ? (
          <List />
        ) : (
          <Col md={6} className={classnames("pl-0 mt-2", isSubmitting && 'block-content')}>
            <div className="d-flex align-items-center">
              <div
                className={`avatar avatar-stats p-50 m-0 bg-light-primary mr-2`}
              >
                <div className="avatar-content">
                  <DollarSign />
                </div>
              </div>
              <div>
                <p className="card-text mb-0">Total Tagihan</p>
                <h2 className="font-weight-bolder mb-0">
                  {priceFormatter(detail.amount)}
                </h2>
              </div>
            </div>
            <div className="d-flex align-items-center mt-75">
              <div
                className={`avatar avatar-stats p-50 m-0 bg-light-secondary mr-2`}
              >
                <div className="avatar-content">
                  <Circle size={14} />
                </div>
              </div>
              <div>
                <p className="card-text mb-0">Metode Pembayaran</p>
                {paymentDetail?.type === "cash" ? (
                  <h5 className="font-weight-bolder mb-0">
                    {paymentDetail.label}
                  </h5>
                ) : paymentDetail?.type === "transfer" ? (
                  <h5 className="font-weight-bolder mb-0">
                    {paymentDetail.label} • {paymentDetail.number}
                    <br />
                    <span className="font-weight-normal">
                      <small>a/n PT. Bina Taruna Wiratama</small>
                    </span>
                  </h5>
                ) : null}
              </div>
            </div>
            <div className="d-flex align-items-center mt-75">
              <div
                className={`avatar avatar-stats p-50 m-0 bg-light-secondary mr-2`}
              >
                <div className="avatar-content">
                  <Circle size={14} />
                </div>
              </div>
              <div>
                <p className="card-text mb-0">Status</p>
                <h5 className="font-weight-bolder mb-0">
                  {detail.status === "OPEN"
                    ? "Belum Dibayar"
                    : detail.status === "WAITING"
                    ? "Menunggu Konfirmasi"
                    : detail.status === "REJECTED"
                    ? "Ditolak"
                    : detail.status === "COMPLETED"
                    ? "Diterima"
                    : "-"}
                </h5>
              </div>
            </div>

            <hr className="my-2" />

            {paymentDetail?.type === "transfer" && (
              <h5 className="font-weight-bolder">Proses Pembayaran</h5>
            )}
            <AvForm className="mt-1" onSubmit={handleSubmit}>
              {paymentDetail?.type === "transfer" && (
                <>
                  <FormGroup>
                    <Label>Unggah Bukti Pembayaran</Label>
                    <FileUpload
                      {...registerFile("proof", true)}
                      changed={handleSelectedFile}
                      maxFileSize="5mb"
                      onerror={(e) => handleFileError("proof", e)}
                      name="proof"
                      className={classnames({
                        "filepond-is-invalid": fileErrors?.proof?.[0],
                      })}
                    />

                    <p className="text-danger small">
                      {fileErrors?.proof?.[0]}
                    </p>
                  </FormGroup>
                  {detail.document?.[0] ? (
                    <ImagePreview
                      files={{
                        proof: [detail.document?.[0].path],
                      }}
                      name="proof"
                    />
                  ) : null}
                </>
              )}

              <div className="d-flex justify-content-end mt-4">
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  color={detail.status == "OPEN" ? "success" : "primary"}
                  className="btn-next"
                >
                  {detail.status == "OPEN" ? (
                    <Pocket
                      size={14}
                      className="align-middle ml-sm-25 ml-0 mr-50"
                    />
                  ) : (
                    <Edit
                      size={14}
                      className="align-middle ml-sm-25 ml-0 mr-50"
                    />
                  )}
                  <span className="align-middle d-sm-inline-block d-none">
                    {isSubmitting
                      ? "Memproses..."
                      : detail.status == "OPEN"
                      ? "Bayar"
                      : "Perbarui"}
                  </span>
                </Button>
              </div>
            </AvForm>
          </Col>
        )}
      </CardBody>
    </Card>
  );
};

export default BranchPaysDebtForm;
