import Swal from "sweetalert2";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import withReactContent from "sweetalert2-react-content";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
// import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
// import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";
import { Pocket, PlusCircle, X } from "react-feather";
import FileUpload from "../../core/file-upload/FileUpload";
import { useFileUpload } from "../../../hooks/useFileUpload";
import Select from "react-select";
// import TransferPayment from "../../sale/SaleFormSteps/Summary/TransferPayment";
import {
  getBillId,
  priceFormatter,
  getCsrf,
  showToast,
  isObjEmpty,
  unformatPrice,
  getUserFromBlade,
  normalNumber,
  getLastSegment,
} from "../../../utility/Utils";
import axios from "axios";
import moment from "moment";
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
  Col,
} from "reactstrap";
import SpinnerCenter from "../../core/spinners/Spinner";
// import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/airbnb.css";
import ContentLoader from "react-content-loader";

const FormAddBranchPaymentMethod = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const FormSchema = yup.object().shape({
    transaction_method: yup.string().required("Wajib diisi"),
    rek_name: yup.string().when("is_bank_transfer", {
      is: true,
      then: (schema) => schema.required("Wajib diisi"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
    rek_number: yup.string().when("is_bank_transfer", {
      is: true,
      then: (schema) => schema.required("Wajib diisi"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
  });

  const {
    register,
    control,
    trigger,
    watch,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      rek_name: "",
      rek_number: "",
      transaction_method: "",
      is_bank_transfer: false,
    },
  });
  const { is_bank_transfer } = watch();

  const [proofFile] = useState({ proof: [] });
  const {
    files,
    fileErrors,
    setFiles,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
    checkIsFileValid,
  } = useFileUpload(proofFile);

  const submitHandler = async (data) => {
    trigger();
    setIsSubmitting(true);
    const isFileValid = !is_bank_transfer ? true : checkIsFileValid();
    if (!isFileValid) {
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: "Wajib upload foto rekening bank",
      });
      return;
    }
    if (!isObjEmpty(errors)) return;
    const formData = new FormData();
    formData.append("transaction_method", data?.transaction_method);
    formData.append("rek_name", data?.rek_name);
    formData.append("rek_number", data?.rek_number);
    formData.append("is_bank_transfer", data?.is_bank_transfer);
    formData.append("file", data.file);
    createBranchPaymentMethod(formData);
  };

  const createBranchPaymentMethod = async (data) => {
    try {
      await axios.post(`/api/branch-payment-method/${getLastSegment()}`, data, {
        headers: {
          "X-CSRF-TOKEN": getCsrf(),
          "Content-Type": "multipart/form-data",
        },
      });
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Proses tambah data berhasil",
      });
      window.location.href = `/cabang/metode-pembayaran/${getLastSegment()}`;
    } catch (error) {
      const errObj = error?.response?.data?.data || error?.response?.data;
      const errMessage = errObj?.message
        ? errObj?.message
        : "Sistem dalam perbaikan, harap mencoba beberapa saat lagi";
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: errMessage,
      });
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setValue("file", files.proof[0]);
  }, [files.proof]);

  useEffect(() => {
    if (!is_bank_transfer) {
      setValue("rek_name", "");
      setValue("rek_number", "");
      setValue("file", undefined);
    }
  }, [is_bank_transfer]);

  return (
    <>
      <Card className="card-app-design">
        <CardBody>
          <Col md={6}>
            <AvForm className="mt-1" onSubmit={handleSubmit(submitHandler)}>
              <Controller
                name="transaction_method"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">
                        Nama Metode Pembayaran
                      </Label>
                      <Input
                        {...rest}
                        id="transaction_method"
                        innerRef={ref}
                        invalid={error && true}
                        placeholder="Inputkan Nama Kategori Pembayaran"
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              <Controller
                name="is_bank_transfer"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, value: isActive, ...rest } = field;
                  return (
                    <div className="mb-1">
                      <Label>Apakah merupakan pembayaran transfer bank?</Label>
                      <CustomInput
                        {...rest}
                        className="mt-50"
                        innerRef={ref}
                        type="switch"
                        id="is_bank_transfer"
                        checked={isActive}
                        label={isActive ? "Ya" : "Tidak"}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </div>
                  );
                }}
              />

              {is_bank_transfer && (
                <>
                  <Controller
                    name="rek_number"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">
                            Nomor Rekening Bank
                          </Label>
                          <Cleave
                            {...field}
                            options={normalNumber}
                            className={classnames("form-control", {
                              "is-invalid": error,
                            })}
                            onChange={(e) => field.onChange(e.target.rawValue)}
                            value={field.value ?? 0}
                            placeholder="Inputkan Nomor Rekening Bank"
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />

                  <Controller
                    name="rek_name"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">
                            Nama Rekening Bank
                          </Label>
                          <Input
                            {...rest}
                            id="rek_name"
                            innerRef={ref}
                            invalid={error && true}
                            placeholder="Inputkan Nama Rekening Bank"
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />

                  <FormGroup className="flex-fill">
                    <Label className="form-label">
                      Unggah Foto Rekening Bank
                    </Label>
                    <FileUpload
                      {...registerFile("proof", true)}
                      changed={handleSelectedFile}
                      maxFileSize="5mb"
                      onerror={(e) => handleFileError("proof", e)}
                      name="proof"
                      className={classnames({
                        "mb-1": true,
                        "filepond-is-invalid": errors?.file?.message,
                      })}
                    />
                  </FormGroup>
                </>
              )}

              <div className="d-flex justify-content-end mt-4">
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  color="success"
                  className="btn-next"
                >
                  <span className="align-middle d-sm-inline-block d-none">
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </span>
                </Button>
              </div>
            </AvForm>
          </Col>
        </CardBody>
      </Card>
    </>
  );
};

export default FormAddBranchPaymentMethod;
