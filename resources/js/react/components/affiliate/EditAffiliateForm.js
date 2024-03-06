import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useState } from "react";
import {
  Label,
  Input,
  FormGroup,
  CustomInput,
  Row,
  Col,
  Button,
  FormFeedback,
} from "reactstrap";
import axios from "axios";
import { AvForm } from "availity-reactstrap-validation-safe";
import {
  normalNumber,
  showToast,
  getIdFromURLSegment,
  isFieldHasErrorMessage,
} from "../../utility/Utils";
import {
  fetchActivationStatusInputLabel,
  fetchWithdrawStatusInputLabel,
  fetchPhoneVerificationStatusInputLabel,
} from "../../utility/affiliate";
import { affiliateTypes, bankTypes } from "../../data/affiliate/affiliate-data";
import SpinnerCenter from "../core/spinners/Spinner";
import { Eye, EyeOff } from "react-feather";

const affiliateID = getIdFromURLSegment();

const EditAffiliateForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmationPassword, setShowConfirmationPassword] =
    useState(false);
  const [affiliate, setAffiliate] = useState(null);

  const yupObjectSchema = {
    name: yup.string().required("Harus diisi"),
    address: yup.string().required("Harus diisi"),
    phone: yup.string().required("Harus diisi"),
    affiliate_type: yup
      .object()
      .typeError("Harus dipilih")
      .required("Harus dipilih"),
    bank_type: yup
      .mixed()
      .test(
        "bank_type_is_required",
        "Wajib dipilih",
        function (bankType, context) {
          return !(context.parent.bank_number && !bankType?.value);
        }
      ),
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
    identity_number: yup.string().nullable(),
    password: yup
      .string()
      .test("password_is_required", "Harus diisi", function (value, context) {
        let isValid = true;
        if (!value && context.parent.password_confirmation) isValid = false;
        return isValid;
      })
      .test(
        "password_minimum_is_8_character",
        "Minimal 8 karakter",
        function (value, _) {
          let isValid = true;
          if (value && value.length < 8) isValid = false;
          return isValid;
        }
      ),
    password_confirmation: yup
      .string()
      .test(
        "password_confirmation_is_required",
        "Harus diisi",
        function (value, context) {
          let isValid = true;
          if (!value && context.parent.password) isValid = false;
          return isValid;
        }
      )
      .test(
        "password_is_not_match",
        "Password tidak sesuai",
        function (value, context) {
          let isValid = true;
          if (value !== context.parent.password) {
            isValid = false;
          }
          return isValid;
        }
      ),
  };

  const FormSchema = yup.object().shape(yupObjectSchema);
  const source = axios.CancelToken.source();

  const { control, getValues, setValue, handleSubmit } = useForm({
    resolver: yupResolver(FormSchema),
    mode: "all",
    defaultValues: {
      affiliate_type: "",
      name: "",
      address: "",
      phone: "",
      bank_type: "",
      bank_number: "",
      npwp_number: "",
      identity_number: "",
      password: "",
      password_confirmation: "",
    },
  });

  function getFormPayload() {
    const formValues = getValues();
    return {
      name: formValues?.name,
      email: affiliate?.email,
      address: formValues?.address,
      phone: formValues?.phone,
      affiliate_type: formValues?.affiliate_type?.value,
      bank_type: formValues?.bank_type?.value,
      bank_number: formValues?.bank_number,
      npwp_number: formValues?.npwp_number,
      identity_number: formValues?.identity_number,
      activation_status: formValues?.activation_status,
      withdraw_status: formValues?.withdraw_status,
      is_phone_verified: true,
      password: formValues?.password,
    };
  }

  function setAffiliateInitialFormValues() {
    setValue("name", affiliate?.name);
    setValue("address", affiliate?.address);
    setValue("phone", affiliate?.phone);
    setValue(
      "affiliate_type",
      affiliateTypes.find(
        (affiliateType) => affiliateType.value == affiliate?.affiliate_type
      )
    );
    setValue(
      "bank_type",
      bankTypes.find((bankType) => bankType.value == affiliate?.bank_type)
    );
    setValue("bank_number", affiliate?.bank_number);
    setValue("npwp_number", affiliate?.npwp_number);
    setValue("identity_number", affiliate?.identity_number);
    setValue("activation_status", affiliate?.activation_status);
    setValue("withdraw_status", affiliate?.withdraw_status);
    setValue("is_phone_verified", affiliate?.is_phone_verified);
    setIsLoading(false);
  }

  async function fetchAffiliate() {
    const response = await axios.get(`/api/affiliates/${affiliateID}`);
    const body = await response.data;
    return body?.data;
  }

  async function onSubmit() {
    setIsSubmitting(true);
    const payload = getFormPayload();
    axios
      .put(`/api/affiliates/${affiliateID}`, {
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
    if (!affiliate) return;
    setAffiliateInitialFormValues();
    if (!affiliate?.school_id) {
      affiliateTypes.pop();
    }
  }, [affiliate]);

  return isLoading ? (
    <SpinnerCenter />
  ) : (
    <Fragment>
      <AvForm onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={6}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup className="flex-fill">
                    <Label for="name" className="form-label">
                      Nama
                    </Label>
                    <Input
                      {...rest}
                      id="name"
                      innerRef={ref}
                      invalid={isFieldHasErrorMessage(error)}
                      placeholder="John Doe"
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup>
                    <Label for="password" className="form-label">
                      Password Akun
                    </Label>
                    <div
                      className={classnames(
                        "input-group input-group-merge form-password-toggle",
                        {
                          "is-invalid": Boolean(error?.message),
                        }
                      )}
                    >
                      <Input
                        type={showPassword ? "text" : "password"}
                        className={classnames(
                          "form-control form-control-merge"
                        )}
                        id="password"
                        name="password"
                        tabIndex="2"
                        placeholder="••••••••"
                        aria-describedby="password"
                        innerRef={field.ref}
                        invalid={Boolean(error?.message)}
                        {...field}
                      />
                      <span className="input-group-text cursor-pointer">
                        {showPassword ? (
                          <EyeOff
                            size={10}
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        ) : (
                          <Eye
                            size={10}
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        )}
                      </span>
                    </div>
                    {error?.message && (
                      <div
                        style={{
                          width: "100%",
                          marginTop: "0.25rem",
                          fontSize: "0.857rem",
                          color: "#ea5455",
                        }}
                      >
                        {error?.message}
                      </div>
                    )}
                    <p>
                      <small>
                        Bagian ini bisa dikosongkan jika{" "}
                        <mark>Konfirmasi Password Akun</mark> tidak diisi
                      </small>
                    </p>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="password_confirmation"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup>
                    <Label for="password_confirmation" className="form-label">
                      Konfirmasi Password Akun
                    </Label>
                    <div
                      className={classnames(
                        "input-group input-group-merge form-password-toggle",
                        {
                          "is-invalid": Boolean(error?.message),
                        }
                      )}
                    >
                      <Input
                        type={showConfirmationPassword ? "text" : "password"}
                        className={classnames(
                          "form-control form-control-merge"
                        )}
                        id="password_confirmation"
                        name="password_confirmation"
                        tabIndex="2"
                        placeholder="••••••••"
                        aria-describedby="password_confirmation"
                        innerRef={field.ref}
                        invalid={Boolean(error?.message)}
                        {...field}
                      />
                      <span className="input-group-text cursor-pointer">
                        {showConfirmationPassword ? (
                          <EyeOff
                            size={10}
                            onClick={() =>
                              setShowConfirmationPassword(
                                !showConfirmationPassword
                              )
                            }
                          />
                        ) : (
                          <Eye
                            size={10}
                            onClick={() =>
                              setShowConfirmationPassword(
                                !showConfirmationPassword
                              )
                            }
                          />
                        )}
                      </span>
                    </div>
                    {error?.message && (
                      <div
                        style={{
                          width: "100%",
                          marginTop: "0.25rem",
                          fontSize: "0.857rem",
                          color: "#ea5455",
                        }}
                      >
                        {error?.message}
                      </div>
                    )}
                    <p>
                      <small>
                        Bagian ini bisa dikosongkan jika{" "}
                        <mark>Password Akun</mark> tidak diisi
                      </small>
                    </p>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="address"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup className="flex-fill">
                    <Label for="address" className="form-label">
                      Alamat
                    </Label>
                    <textarea
                      {...rest}
                      id="address"
                      cols={10}
                      rows={5}
                      ref={ref}
                      placeholder="Jalan Pulau Maluku Gang Melati 17 No. 8"
                      className={classnames("form-control react-select", {
                        "is-invalid": isFieldHasErrorMessage(error),
                      })}
                    ></textarea>
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill">
                    <Label for="phone" className="form-label">
                      No. HP
                    </Label>
                    <Cleave
                      {...field}
                      options={normalNumber}
                      className={classnames("form-control", {
                        "is-invalid": isFieldHasErrorMessage(error),
                      })}
                      id="phone"
                      placeholder="Contoh: 081234567890, 6281234567890"
                      onChange={(e) => field.onChange(e.target.rawValue)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="affiliate_type"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup>
                    <Label for="affiliate_type" className="form-label">
                      Tipe
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      {...field}
                      options={affiliateTypes}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": isFieldHasErrorMessage(error),
                      })}
                      id="affiliate_type"
                      placeholder="Pilih tipe"
                      isDisabled={Boolean(affiliate?.school_id)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="bank_type"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup>
                    <Label for="bank_type" className="form-label">
                      Bank
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      {...field}
                      isClearable={true}
                      options={bankTypes}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": isFieldHasErrorMessage(error),
                      })}
                      id="bank_type"
                      placeholder="Pilih Bank"
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                    <p>
                      <small>
                        Bagian ini bisa dikosongkan jika{" "}
                        <mark>No.Rekening Bank</mark> tidak diisi
                      </small>
                    </p>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="bank_number"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill">
                    <Label for="bank_number" className="form-label">
                      No. Rekening Bank
                    </Label>
                    <Cleave
                      {...field}
                      options={normalNumber}
                      className={classnames("form-control", {
                        "is-invalid": isFieldHasErrorMessage(error),
                      })}
                      id="bank_number"
                      placeholder="Nomor Rekening Bank"
                      onChange={(e) => field.onChange(e.target.rawValue)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                    <p>
                      <small>
                        Bagian ini bisa dikosongkan jika <mark>Bank</mark> tidak
                        dipilih
                      </small>
                    </p>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="npwp_number"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill">
                    <Label for="npwp_number" className="form-label">
                      NPWP (Opsional)
                    </Label>
                    <Cleave
                      {...field}
                      options={normalNumber}
                      className={classnames("form-control", {
                        "is-invalid": isFieldHasErrorMessage(error),
                      })}
                      id="npwp_number"
                      placeholder="Nomor Pokok Wajib Pajak"
                      onChange={(e) => field.onChange(e.target.rawValue)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="identity_number"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill">
                    <Label for="identity_number" className="form-label">
                      No. Identitas (Opsional)
                    </Label>
                    <Cleave
                      {...field}
                      options={normalNumber}
                      className={classnames("form-control", {
                        "is-invalid": isFieldHasErrorMessage(error),
                      })}
                      id="identity_number"
                      placeholder="NIK KTP, Nomor Kartu Pelajar, atau semacamnya"
                      onChange={(e) => field.onChange(e.target.rawValue)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            {affiliate?.is_verified ? (
              <Fragment>
                <Controller
                  name="activation_status"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, value: isActive, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label for="activation_status">Status Aktivasi</Label>
                        <CustomInput
                          {...rest}
                          className="mt-50"
                          innerRef={ref}
                          type="switch"
                          name="activation_status"
                          id="activation_status"
                          checked={isActive}
                          label={fetchActivationStatusInputLabel(isActive)}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
                <Controller
                  name="withdraw_status"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, value: isActive, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label for="withdraw_status">
                          Bisa Melakukan Withdraw
                        </Label>
                        <CustomInput
                          {...rest}
                          className="mt-50"
                          innerRef={ref}
                          type="switch"
                          name="withdraw_status"
                          id="withdraw_status"
                          checked={isActive}
                          label={fetchWithdrawStatusInputLabel(isActive)}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
              </Fragment>
            ) : null}

            <Controller
              name="is_phone_verified"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, value: isActive, ...rest } = field;
                return (
                  <FormGroup className="flex-fill d-none">
                    <Label for="is_phone_verified">
                      Status Verifikasi No.HP
                    </Label>
                    <CustomInput
                      {...rest}
                      className="mt-50 d-none"
                      innerRef={ref}
                      type="switch"
                      name="is_phone_verified"
                      id="is_phone_verified"
                      checked={isActive}
                      label={fetchPhoneVerificationStatusInputLabel(isActive)}
                      inline={false}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
          </Col>
        </Row>

        <Col lg={6}>
          <div className="d-flex justify-content-end mt-2">
            <Button
              type="submit"
              color="success"
              className="btn-next"
              disabled={isSubmitting}
            >
              <span className="align-middle d-sm-inline-block">
                {isSubmitting ? "Menyimpan data..." : "Simpan"}
              </span>
            </Button>
          </div>
        </Col>
      </AvForm>
    </Fragment>
  );
};

export default EditAffiliateForm;
