import Swal from "sweetalert2";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { useState } from "react";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import withReactContent from "sweetalert2-react-content";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";
import { Pocket, PlusCircle, X } from "react-feather";
import FileUpload from "../core/file-upload/FileUpload";
import { useFileUpload } from "../../hooks/useFileUpload";
import TransferPayment from "../sale/SaleFormSteps/Summary/TransferPayment";
import {
  priceFormatter,
  getCsrf,
  getBillTransactionId,
  getBillId,
} from "../../utility/Utils";
import axios from "axios";
import moment from "moment";
import { useEffect } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Badge,
  Button,
  Card,
  CardBody,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Input,
  CustomInput,
  FormFeedback,
} from "reactstrap";
import { manualPayment } from "../../config/payment";
import SpinnerCenter from "../core/spinners/Spinner";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const transactionStatus = [
  { value: "", label: "Pilih Status Transaksi" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" }
];

const ImagePreview = ({ files, name }) => {
  return (
    <div
      className={classnames(
        typeof files?.[name][0] !== "string" && "d-none",
        "mt-50"
      )}
    >
      <a href={files?.[name][0]} target="_blank" >
        <img src={files?.[name][0]} width={100}/>
      </a>
    </div>
  );
};

const MySwal = withReactContent(Swal);
const cashPaymentProofHref = `/bukti-pembayaran-cash/tambah/${getBillId()}`;

const formSchema = yup.object().shape({
  paid_bill: yup.number().positive("Nominal pembayaran harus bilangan positif / tidak boleh 0").typeError("Nominal pembayaran harus diisi"),
  payment_type: yup.string(),
  file: yup.mixed().when(["payment_type"], {
    is: (paymentType) => paymentType !== "CASH",
    then: yup.mixed().required("Bukti pembayaran harus diupload"),
  }),
  payment_method: yup.string().when(["payment_type"], {
    is: (paymentType) => paymentType !== "CASH",
    then: yup.string().required("Metode pembayaran harus dipilih"),
  }),
  due_date: yup.string().required("Jatuh Tempo harus diisi"),
});

const FormEditOfflineTransaction = () => {
  const [transaction, setTransaction] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();
  const [isPaymentModalShowed, setIsPaymentModalShowed] = useState(false);
  const [productType, setProductType] = useState();
  const [isAddNote, setIsAddNote] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
  });
  const { payment_type: paymentType = "CASH", file } = watch();
  const [paymentProof, setPaymentProof] = useState({ proof: [] });

  const {
    files,
    fileErrors,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
    checkIsFileValid,
  } = useFileUpload(paymentProof);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setTransaction(await getTransaction());
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    loadForm();
  }, [transaction]);

  useEffect(() => {
    if (!selectedPaymentMethod) return;
    setValue("payment_method", selectedPaymentMethod.code);
  }, [selectedPaymentMethod]);


  useEffect(() => {
    setValue("file", files.proof[0]);
  }, [files.proof]);

  useEffect(() => {
    if (paymentType == "CASH") {
      setValue("payment_method", "CASH");
    } else {
      setValue("payment_method", selectedPaymentMethod?.code);
    }
    delete errors?.payment_method;
    delete errors?.file;
  }, [paymentType]);

  useEffect(() => {
    if (!checkIsFileValid())
      setError("file", {
        type: "manual",
        message: fileErrors?.proof.proof[0] ?? "",
      });
  }, [fileErrors.proof.proof]);

  const getTransaction = async () => {
    try {
      const billId = getBillId();
      const transactionId = getBillTransactionId();
      const url = `/api/finance/bill/${billId}/transactions/${transactionId}`;
      const response = await axios.get(url);
      const data = await response.data;
      if(data.document.length > 0) setPaymentProof({ proof: [data.document[0].path] })
      setProductType(data.bill.product_type);
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const loadForm = () => {
    setValue("bill_amount", transaction?.final_transaction);
    setValue("paid_bill", 0);
    setValue("due_date", transaction?.bill?.due_date);
    setValue("note", transaction?.note);
    setValue(
      "payment_type",
      transaction?.transaction_method == "CASH" ? "CASH" : "TRANSFER"
    );
    setValue("payment_method", transaction?.transaction_method);
    setValue("transaction_status", transactionStatus.filter(item => item.value === transaction?.transaction_status));
    loadManualPaymentMethod();
  };

  const loadManualPaymentMethod = () => {
    const value = getValues("payment_method");
    const payment = manualPayment.find((p) => p.code == value);
    if (!payment) return;
    setSelectedPaymentMethod(payment);
  };

  const showTransferPaymentModal = () => {
    setIsPaymentModalShowed(true);
  };

  const hideTransferPaymentModal = () => {
    setIsPaymentModalShowed(false);
  };

  const onSubmit = async (data) => {
    const state = await MySwal.fire({
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
    });
    if (state.isDismissed) return;
    fetchUpdateTransaction(data);
  };

  const fetchUpdateTransaction = async (data) => {

    const formData = new FormData();
    data.payment_method = data.payment_method ?? "CASH";
    data.created_at = transaction.created_at;
    formData.append("data", JSON.stringify(data));
    formData.append("file", data.file);
    const billId = getBillId();
    const transactionId = getBillTransactionId();
    setIsSubmitting(true);
    try {
      const url = `/api/finance/bill/${billId}/offline-transaction/${transactionId}`;
      const response = await axios.post(url, formData, {
        headers: {
          "X-CSRF-TOKEN": getCsrf(),
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      redirectToDetail();
    }
  };

  const redirectToDetail = () => {
    window.location.href = `/tagihan/detail/${getBillId()}`;
  };

  return (
    <>
      {isLoading ? (
        <SpinnerCenter />
      ) : (
        <div>
          <Card className="card-app-design">
            <CardBody>
              <Badge color="light-primary">Transaksi #{transaction?.id}</Badge>
              <div className="mt-2">
                <h6 className="mb-1">
                  Detail transaksi per tanggal{" "}
                  {moment(transaction?.created_at).format("DD/MM/YYYY")}:
                </h6>
                <table>
                  <tbody>
                    <tr>
                      <td className="pr-1">Total tagihan:</td>
                      <td>
                        <b>{priceFormatter(transaction?.bill?.final_bill)}</b>
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-1">Sudah dibayar:</td>
                      <td className="text-success">
                        {priceFormatter(transaction?.bill?.paid_bill)}
                      </td>
                    </tr>
                    <tr>
                      <td className="pr-1">Sisa pembayaran saat ini:</td>
                      <td className="text-danger">
                        {priceFormatter(transaction?.bill?.remain_bill)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
          <Card className="card-app-design">
            <CardBody>
              <AvForm className="mt-1 col-12 col-md-6 p-0" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <label htmlFor="bill_amount">Nominal Tagihan</label>
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>Rp</InputGroupText>
                        </InputGroupAddon>
                        <Cleave
                          {...field}
                          options={numeralOptions}
                          className={classnames("form-control", {
                            "is-invalid": error,
                          })}
                          onChange={(e) => field.onChange(e.target.rawValue)}
                          value={field.value ?? 0}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </InputGroup>
                    </FormGroup>
                  )}
                  id="paid_bill"
                  name="paid_bill"
                  control={control}
                  placeholder="10.000"
                />

                <AvRadioGroup
                  name="payment_type"
                  value="CASH"
                  {...register("payment_type", { required: true })}
                  required
                >
                  <Label>Metode Pembayaran</Label>
                  <div className="d-flex mt-50">
                    <AvRadio
                      className="mb-1 mr-1"
                      customInput
                      label="Cash"
                      value="CASH"
                    />
                  <AvRadio customInput label="Transfer" value="TRANSFER" />
                  </div>
                </AvRadioGroup>
                {paymentType == "TRANSFER" ? (
                  <TransferPayment
                    selected={selectedPaymentMethod}
                    isModalShowed={isPaymentModalShowed}
                    showModal={showTransferPaymentModal}
                    hideModal={hideTransferPaymentModal}
                    registerFile={registerFile}
                    handleSelectedFile={handleSelectedFile}
                    selectPayment={setSelectedPaymentMethod}
                    handleFileError={handleFileError}
                    errorFile={errors?.file?.message}
                    errorPaymentMethod={errors?.payment_method?.message}
                    fileDefault={transaction?.file_proof}
                  />
                ) : (
                  <FormGroup>
                    <Label>Unggah Bukti Pembayaran</Label>
                    <FileUpload
                      {...registerFile("proof", false)}
                      changed={handleSelectedFile}
                      maxFileSize="5mb"
                      onerror={(e) => handleFileError("proof", e)}
                      name="proof"
                      className={classnames({
                        "mb-1": true,
                        "filepond-is-invalid": errors?.file?.message,
                      })}
                    />
                    <p className="mb-2">Belum memiliki bukti pembayaran cash? <a target="__blank" href={cashPaymentProofHref}>Tambah</a></p>
                  </FormGroup>
                )}

                <FormGroup>
                  <Label>Bukti Pembayaran</Label>
                  {files.proof.length > 0 ? <ImagePreview files={files} name="proof" /> : (<p>Tidak ditemukan</p>)}
                </FormGroup>

                <Controller
                  name="transaction_status"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup>
                        <Label for="transaction_status">Status Pembayaran</Label>
                        <Select
                          {...field}
                          options={transactionStatus}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": error && true,
                          })}
                          styles={{
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                          }}
                        />
                      </FormGroup>
                    );
                  }}
                />
                <br />

                <Badge
                  pill
                  color="light-dark"
                  className="cursor-pointer mt-2"
                  onClick={() => {
                    setValue("note", "");
                    setIsAddNote((val) => !val);
                  }}
                >
                  {isAddNote ? <X size={12} /> : <PlusCircle size={12} />}
                  <span className="align-middle ml-50">
                    {isAddNote ? "Hapus Catatan" : "Tambah Catatan"}
                  </span>
                </Badge>
                {isAddNote ? (
                  <div className="form-label-group mt-2">
                    <Controller
                      name="note"
                      defaultValue=""
                      control={control}
                      render={({ field }) => {
                        const { ref, ...rest } = field;
                        return (
                          <>
                            <Input
                              {...rest}
                              rows="3"
                              type="textarea"
                              innerRef={ref}
                              placeholder="Contoh: jatuh tempo sampai xx-xx-xxxx"
                            />
                            <Label>Catatan</Label>
                          </>
                        );
                      }}
                    />
                  </div>
                ) : null}

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    color="success"
                    className="btn-next"
                  >
                    <Pocket
                      size={14}
                      className="align-middle ml-sm-25 ml-0 mr-50"
                    />
                    <span className="align-middle d-sm-inline-block d-none">
                      {isSubmitting ? "Memproses..." : "Proses"}
                    </span>
                  </Button>
                </div>
              </AvForm>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
};

export default FormEditOfflineTransaction;
