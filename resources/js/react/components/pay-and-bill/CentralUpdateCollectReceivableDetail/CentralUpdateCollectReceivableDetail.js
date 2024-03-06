import axios from "axios";
import * as yup from "yup";
import Swal from "sweetalert2";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Edit2, ExternalLink, X } from "react-feather";
import withReactContent from "sweetalert2-react-content";
import ContentLoader, { List } from "react-content-loader";
import React, { useEffect, useRef, useState } from "react";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";
import {
  Col,
  Card,
  Label,
  Badge,
  Button,
  CardBody,
  CardTitle,
  FormGroup,
  CardHeader,
  InputGroup,
  FormFeedback,
  InputGroupText,
  InputGroupAddon,
} from "reactstrap";

import { manualPayment } from "../../../config/payment";
import { useFileUpload } from "../../../hooks/useFileUpload";
import FilePreview from "../../core/file-upload/FilePreview";
import { getLastSegment, priceFormatter } from "../../../utility/Utils";
import TransferPayment from "../../sale/SaleFormSteps/Summary/TransferPayment";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const CentralUpdateCollectReceivableDetail = () => {
  const [detail, setDetail] = useState();
  const [cashPayment, setCashPayment] = useState();
  const [isAdditionalChange, setIsAdditionalChange] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferPaymentLists, setTransferPaymentLists] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();
  const [isPaymentModalShowed, setIsPaymentModalShowed] = useState(false);
  const [proofFile] = useState({ proof: [] });

  const formSchema = yup.object().shape({
    paid_bill: yup.string(),
    status: yup
      .string()
      .test(
        "test_is_status_required",
        "Wajib memilih salah satu opsi diatas",
        function (value) {
          if(value) return true;
          return isAdditionalChange;
        }
      ),
  });

  const {
    watch,
    register,
    setValue,
    setError,
    control,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
  });

  const {
    fileErrors,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
  } = useFileUpload(proofFile);

  const { payment_type: paymentType = "CASH" } = watch();

  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();
  const ConfirmationSwal = withReactContent(Swal);

  const historyId = getLastSegment();

  const showTransferPaymentModal = () => {
    setIsPaymentModalShowed(true);
  };

  const hideTransferPaymentModal = () => {
    setIsPaymentModalShowed(false);
  };

  const getManualPaymentPayload = (name) => {
    const bankMatchName = name.match(/bca|bri|bni/i);
    if (bankMatchName) {
      return manualPayment.find(
        (item) => item.code === `MANUAL_TF_${bankMatchName}`
      );
    }
    return null;
  };

  const fetchSourceAccount = async () => {
    try {
      const response = await axios.get(
        "/api/finance/pay-and-bill/source-account"
      );
      const data = response.data?.data ?? [];

      const cashPaymentData = data
        .filter((item) => item.name.match(/kas/i))
        .map((item) => {
          return {
            id: item.id,
            account_code: item.account_code,
          };
        });

      const transferPaymentData = data
        .filter((item) => !item.name.match(/^kas$/i))
        .map((item) => {
          const manualPaymentPayload = getManualPaymentPayload(item.name);
          return {
            id: item.id,
            account_code: item.account_code,
            label: item.name,
            logoUrl: manualPaymentPayload?.logoUrl,
            number: manualPaymentPayload?.number,
          };
        });
      setCashPayment(...cashPaymentData);
      setTransferPaymentLists(transferPaymentData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `/api/finance/pay-and-bill/history/${historyId}`,
          {
            cancelToken: source.token,
          }
        );
        const data = response.data?.data ?? null;
        if (!isCanceled.current) {
          setDetail(data);
        }
      } catch (error) {
        console.log(error);
      }
    })();
    return () => {
      isCanceled.current = true;
      source.cancel();
    };
  }, []);

  const processTransaction = async () => {
    const { paid_bill, status } = getValues();
    const payload = {
      id: historyId,
      status: status ? status : detail.status,
      source_account_id: isAdditionalChange
        ? selectedPaymentMethod.id
        : detail.source_account.id,
      contact_id: detail.contact_id,
      amount: isAdditionalChange ? paid_bill : detail.amount,
    };

    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `/api/finance/pay-and-bill/history-central`,
        {
          ...payload,
          cancelToken: source.token,
        }
      );

      if (!isCanceled.current) {
        setIsSubmitting(false);
        window.location.href = `/bayar-dan-tagih/tagih/cabang/${detail.branch_code}?account_id=${detail.account?.id}`;
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsSubmitting(false);
      }
      console.log(error);
    }
  };

  const onSubmit = async () => {
    ConfirmationSwal.fire({
      title: "Pastikan data yang diinput sudah benar!",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Proses",
      cancelButtonText: "Batalkan",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-outline-secondary ml-1",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.value) {
        processTransaction();
      }
    });
  };

  const toggleAdditionalChange = () => {
    setIsAdditionalChange((current) => !current);
  };

  useEffect(() => {
    if (!cashPayment && transferPaymentLists.length == 0 && isAdditionalChange) {
      fetchSourceAccount();
    }
    if (detail && (cashPayment || transferPaymentLists.length > 0)) {
      const currentManualPaymentPayload = getManualPaymentPayload(
        detail.source_account?.name
      );
      const currentPaymentPayload = currentManualPaymentPayload
        ? {
            id: detail.source_account?.id,
            account_code: detail.source_account?.account_code,
            label: detail.source_account?.name,
            logoUrl: currentManualPaymentPayload?.logoUrl,
            number: currentManualPaymentPayload?.number,
          }
        : {
            id: detail.source_account?.id,
            account_code: detail.source_account?.account_code,
          };
      setValue("paid_bill", detail.amount);
      setValue(
        "payment_type",
        currentManualPaymentPayload ? "TRANSFER" : "CASH"
      );
      setSelectedPaymentMethod(currentPaymentPayload);
    }
  }, [isAdditionalChange, transferPaymentLists, cashPayment, detail]);

  useEffect(() => {
    if (isAdditionalChange) {
      setError("status", "");
    }
  }, [isAdditionalChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {/* Perbarui Penagihan Piutang ke Cabang Bimbel BTW Mengwi */}
          Perbarui Penagihan Piutang
        </CardTitle>
      </CardHeader>
      <CardBody>
        <AvForm className="mt-1" onSubmit={handleSubmit(onSubmit)}>
          {detail === undefined ? (
            <List />
          ) : (
            <>
              <Col md={7} className="px-0 mt-1 d-flex align-items-center">
                {!isAdditionalChange ? (
                  <>
                    <div className="flex-fill mr-2">
                      <div className="row">
                        <span className="col-6">Nominal Tagihan</span>
                        <span className="col-1">:</span>
                        <span className="col-5 font-weight-bolder">
                          {priceFormatter(detail.amount)}
                        </span>
                      </div>
                      <div className="row mt-50">
                        <span className="col-6">Metode Pembayaran</span>
                        <span className="col-1">:</span>
                        <span className="col-5 font-weight-bolder">
                          {detail.source_account?.name}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-fill mr-2">
                    <Controller
                      id="paid_bill"
                      name="paid_bill"
                      control={control}
                      placeholder="10.000"
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <FormGroup>
                            <label htmlFor="paid_bill">Nominal</label>
                            <InputGroup
                              className={classnames({
                                "is-invalid": error && true,
                              })}
                            >
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>Rp</InputGroupText>
                              </InputGroupAddon>
                              <Cleave
                                {...field}
                                options={numeralOptions}
                                className={classnames("form-control", {
                                  "is-invalid": error,
                                })}
                                onChange={(e) =>
                                  field.onChange(e.target.rawValue)
                                }
                                value={field.value ?? 0}
                              />
                            </InputGroup>
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        </>
                      )}
                    />

                    <AvRadioGroup
                      name="payment_type"
                      value="CASH"
                      {...register("payment_type", { required: true })}
                      required
                    >
                      <Label>Metode Pembayaran</Label>
                      {transferPaymentLists.length > 0 ? (
                        <div className="d-flex mt-50">
                          <AvRadio
                            className="mb-1 mr-1"
                            customInput
                            label="Cash"
                            value="CASH"
                          />
                          <AvRadio
                            customInput
                            label="Transfer"
                            value="TRANSFER"
                          />
                        </div>
                      ) : (
                        <ContentLoader viewBox="0 0 380 30">
                          <rect
                            x="0"
                            y="0"
                            rx="5"
                            ry="5"
                            width="400"
                            height="30"
                          />
                        </ContentLoader>
                      )}
                    </AvRadioGroup>

                    {paymentType == "TRANSFER" ? (
                      <TransferPayment
                        uploadFileRequired
                        registerFile={registerFile}
                        withUpload={false}
                        errorFile={fileErrors?.proof[0]}
                        selected={selectedPaymentMethod}
                        handleFileError={handleFileError}
                        paymentLists={transferPaymentLists}
                        isModalShowed={isPaymentModalShowed}
                        showModal={showTransferPaymentModal}
                        hideModal={hideTransferPaymentModal}
                        handleSelectedFile={handleSelectedFile}
                        selectPayment={setSelectedPaymentMethod}
                        errorPaymentMethod={errors?.payment_method?.message}
                      />
                    ) : null}
                  </div>
                )}
                <div>
                  {detail.status === "OPEN" && (
                    <Button
                      outline
                      type="button"
                      size="sm"
                      color={isAdditionalChange ? "warning" : "primary"}
                      onClick={toggleAdditionalChange}
                    >
                      {isAdditionalChange ? (
                        <>
                          <X size={14} /> Batalkan
                        </>
                      ) : (
                        <>
                          <Edit2 size={14} /> Ubah
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Col>
              <div className="my-2">
                {!detail.source_account?.name.match(/kas/i) && (
                  <h5>Data Pembayaran Cabang</h5>
                )}
                <Col md={6} className="px-0">
                  {!detail.source_account?.name.match(/kas/i) &&
                    (!detail.document?.[0]?.path ? (
                      <Badge color="light-secondary" className="mt-1">
                        Belum Ada Bukti Pembayaran
                      </Badge>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center">
                        <FilePreview
                          title={detail.document?.[0]?.name}
                          desc={detail.document?.[0]?.name.split(".").pop()}
                          color={`light-primary`}
                          className="mb-0"
                        />
                        <a
                          href={detail.document?.[0]?.path}
                          target="_blank"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <ExternalLink size={14} /> Lihat
                        </a>
                      </div>
                    ))}
                  <hr />
                  <AvRadioGroup name="status" {...register("status")}>
                    <Label for="title">
                      Perbarui Status Pembayaran{" "}
                      {/* <span className="text-danger">*</span> */}
                    </Label>
                    <div className="d-flex mt-1">
                      <AvRadio
                        className="mb-1 mr-1"
                        customInput
                        label="Diterima"
                        value="COMPLETED"
                      />
                      <AvRadio customInput label="Ditolak" value="REJECTED" />
                    </div>
                    <p className="text-danger">
                      <small>{errors?.status?.message}</small>
                    </p>
                  </AvRadioGroup>
                  <div className="d-flex justify-content-end mt-4">
                    <Button
                      disabled={isSubmitting}
                      type="submit"
                      color="gradient-primary"
                      className="btn-next"
                    >
                      <span className="align-middle d-sm-inline-block d-none">
                        {isSubmitting ? "Memproses..." : "Perbarui"}
                      </span>
                    </Button>
                  </div>
                </Col>
              </div>
            </>
          )}
        </AvForm>
      </CardBody>
    </Card>
  );
};

export default CentralUpdateCollectReceivableDetail;
