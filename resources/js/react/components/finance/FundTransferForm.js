import axios from "axios";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import { Save } from "react-feather";
import Cleave from "cleave.js/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import React, { useState, useRef, useEffect, Fragment } from "react";
import FileUpload from "../core/file-upload/FileUpload";
import { useFileUpload } from "../../hooks/useFileUpload";
import {
  Button,
  Card,
  CardBody,
  Col,
  CustomInput,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Spinner,
} from "reactstrap";
import {
  getLastSegment,
  isObjEmpty,
  priceFormatter,
  getCsrf,
  showToast,
} from "../../utility/Utils";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const sourceAccountCodes = [
  {
    label: (
      <span>
        <img
          src="https://btw-cdn.com/assets/payment/logo/midtrans.webp"
          width={100}
        />
      </span>
    ),
    accountCode: 10009,
    accountId: 929,
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
    accountCode: 10005,
    accountId: 5,
  },
];

const banks = [
  { label: "BCA", value: "BCA" },
  { label: "BNI", value: "BNI" },
  { label: "BRI", value: "BRI" },
];

const FundTransferForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState(null);
  const [accountTotalAmount, setAccountTotalAmount] = useState(null);
  const [branchAccounts, setBranchAccounts] = useState(null);
  const [proofFile] = useState({ proof: [] });

  const formSchema = yup.object().shape({
    file: yup.mixed().required("Bukti pembayaran harus diupload"),
    amount: yup
      .number()
      .min(1, "Tidak boleh 0 atau kurang")
      .max(
        accountTotalAmount,
        `Tidak boleh melebihi ${priceFormatter(accountTotalAmount)}`
      )
      .typeError("Harus diisi")
      .required("Harus diisi"),
    target_account_code: yup
      .mixed()
      .typeError("Harus dipilih")
      .required("Harus dipilih"),
  });

  const {
    watch,
    control,
    trigger,
    setValue,
    setError,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });
  const { source_account_code } = watch();

  const {
    files,
    fileErrors,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
    checkIsFileValid,
  } = useFileUpload(proofFile);
  const submitHandler = async (data) => {
    trigger();
    if (!isObjEmpty(errors)) return;
    createFundTransfer(data);
  };

  const createFundTransfer = async (data) => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("data", JSON.stringify(data));
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/finance/transfer-fund/central`,
        formData,
        {
          headers: {
            "X-CSRF-TOKEN": getCsrf(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Proses transfer dana berhasil",
      });
      const data = await response.data;
      redirectToIndex();
    } catch (error) {
      console.error(error);
      const errObj = error.response.data?.data || error.response.data;
      const errMessage = errObj?.message
        ? errObj?.message
        : "Sistem dalam perbaikan, harap mencoba beberapa saat lagi";
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: errMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectToIndex = () => (window.location.href = "/keuangan");

  const getAccounts = async () => {
    try {
      const response = await axios.get("/api/finance/coa");
      const data = response.data;
      setAccounts(data?.data);
      return data?.data ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getAccountTotalAmount = async (account_code) => {
    try {
      const response = await axios.get(
        `/api/finance/journal-records/calculate-amount`,
        { params: { account_code: account_code } }
      );
      const data = response.data;
      setAccountTotalAmount(data?.data);
      return data?.data ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    getAccounts();
  }, []);

  useEffect(() => {
    if (!accounts) return;
    setBranchAccounts(
      accounts.filter(
        (value) =>
          value.branch_code === "PT0000" &&
          value.default_position === "DEBIT" &&
          value.status
      )
    );
  }, [accounts]);

  useEffect(() => {
    if (!source_account_code) return;
    setAccountTotalAmount(null);
    getAccountTotalAmount(source_account_code?.accountCode);
  }, [source_account_code]);

  useEffect(() => {
    setValue("file", files.proof[0]);
  }, [files.proof]);

  useEffect(() => {
    if (!checkIsFileValid())
      setError("file", {
        type: "manual",
        message: fileErrors?.proof?.[0] ?? "",
      });
  }, [fileErrors.proof]);

  return (
    <Card>
      <CardBody className={classnames(isSubmitting && "block-content")}>
        <Form onSubmit={handleSubmit(submitHandler)}>
          <Col md={6} className={classnames("mt-2 pl-0")}>
            <Controller
              name="source_account_code"
              control={control}
              defaultValue={sourceAccountCodes[0]}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup className="flex-fill">
                    <Select
                      {...field}
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
                      // isLoading={isFetchingTcCategory}
                      options={sourceAccountCodes}
                      // getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.accountCode}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": error && true,
                      })}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
            {accountTotalAmount === null ? (
              <Spinner />
            ) : (
              <>
                <h6>Total Saldo</h6>
                <h1>{priceFormatter(accountTotalAmount)}</h1>
              </>
            )}
          </Col>
          <hr />
          <Col md={6} className={classnames("mt-2 pl-0")}>
            <Controller
              id="amount"
              name="amount"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormGroup>
                  <label htmlFor="amount">Nominal Penarikan</label>
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
                      placeholder="Inputkan nominal penarikan"
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </InputGroup>
                </FormGroup>
              )}
            />

            <Controller
              name="target_account_code"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Akun Tujuan</Label>
                    <Select
                      {...field}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                      isSearchable={false}
                      // isLoading={isFetchingTcCategory}
                      options={branchAccounts}
                      getOptionLabel={(option) =>
                        `${option.name} - ${option.account_code}`
                      }
                      getOptionValue={(option) => option?.account_code}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": error && true,
                      })}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <FormGroup>
              <Label>Unggah Bukti Penarikan Dana</Label>

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
              <FormFeedback>{errors?.file?.message}</FormFeedback>
            </FormGroup>

            <Button type="submit" color="gradient-success">
              Proses
            </Button>
          </Col>
        </Form>
      </CardBody>
    </Card>
  );
};

export default FundTransferForm;
