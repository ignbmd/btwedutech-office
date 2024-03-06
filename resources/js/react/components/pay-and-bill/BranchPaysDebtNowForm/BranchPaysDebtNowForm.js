import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { useContext, useEffect, useState } from "react";
import { DollarSign, Plus, Pocket } from "react-feather";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
import TransferPayment from "../../sale/SaleFormSteps/Summary/TransferPayment";
import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Button,
  Badge,
  FormFeedback,
} from "reactstrap";
import axios from "axios";
import PropTypes from "prop-types";

import { useFileUpload } from "../../../hooks/useFileUpload";
import { manualPayment } from "../../../config/payment";
import {
  getLastSegment,
  getUserFromBlade,
  isObjEmpty,
  priceFormatter,
  showToast,
} from "../../../utility/Utils";
import AddContactModal from "../../expense/ExpenseForm/AddContactModal";
import { ExpenseContext } from "../../../context/ExpenseContext";
import ContentLoader from "react-content-loader";
import { useRef } from "react";

import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const BranchPaysDebtNowForm = () => {
  const [proofFile] = useState({ proof: [] });
  const [debtAmount, setDebtAmount] = useState();
  const [cashPayment, setCashPayment] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddNewContact, setIsAddNewContact] = useState(false);
  const [transferPaymentLists, setTransferPaymentLists] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();
  const [isPaymentModalShowed, setIsPaymentModalShowed] = useState(false);

  const { contactOption, loadContactOptionByBranchCode, selectedContactId } =
    useContext(ExpenseContext);
  const user = getUserFromBlade();
  const { branch_code: branchCode } = user;

  const accountId = getLastSegment();

  const formSchema = yup.object().shape({
    created_at: yup.string().required("Tanggal Transaksi harus diisi"),
    contact: yup.object().required("Penerima harus diisi"),
    paid_bill: yup
      .string()
      .test(
        "test_value_greater_than_total",
        "Nominal melebihi total",
        function (value) {
          if (+value > debtAmount) return false;
          return true;
        }
      )
      .required("Nominal harus diisi"),
    payment_type: yup.string(),
    payment_method: yup.string().when(["payment_type"], {
      is: (paymentType) => paymentType !== "CASH" && !selectedPaymentMethod,
      then: yup.string().required("Metode pembayaran harus dipilih"),
    }),
  });

  const {
    watch,
    trigger,
    control,
    register,
    setValue,
    setError,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
  });

  const {
    files,
    fileErrors,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
    checkIsFileValid,
  } = useFileUpload(proofFile);

  const { payment_type: paymentType = "CASH" } = watch();

  const showTransferPaymentModal = () => {
    setIsPaymentModalShowed(true);
  };

  const hideTransferPaymentModal = () => {
    setIsPaymentModalShowed(false);
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
            name: item.name,
          };
        });
      const transferPaymentData = data
        .filter((item) => item.name.match(/^bank./i))
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

  const fetchDebtTotal = async () => {
    try {
      const response = await axios.get(
        `/api/finance/pay-and-bill/amount/${accountId}`
      );
      const data = response.data?.data ?? -1;
      setDebtAmount(data);
      // setValue("paid_bill", data);
    } catch (error) {
      console.log(error);
    }
  };

  const getFormDataValues = () => {
    const values = getValues();

    const payload = {
      account_id: accountId,
      branch_code: branchCode,
      contact_id: values.contact.id,
      contact_name: values.contact.name,
      contact_phone: values.contact.phone,
      created_at: values.created_at,
      status: "WAITING",
      from: "BRANCH",
      log_type: "BILL",
      payment_method:
        paymentType === "CASH" ? cashPayment.name : selectedPaymentMethod.label,
      source_account_id:
        paymentType === "CASH" ? cashPayment.id : selectedPaymentMethod.id,
      amount: values.paid_bill,
    };
    const fd = new FormData();
    fd.append("reqBody", JSON.stringify(payload));
    if (paymentType !== "CASH") {
      files.proof.forEach((file) => {
        fd.append("proof", file);
      });
    }

    return fd;
  };

  const redirectToIndexPage = () => {
    window.location.href = "/bayar-dan-tagih"
  }

  const onSubmit = async () => {
    trigger();
    const isFileValid = checkIsFileValid();
    if (!isFileValid || !isObjEmpty(errors)) return;

    setIsSubmitting(true);
    const fd = getFormDataValues();
    try {
      const response = await axios.post(
        `/api/finance/pay-and-bill/central/create/bill`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const data = await response.data;
      if (data.success) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Pembayaran Berhasil di Proses",
        });
        setIsSubmitting(false);
        redirectToIndexPage();
      }
    } catch (error) {
      setIsSubmitting(false);
      console.log(error.response);
    }
  };

  const getManualPaymentPayload = (name) => {
    const bankMatchName = name.match(/bca|bri|bni/i);
    if (bankMatchName) {
      return manualPayment.find(
        (item) => item.code === `MANUAL_TF_${bankMatchName}`
      );
    }
  };

  const handleShowModal = () => {
    setIsAddNewContact(true);
  };

  useEffect(() => {
    if (selectedPaymentMethod) {
      setError("payment_method", "");
    }
  }, [selectedPaymentMethod]);

  useEffect(async () => {
    if (!selectedContactId) return;
    setValue("contact", selectedContactId);
  }, [selectedContactId]);

  useEffect(() => {
    fetchDebtTotal();
    fetchSourceAccount();
    loadContactOptionByBranchCode(branchCode);
  }, []);

  return (
    <Card>
      <CardBody className={classnames(isSubmitting && "block-content")}>
        <Col md={6} className="pl-0 mt-2">
          <div className="d-flex align-items-center">
            <div
              className={`avatar avatar-stats p-50 m-0 bg-light-primary mr-2`}
            >
              <div className="avatar-content">
                <DollarSign />
              </div>
            </div>
            <div>
              <p className="card-text mb-0">Total Hutang</p>
              <h2 className="font-weight-bolder mb-0">
                {debtAmount !== undefined ? (
                  priceFormatter(debtAmount)
                ) : (
                  <ContentLoader viewBox="0 0 380 70">
                    <rect x="0" y="0" rx="5" ry="5" width="400" height="70" />
                  </ContentLoader>
                )}
              </h2>
            </div>
          </div>

          <hr className="my-2" />
          <h5 className="font-weight-bolder">
            Proses Pembayaran
          </h5>

          <AvForm className="mt-1" onSubmit={handleSubmit(onSubmit)}>
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
                        onChange={(e) => field.onChange(e.target.rawValue)}
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
                  <AvRadio customInput label="Transfer" value="TRANSFER" />
                </div>
              ) : (
                <ContentLoader viewBox="0 0 380 30">
                  <rect x="0" y="0" rx="5" ry="5" width="400" height="30" />
                </ContentLoader>
              )}
            </AvRadioGroup>

            {paymentType == "TRANSFER" ? (
              <TransferPayment
                withUpload
                uploadFileRequired
                registerFile={registerFile}
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

            <Controller
              isClearable
              name="contact"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormGroup>
                  <Label className="form-label font-weight-bold" for="scope">
                    Pengirim{" "}
                    <Badge
                      size="sm"
                      color="light-primary"
                      className="cursor-pointer"
                      onClick={handleShowModal}
                    >
                      <Plus size={12} /> Klik untuk menambahkan
                    </Badge>
                  </Label>
                  <Select
                    {...field}
                    options={contactOption}
                    getOptionValue={(option) => option.id}
                    getOptionLabel={(option) => option.name}
                    placeholder="Pilih Kontak Pengirim"
                    classNamePrefix="select"
                    className={classnames("react-select", {
                      "is-invalid": error && true,
                    })}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              )}
            />

