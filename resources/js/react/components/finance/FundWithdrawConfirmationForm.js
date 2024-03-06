import axios from "axios";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import { Plus, Save } from "react-feather";
import Cleave from "cleave.js/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import React, { useState, useRef, useEffect, Fragment } from "react";
import {
  Badge,
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
} from "reactstrap";
import {
  getLastSegment,
  isObjEmpty,
  priceFormatter,
  getUserFromBlade,
  getCsrf,
  showToast,
} from "../../utility/Utils";
import FileUpload from "../core/file-upload/FileUpload";
import { useFileUpload } from "../../hooks/useFileUpload";
import SpinnerCenter from "../core/spinners/Spinner";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const confirmationStatus = [
  { label: "Disetujui", value: "APPROVED" },
  { label: "Dibatalkan", value: "CANCELED" },
];

const user = getUserFromBlade();
const { branch_code: branchCode } = user;
const id = getLastSegment();
const yupValidationObject = {
  status: yup.object().typeError("Harus dipilih").required("Harus dipilih"),
  file: yup.mixed().when("status", {
    is: (s) => s?.value === "APPROVED",
    then: (schema) => schema.required("Bukti gambar harus diupload"),
    otherwise: (schema) => schema.notRequired(),
  }),
  source_account_code: yup
    .mixed()
    .typeError("Harus dipilih")
    .required("Harus dipilih"),
};
const FundWithdrawConfirmationForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fund, setFund] = useState();
  const [accounts, setAccounts] = useState(null);
  const [branchAccounts, setBranchAccounts] = useState(null);
  const [proofFile] = useState({ proof: [] });

  const formSchema = yup.object().shape(yupValidationObject);

  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      status: "",
    },
  });
  const { status } = watch();

  const {
    files,
    fileErrors,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
    checkIsFileValid,
  } = useFileUpload(proofFile);

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

  const submitHandler = async (data) => {
    trigger();
    if (!isObjEmpty(errors)) return;

    const formData = new FormData();
    const url =
      fund?.status === "APPROVED"
        ? `/api/finance/transfer-fund/proof/${id}`
        : `/api/finance/transfer-fund/confirm/${id}`;
    formData.append("file", data.file);
    formData.append("data", JSON.stringify(data));
    setIsSubmitting(true);
    try {
      const response = await axios.post(url, formData, {
        headers: {
          "X-CSRF-TOKEN": getCsrf(),
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.data;
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Penagihan dana berhasil dikonfirmasi",
      });
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

  const getFund = async () => {
    try {
      const response = await axios.get(`/api/finance/transfer-fund/${id}`);
      const data = response.data;
      return data?.data ?? null;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  useEffect(() => {
    (async () => {
      getAccounts();
      const transferFund = await getFund();
      setFund(transferFund);
    })();
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
    if (!fund) return;
    if (fund?.status === "APPROVED") {
      setValue(
        "status",
        confirmationStatus.find((status) => status.value === "APPROVED")
      );
      yupValidationObject.source_account_code = yup
        .mixed()
        .notRequired()
        .nullable();
    }
    setIsLoading(false);
  }, [fund]);

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
    <>
      {isLoading ? (
        <SpinnerCenter />
      ) : (
        <Card>
          <CardBody className={classnames(isSubmitting && "block-content")}>
            <Form onSubmit={handleSubmit(submitHandler)}>
              <Col md={6} className={classnames("mt-2 pl-0")}>
                <h1 className="mb-1">Konfirmasi Penagihan</h1>
                <p>Nominal: {priceFormatter(fund?.amount)}</p>
                <p>Bank Tujuan: {fund?.contact?.bank_account_type}</p>
                <p>No Rekening: {fund?.contact?.bank_account_number}</p>
              </Col>
              <hr />
              <Col md={6} className={classnames("mt-2 pl-0")}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup>
                        <Label className="form-label">Status Konfirmasi</Label>
                        <Select
                          {...field}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999,
                            }),
                          }}
                          isSearchable={false}
                          isDisabled={fund?.status === "APPROVED"}
                          options={confirmationStatus}
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
                {fund?.status !== "APPROVED" ? (
                  <Controller
                    name="source_account_code"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">Akun Sumber</Label>
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
                ) : null}

                <FormGroup>
                  <Label>Unggah Bukti Penagihan Dana</Label>

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

                {fund?.transfer_fund_attachment?.proof_path ? (
                  <img
                    src={fund?.transfer_fund_attachment?.proof_path}
                    width="100%"
                  />
                ) : null}

                <Button type="submit" color="gradient-success" className="mt-1">
                  Perbarui
                </Button>
              </Col>
            </Form>
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default FundWithdrawConfirmationForm;
