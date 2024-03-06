import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { AvForm } from "availity-reactstrap-validation-safe";
import { Fragment, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import styles from "./TaxPayment.module.css";
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

const ProcessTaxPayment = () => {
  const taxPaymentId = getIdFromURLSegment();
  const yupObjectSchema = {
    payment_photo: yup
      .array()
      .required("Bukti Pembayaran Pajak harus diisi")
      .min(1, "Bukti Pembayaran Pajak harus diisi"),
  };
  const FormSchema = yup.object().shape(yupObjectSchema);
  const source = axios.CancelToken.source();

  const [taxPayment, setTaxPayment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    getValues,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
    mode: "all",
    defaultValues: {
      payment_photo: [],
      tax_photo: [],
    },
  });

  async function fetchTaxPayment() {
    const response = await axios.get(`/api/tax-payment/${taxPaymentId}`);
    const body = await response.data;
    return body?.data;
  }

  async function onSubmit() {
    setIsSubmitting(true);
    const formValues = getValues();
    const formData = new FormData();
    formData.append("payment_photo", formValues?.payment_photo[0]);
    formData.append("affiliate_id", taxPayment?.affiliate_id);
    formData.append("id", taxPaymentId);
    axios
      .post(`/api/tax-payment/process/${taxPaymentId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRF-TOKEN": getCsrf(),
        },
      })
      .then(() => {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Proses Pembayaran Pajak Berhasil",
        });
        setTimeout(() => {
          window.location.href = "/pembayaran-pajak";
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
      const taxPaymentData = await fetchTaxPayment();
      setTaxPayment(taxPaymentData);
    })();
    return () => {
      clearInterval();
      clearTimeout();
    };
  }, []);

  return (
    <Fragment>
      <AvForm onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardBody className="bg-light-primary">
            <Card>
              <CardHeader style={{ fontWeight: "bold", color: "black" }}>
                Informasi Mitra
              </CardHeader>
              <CardBody>
                <Row>
                  <div className={clsx(styles["taxPayment-info-container"])}>
                    <div>
                      <h6 className={clsx("text-muted")}>Nama Afiliasi</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {taxPayment?.affiliate?.name ?? "-"}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>No. Handphone</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {taxPayment?.affiliate?.phone ?? "-"}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>Email</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {taxPayment?.affiliate?.email ?? "-"}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>No. NPWP</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {taxPayment?.affiliate?.npwp_number ?? "-"}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>No. NIK / KTP</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {taxPayment?.affiliate?.identity_number ?? "-"}
                      </h6>
                    </div>
                  </div>
                </Row>
              </CardBody>
            </Card>
            <Card>
              <CardHeader style={{ fontWeight: "bold", color: "black" }}>
                Nominal Pajak
              </CardHeader>
              <CardBody>
                <Row>
                  <div className={clsx(styles["taxPayment-info-container"])}>
                    <div>
                      <h6 className={clsx("text-muted")}>Nominal</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        Rp.{" "}
                        {taxPayment?.amount
                          ? formatNum(taxPayment?.amount)
                          : taxPayment?.amount}
                      </h6>
                    </div>
                  </div>
                </Row>
              </CardBody>
            </Card>
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

export default ProcessTaxPayment;
