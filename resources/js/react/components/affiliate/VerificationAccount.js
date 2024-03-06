import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import Select from "react-select";
import classnames from "classnames";
import { AvForm } from "availity-reactstrap-validation-safe";
import { Fragment, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import styles from "./Affiliate.module.css";
import {
  Row,
  Col,
  FormGroup,
  Label,
  FormFeedback,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
} from "reactstrap";
import {
  getIdFromURLSegment,
  isFieldHasErrorMessage,
  showToast,
} from "../../utility/Utils";

const VerificationAffiliate = () => {
  const affiliateID = getIdFromURLSegment();
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
    status_verified: yup
      .object()
      .typeError("Harus dipilih")
      .required("Harus dipilih"),
    reason: yup
      .string()
      .test(
        "reason_is_required_when_verification_status_rejected",
        "Harus diisi",
        function (value, context) {
          let isValid = true;
          if (
            context?.parent?.status_verified?.value == "REJECTED" &&
            !value.trim()
          ) {
            isValid = false;
          }
          return isValid;
        }
      ),
  };
  const FormSchema = yup.object().shape(yupObjectSchema);
  const source = axios.CancelToken.source();

  const [affiliate, setAffiliate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [bankChecked, setBankChecked] = useState(false);
  const [npwpChecked, setNpwpChecked] = useState(false);
  const [identityChecked, setIdentityChecked] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  const bankImageRef = useRef();
  const npwpImageRef = useRef();
  const identityImageRef = useRef();

  const { control, getValues, setValue, handleSubmit, watch } = useForm({
    resolver: yupResolver(FormSchema),
    mode: "all",
    defaultValues: {
      bank_number: "",
      npwp_number: "",
      identity_number: "",
      status_verified: "",
      bank_data_checked: false,
      npwp_data_checked: false,
      reason: "",
    },
  });
  const { status_verified, reason } = watch();

  const statusVerified = [
    {
      label: "Terverifikasi",
      value: "VERIFIED",
    },
    {
      label: "Verifikasi Ditolak",
      value: "REJECTED",
    },
  ];

  const closeModal = () => {
    setSelectedImage("");
    setModalIsOpen(false);
  };

  const handleImageLoadError = (ref) => {
    ref.current.src =
      "https://btw-cdn.com/assets/office/image/image_not_available_.jpg";
  };

  async function fetchAffiliate() {
    const response = await axios.get(`/api/affiliates/${affiliateID}`);
    const body = await response.data;
    return body?.data;
  }

  function getFormPayload() {
    const formValues = getValues();
    return {
      affiliate_id: affiliate?.id,
      verified_status: formValues?.status_verified.value,
      reason: formValues?.reason ? formValues?.reason : null,
    };
  }

  function setAffiliateInitialFormValues() {
    setValue("bank_number", affiliate?.bank_number);
    setValue("npwp_number", affiliate?.npwp_number);
    setValue("identity_number", affiliate?.identity_number);
  }
  async function onSubmit() {
    setIsSubmitting(true);
    const payload = getFormPayload();
    axios
      .put(`/api/affiliates/verification`, {
        ...payload,
        cancelToken: source.token,
      })
      .then(() => {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data afiliasi berhasil diperbarui",
        });
        setTimeout(() => {
          window.location.href = "/mitra";
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
      const affiliateData = await fetchAffiliate();
      setAffiliate(affiliateData);
    })();
    return () => {
      clearInterval();
      clearTimeout();
    };
  }, []);

  useEffect(() => {
    // Periksa apakah ketiga checkbox telah dicentang
    if (bankChecked && identityChecked) {
      setAllChecked(true);
    } else {
      setAllChecked(false);
    }
  }, [bankChecked, identityChecked]);

  useEffect(() => {
    if (!affiliate) return;
    setAffiliateInitialFormValues();
  }, [affiliate]);

  return (
    <Fragment>
      <AvForm onSubmit={handleSubmit(onSubmit)}>
        <Card className="bg-light-primary">
          <CardBody>
            <Card>
              <CardHeader style={{ fontWeight: "bold", color: "black" }}>
                Informasi Afiliasi
              </CardHeader>
              <CardBody>
                <Row>
                  <div className={clsx(styles["affiliate-info-container"])}>
                    <div>
                      <h6 className={clsx("text-muted")}>Nama Afiliasi</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {affiliate?.name}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>No. Handphone</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {affiliate?.phone}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>Email</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {affiliate?.email}
                      </h6>
                    </div>
                    <div>
                      <h6 className={clsx("text-muted")}>Kode Referal</h6>
                      <h6 className={clsx("font-weight-bolder")}>
                        {affiliate?.ref_code}
                      </h6>
                    </div>
                  </div>
                </Row>
              </CardBody>
            </Card>
            <Card>
              <CardHeader style={{ fontWeight: "bold", color: "black" }}>
                Informasi No. Indentisas (Wajib)
              </CardHeader>
              <CardBody>
                <div
                  className="d-flex align-items-center"
                  style={{ gap: "20px" }}
                >
                  <img
                    src={affiliate?.identity_photo ?? ""}
                    alt="Identity Image"
                    ref={identityImageRef}
                    style={{
                      width: "200px",
                      height: "auto",
                      marginBottom: "20px",
                    }}
                    onClick={() => {
                      setSelectedImage(identityImageRef.current.src);
                      setModalIsOpen(true);
                    }}
                    onError={() => handleImageLoadError(identityImageRef)}
                  />
                  <Controller
                    name="identity_data_checked"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup>
                          <label className="d-flex">
                            <input
                              {...field}
                              type="checkbox"
                              checked={identityChecked}
                              onChange={() =>
                                setIdentityChecked(!identityChecked)
                              }
                              style={{ marginRight: "8px" }}
                            />
                            <span>Data Sudah Benar</span>
                          </label>
                        </FormGroup>
                      );
                    }}
                  />
                </div>
                <Row>
                  <div style={{ marginLeft: "15px" }}>
                    <h6 className={clsx("text-muted")}>No. Identitas</h6>
                    <h6 className={clsx("font-weight-bolder")}>
                      {affiliate?.identity_number
                        ? affiliate?.identity_number
                        : "-"}
                    </h6>
                  </div>
                </Row>
              </CardBody>
            </Card>
            <Card>
              <CardHeader style={{ fontWeight: "bold", color: "black" }}>
                Informasi Rekening Bank (Wajib)
              </CardHeader>
              <CardBody>
                <div
                  className="d-flex align-items-center"
                  style={{ gap: "20px" }}
                >
                  <img
                    src={affiliate?.bank_photo ?? ""}
                    alt="Bank Image"
                    ref={bankImageRef}
                    style={{
                      width: "200px",
                      height: "auto",
                      marginBottom: "20px",
                    }}
                    onClick={() => {
                      setSelectedImage(bankImageRef.current.src);
                      setModalIsOpen(true);
                    }}
                    onError={() => handleImageLoadError(bankImageRef)}
                  />
                  <Controller
                    name="bank_data_checked"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup>
                          <label className="d-flex">
                            <input
                              {...field}
                              type="checkbox"
                              checked={bankChecked}
                              onChange={() => setBankChecked(!bankChecked)}
                              style={{ marginRight: "8px" }}
                            />
                            <span>Data Sudah Benar</span>
                          </label>
                        </FormGroup>
                      );
                    }}
                  />
                </div>
                <Row>
                  <div style={{ marginLeft: "15px" }}>
                    <h6 className={clsx("text-muted")}>No. Rekening Bank</h6>
                    <h6 className={clsx("font-weight-bolder")}>
                      {affiliate?.bank_number ? affiliate?.bank_number : "-"}
                    </h6>
                  </div>
                </Row>
              </CardBody>
            </Card>
            <Card>
              <CardHeader style={{ fontWeight: "bold", color: "black" }}>
                Informasi NPWP (Opsional)
              </CardHeader>
              <CardBody>
                <div
                  className="d-flex align-items-center"
                  style={{ gap: "20px" }}
                >
                  <img
                    src={affiliate?.npwp_photo ?? ""}
                    alt="NPWP Image"
                    ref={npwpImageRef}
                    style={{
                      width: "200px",
                      height: "auto",
                      marginBottom: "20px",
                    }}
                    onClick={() => {
                      setSelectedImage(npwpImageRef.current.src);
                      setModalIsOpen(true);
                    }}
                    onError={() => handleImageLoadError(npwpImageRef)}
                  />
                  <Controller
                    name="npwp_data_checked"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup>
                          <label className="d-flex">
                            <input
                              {...field}
                              type="checkbox"
                              checked={npwpChecked}
                              onChange={() => setNpwpChecked(!npwpChecked)}
                              style={{ marginRight: "8px" }}
                            />
                            <span>Data Sudah Benar</span>
                          </label>
                        </FormGroup>
                      );
                    }}
                  />
                </div>
                <Row>
                  <div style={{ marginLeft: "15px" }}>
                    <h6 className={clsx("text-muted")}>No. NPWP</h6>
                    <h6 className={clsx("font-weight-bolder")}>
                      {affiliate?.npwp_number ? affiliate?.npwp_number : "-"}
                    </h6>
                  </div>
                </Row>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Col>
                  <Controller
                    name="status_verified"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup>
                          <Label for="status_verified" className="form-label">
                            Status
                          </Label>
                          <Select
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                            {...field}
                            isClearable={true}
                            options={statusVerified}
                            classNamePrefix="select"
                            className={classnames("react-select", {
                              "is-invalid": isFieldHasErrorMessage(error),
                            })}
                            id="status_verified"
                            placeholder="Pilih Status Afiliasi"
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />
                </Col>
                {status_verified?.value == "REJECTED" ? (
                  <Col>
                    <Controller
                      name="reason"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup>
                            <Label for="reason" className="form-label">
                              Alasan Verifikasi Akun Ditolak
                            </Label>
                            <textarea
                              {...rest}
                              id="address"
                              cols={10}
                              rows={5}
                              ref={ref}
                              placeholder="Data tidak sesuai, data kurang lengkap, dll"
                              className={classnames("form-control", {
                                "is-invalid": Boolean(error?.message),
                              })}
                            ></textarea>
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />
                  </Col>
                ) : (
                  ""
                )}
              </CardBody>
            </Card>
            <Col lg={12}>
              <div className="d-flex justify-content-end mt-2">
                <Button
                  type="submit"
                  color="success"
                  className="btn-next"
                  disabled={
                    isSubmitting ||
                    !allChecked ||
                    (status_verified?.value == "REJECTED" && !reason.trim())
                  }
                >
                  <span className="align-middle d-sm-inline-block">
                    {isSubmitting ? "Memperbarui data..." : "Perbarui"}
                  </span>
                </Button>
              </div>
            </Col>
          </CardBody>
        </Card>

        <Modal isOpen={modalIsOpen} toggle={closeModal}>
          <ModalHeader toggle={closeModal}></ModalHeader>
          <ModalBody>
            <img
              src={selectedImage}
              alt="Selected Image"
              style={{ width: "100%" }}
            />
          </ModalBody>
        </Modal>
      </AvForm>
    </Fragment>
  );
};

export default VerificationAffiliate;
