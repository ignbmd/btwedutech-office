import classnames from "classnames";
import { ChevronRight } from "react-feather";
import React, { Fragment, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Col,
  FormFeedback,
  FormGroup,
  Label,
  Media,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

import { BASE_IMG_URL } from "../../../../config/icons";
import { manualPayment } from "../../../../config/payment";
import FileUpload from "../../../core/file-upload/FileUpload";
import FilePreview from "../../../core/file-upload/FilePreview";
import { getFileColor } from "../../../../utility/Utils";

const initialIcon = `${BASE_IMG_URL}/icons/credit-card.svg`;

const TransferPayment = ({
  selected,
  showModal,
  hideModal,
  errorFile,
  registerFile,
  paymentLists = manualPayment,
  selectPayment,
  isModalShowed,
  handleFileError,
  handleSelectedFile,
  errorPaymentMethod,
  withUpload = true,
  fileDefault = null,
  uploadFileRequired = false,
}) => {
  const clickPaymentHandler = (payment) => {
    selectPayment(payment);
    hideModal();
  };

  const getFileType = () => {
    if (!fileDefault) return;
    const type = fileDefault?.name.split(".");
    return type[type.length - 1];
  };

  return (
    <>
      <Card
        onClick={showModal}
        className="cursor-pointer mb-0"
        style={errorPaymentMethod ? { border: "1px solid #ea5455" } : {}}
      >
        <CardBody className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div>
              <img
                src={selected ? selected.logoUrl : initialIcon}
                alt=""
                width={selected ? 50 : 30}
              />
            </div>
            <div className="ml-1">
              <p className="mb-0">
                {selected ? (
                  <b>
                    {selected.label} • <small>{selected.number}</small>
                  </b>
                ) : (
                  <b>Pilih Metode Pembayaran</b>
                )}
              </p>
              {selected ? (
                <p className="mb-0">
                  <small>a/n PT. Bina Taruna Wiratama</small>
                </p>
              ) : null}
            </div>
          </div>
          <ChevronRight size={18} />
        </CardBody>
      </Card>
      <p className="text-danger small">{errorPaymentMethod}</p>

      {withUpload && (
        <FormGroup>
          <Label>Unggah Bukti Pembayaran</Label>
          <FileUpload
            {...registerFile("proof", uploadFileRequired)}
            changed={handleSelectedFile}
            maxFileSize="5mb"
            onerror={(e) => handleFileError("proof", e)}
            name="proof"
            className={classnames({
              "filepond-is-invalid": errorFile,
            })}
          />

          {fileDefault && (
            <FilePreview
              title={fileDefault?.name}
              desc={getFileType()}
              color={`light-${getFileColor(getFileType())}`}
              className="mb-0"
            />
          )}

          <p className="text-danger small">{errorFile}</p>
        </FormGroup>
      )}

      <Modal
        isOpen={isModalShowed}
        toggle={hideModal}
        className="modal-dialog-centered"
      >
        <ModalHeader toggle={hideModal}>Pilih Metode Pembayaran</ModalHeader>
        <ModalBody className="p-2">
          <CardTitle>Transfer Bank (Konfirmasi Manual)</CardTitle>
          {paymentLists.map((payment, index) => (
            <Fragment key={index}>
              <Media
                className="d-flex align-items-center cursor-pointer"
                onClick={() => clickPaymentHandler(payment)}
              >
                <Media left href="#">
                  <Media
                    object
                    src={payment.logoUrl}
                    width="50"
                    alt={payment.label}
                  />
                </Media>
                <Media body>
                  <h5 className="mb-0 ml-1 font-weight-bold">
                    {payment.label}
                  </h5>
                </Media>
              </Media>
              {manualPayment.length - 1 !== index && <hr />}
            </Fragment>
          ))}
        </ModalBody>
      </Modal>
    </>
  );
};

export default React.memo(TransferPayment);