<Controller
              control={control}
              name="created_at"
              render={({
                field: { onChange, ref, value },
                fieldState: { error },
              }) => (
                <FormGroup>
                  <Label>Tanggal Transaksi</Label>
                  <Flatpickr
                    className={classnames("form-control", {
                      "is-invalid": error,
                    })}
                    data-enable-time
                    ref={ref}
                    value={value}
                    readOnly={false}
                    placeholder="Masukan tanggal transaksi"
                    onChange={(date) => onChange(date[0].toISOString())}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              )}
            />

            <div className="d-flex justify-content-end mt-4">
              <Button
                disabled={
                  isSubmitting ||
                  transferPaymentLists.length === 0 ||
                  debtAmount === undefined
                }
                type="submit"
                color="success"
                className="btn-next"
              >
                {!isSubmitting && (
                  <Pocket
                    size={14}
                    className="align-middle ml-sm-25 ml-0 mr-50"
                  />
                )}
                <span className="align-middle d-sm-inline-block d-none">
                  {isSubmitting ? "Menyimpan data..." : "Bayar"}
                </span>
              </Button>
            </div>
          </AvForm>
        </Col>
      </CardBody>

      <AddContactModal
        isShow={isAddNewContact}
        withAddress={false}
        handleShow={setIsAddNewContact}
        defaultBranchCode={branchCode}
      />
    </Card>
  );
};

export default BranchPaysDebtNowForm;
