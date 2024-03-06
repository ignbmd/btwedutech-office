import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import Select from "react-select";
import classnames from "classnames";
import { AvForm } from "availity-reactstrap-validation-safe";
import { Fragment, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import styles from "./Withdraw.module.css";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

import {
  Row,
  Col,
  FormGroup,
  FormFeedback,
  Label,
  Card,
  CardBody,
  CardHeader,
  Button,
} from "reactstrap";
import {
  getIdFromURLSegment,
  isFieldHasErrorMessage,
  showToast,
  getCsrf,
  formatNum,
} from "../../../utility/Utils";
registerPlugin(FilePondPluginFileValidateType);

const ConfirmWithdraw = () => {
  const withdraw_id = getIdFromURLSegment();
  const yupObjectSchema = {
    bank_number: yup
      .mixed()
      .test(
        "bank_number_is_required",
        "Wajib diisi",
        function (bankNumber, context) {
          return !(context.parent.bank_type?.value && !bankNumber);
        }
      ),
    npwp_number: yup.string().nullable(),
    status_transaction: yup
      .object()
      .typeError("Harus Dipilih")
      .required("Harus Dipilih"),
    reason: yup.array().when("status_transaction", {
      is: (status_transaction) => status_transaction?.value === "REJECTED",
      then: (schema) => yup.string().required("Harus Diisi"),
      otherwise: (schema) => yup.mixed().nullable(),
    }),
    payment_photo: yup.array().when("status_transaction", {
      is: (statusTransaction) => statusTransaction?.value === "SUCCESS",
      then: (schema) =>
        yup
          .array()
          .required("Bukti withdraw harus diisi")
          .min(1, "Bukti withdraw harus diisi"),
      otherwise: (schema) => yup.mixed().nullable(),
    }),
  };
  const statusTransaction = [
    {
      label: "SUKSES",
      value: "SUCCESS",
    },
    {
      label: "DITOLAK",
      value: "REJECTED",
    },
  ];
  const FormSchema = yup.object().shape(yupObjectSchema);
  const source = axios.CancelToken.source();

  const [withdraw, setWithdraw] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    getValues,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
    mode: "all",
    defaultValues: {
      payment_photo: [],
      tax_photo: [],
      status_transaction: "",
    },
  });
  const { status_transaction } = watch();

  async function fetchWithdraw() {
    const response = await axios.get(`/api/withdraw/${withdraw_id}`);
    const body = await response.data;
    return body?.data;
  }

  async function onSubmit() {
    setIsSubmitting(true);
    const formValues = getValues();
    const formData = new FormData();
    formData.append("payment_photo", formValues?.payment_photo[0]);
    formData.append("amount", withdraw?.amount);
    formData.append("status_transaction", formValues?.status_transaction.value);
    formData.append("affiliate_id", withdraw?.affiliate_id);
    formData.append("created_by", withdraw?.created_by);
    formData.append("updated_by", withdraw?.updated_by);
    formData.append("reason", formValues?.reason);
    axios
      .post(`/api/withdraw/process/${withdraw_id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRF-TOKEN": getCsrf(),
        },
      })
      .then(() => {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Proses Withdraw Berhasil",
        });
        setTimeout(() => {
          window.location.href = "/withdraw";
        }, 5000);
      })
      .catch((error) => {
        showToast({
          type: "error",
          title: "Terjadi kesalahan",
          message:
            error?.response?.data?.message ??
            "Sistem sedang dalam perbaikan, silakan coba lagi nanti",
        });
        setIsSubmitting(false);
      });
  }

  useEffect(() => {
    (async () => {
      const withDrawData = await fetchWithdraw();
      setWithdraw(withDrawData);
    })();
    return () => {
      clearInterval();
      clearTimeout();
    };
  }, []);

  useEffect(() => {
    setValue("reason", "");
    setValue("payment_photo", "");
  }, [status_transaction]);

  return (
    <Fragment>
      <AvForm onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardBody className="bg-light-primary">
            <Card>
              <CardHeader style={{ fontWeight: "bold", color: "black" }}>
                Informasi Withdraw
              </CardHeader>
              <CardBody>
                <Row>
                  <div className={clsx(styles["withdraw-info-container"])}>
                    <div>
                      <h6 className={clsx("text-muted")}>Nama Afiliasi</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {withdraw?.affiliate?.name}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>No. Handphone</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {withdraw?.affiliate?.phone}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>Email</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {withdraw?.affiliate?.email}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>Nama Bank</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {withdraw?.affiliate?.bank_type}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>No. Rekening</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {withdraw?.affiliate?.bank_number}
                      </h6>
                    </div>
                  </div>
                </Row>
              </CardBody>
            </Card>
            <Card>
              <CardHeader style={{ fontWeight: "bold", color: "black" }}>
                Nominal Withdraw
              </CardHeader>
              <CardBody>
                <Row>
                  <div className={clsx(styles["withdraw-info-container"])}>
                    <div>
                      <h6 className={clsx("text-muted")}>Nominal</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        Rp.{" "}
                        {withdraw?.amount
                          ? formatNum(withdraw?.amount)
                          : withdraw?.amount}
                      </h6>
                    </div>
                  </div>
                </Row>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Col>
                  <Controller
                    name="status_transaction"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup>
                          <Label
                            for="status_transaction"
                            className="form-label"
                            style={{ fontWeight: "bold", color: "black" }}
                          >
                            Status Transaksi
                          </Label>
                          <Select
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                                color: "black",
                              }),
                            }}
                            {...field}
                            isClearable={true}
                            options={statusTransaction}
                            classNamePrefix="select"
                            className={classnames("react-select", {
                              "is-invalid": isFieldHasErrorMessage(error),
                            })}
                            id="status_transaction"
                            placeholder="Pilih Status"
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />
                </Col>
              </CardBody>
            </Card>
            {status_transaction?.value === "REJECTED" && (
              <Card>
                <CardBody>
                  <Col md={12}>
                    <Controller
                      name="reason"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup>
                            <Label
                              for="reason"
                              className="form-label"
                              style={{ fontWeight: "bold", color: "black" }}
                            >
                              Alasan
                            </Label>
                            <textarea
                              {...rest}
                              id="reason"
                              cols={10}
                              rows={5}
                              ref={ref}
                              placeholder="Alasan...."
                              className={classnames(
                                "form-control react-select",
                                {
                                  "is-invalid": isFieldHasErrorMessage(error),
                                }
                              )}
                            ></textarea>
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />
                  </Col>
                </CardBody>
              </Card>
            )}
            {status_transaction?.value === "SUCCESS" ? (
              <Card>
                <CardHeader style={{ fontWeight: "bold", color: "black" }}>
                  Bukti Transfer
                </CardHeader>
                <CardBody>
                  <Col md={12}>
                    <Controller
                      name="payment_photo"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        return (
                          <FormGroup>
                            {/* <Label for="payment_photo" className="form-label">
                            Bukti Transfer
                          </Label> */}
                            <FilePond
                              acceptedFileTypes={["image/*"]}
                              name="payment_photo"
                              id="payment_photo"
                              instantUpload={true}
                              files={field.value}
                              onupdatefiles={(fileItems) => {
                                field.onChange(
                                  fileItems.map((fileItem) => fileItem.file)
                                );
                              }}
                              labelIdle="Unggah Bukti Transfer <span class='filepond--label-action'>Disini</span>"
                            />
                            {errors.payment_photo && (
                              <p
                                style={{
                                  width: "100%",
                                  marginTop: "0.25rem",
                                  fontSize: "0.857rem",
                                  color: "#ea5455",
                                }}
                              >
                                {errors.payment_photo.message}
                              </p>
                            )}
                          </FormGroup>
                        );
                      }}
                    />
                  </Col>
                </CardBody>
              </Card>
            ) : (
              ""
            )}
            <Col lg={12}>
              <div className="d-flex justify-content-end mt-2">
                <Button
                  type="submit"
                  color="success"
                  className="btn-next"
                  disabled={isSubmitting}
                >
                  <span className="align-middle d-sm-inline-block">
                    {isSubmitting ? "Memproses data..." : "Proses"}
                  </span>
                </Button>
              </div>
            </Col>
          </CardBody>
        </Card>
      </AvForm>
    </Fragment>
  );
};

export default ConfirmWithdraw;
