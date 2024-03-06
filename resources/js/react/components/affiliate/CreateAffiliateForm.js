import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Label,
  Input,
  FormGroup,
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
  isFieldHasErrorMessage,
} from "../../utility/Utils";
import { affiliateTypes, bankTypes } from "../../data/affiliate/affiliate-data";
import { Eye, EyeOff } from "react-feather";
import { AsyncPaginate } from "react-select-async-paginate";

const CreateAffiliateForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmationPassword, setShowConfirmationPassword] =
    useState(false);
  const [users, setUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);
  const [highschools, setHighschools] = useState(null);
  const [fetchHighschoolsRequestCount, setFetchHighschoolsRequestCount] =
    useState(0);

  const highschoolDefaultAdditionalParams = {
    page: 1,
    per_page: 7,
  };
  const loadHighschoolOptionsWrapper = useCallback((...args) => {
    setFetchHighschoolsRequestCount(fetchHighschoolsRequestCount + 1);
    return loadHighschoolOptions(...args);
  }, []);
  const loadHighschoolOptions = async (
    query,
    prevOptions,
    { page, per_page }
  ) => {
    const { options, hasMore } = await fetchHighschools(query, page, per_page);
    return {
      options,
      hasMore,
      additional: { ...highschoolDefaultAdditionalParams, page: page + 1 },
    };
  };

  const yupObjectSchema = {
    user: yup
      .mixed()
      .test("user_is_required", "Wajib dipilih", function (value, context) {
        let isValid = true;
        if (!context.parent.create_new_account && !value) isValid = false;
        return isValid;
      }),
    name: yup.string().required("Harus diisi"),
    email: yup
      .string()
      .email("Format email tidak valid")
      .required("Harus diisi"),
    address: yup.string().required("Harus diisi"),
    phone: yup.string().required("Harus diisi"),
    ref_code: yup.string().required("Harus diisi"),
    upline_ref_code: yup.string().nullable(),
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
    school: yup
      .mixed()
      .test("school_is_required", "Wajib dipilih", function (value, context) {
        let isValid = true;
        if (
          context.parent.affiliate_type?.value === "SIPLAH_AFFILIATE" &&
          !value
        ) {
          isValid = false;
        }
        return isValid;
      }),
    password: yup
      .string()
      .test("password_is_required", "Harus diisi", function (value, context) {
        let isValid = true;
        if (context.parent.create_new_account && !value) isValid = false;
        return isValid;
      })
      .test(
        "password_minimum_is_8_character",
        "Minimal 8 karakter",
        function (value, context) {
          let isValid = true;
          if (context.parent.create_new_account && value.length < 8)
            isValid = false;
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
          if (context.parent.create_new_account && !value) isValid = false;
          return isValid;
        }
      )
      .test(
        "password_is_not_match",
        "Password tidak sesuai",
        function (value, context) {
          let isValid = true;
          if (
            context.parent.create_new_account &&
            value !== context.parent.password
          ) {
            isValid = false;
          }
          return isValid;
        }
      ),
  };

  const FormSchema = yup.object().shape(yupObjectSchema);
  const source = axios.CancelToken.source();

  const { control, getValues, register, setValue, watch, handleSubmit } =
    useForm({
      resolver: yupResolver(FormSchema),
      mode: "all",
      defaultValues: {
        user: "",
        affiliate_type: "",
        name: "",
        email: "",
        address: "",
        phone: "",
        ref_code: "",
        upline_ref_code: "",
        school: "",
        bank_type: "",
        bank_number: "",
        npwp_number: "",
        identity_number: "",
        create_new_account: false,
        password: "",
        password_confirmation: "",
      },
    });

  const { create_new_account, affiliate_type, school } = watch();

  function generateRandomRefCode() {
    let refCode = "";
    const characters = "ABCDEF0123456789";

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      refCode += characters.charAt(randomIndex);
    }
    return "M" + refCode;
  }

  function onUserChanged(selectedUserValue, setUserFormValue) {
    setUserFormValue(selectedUserValue);
    setValue("name", selectedUserValue?.name);
    setValue("email", selectedUserValue?.email);
    setValue("address", selectedUserValue?.address ?? "");
  }

  function onRefCodeChanged(event, setRefCodeValue) {
    const value = event.target.value.toUpperCase();
    const allowedValue = /^[a-zA-Z0-9_-]*$/;
    if (!allowedValue.test(value)) return null;
    setRefCodeValue(value);
  }

  function getFormPayload() {
    const formValues = getValues();
    return {
      sso_id: formValues?.user?.id,
      name: formValues?.name,
      email: formValues?.email,
      address: formValues?.address,
      phone: formValues?.phone,
      ref_code: formValues?.ref_code,
      upline_ref_code: formValues?.upline_ref_code,
      affiliate_type: formValues?.affiliate_type?.value,
      school_id: formValues?.school?.id,
      bank_type: formValues?.bank_type?.value,
      bank_number: formValues?.bank_number,
      npwp_number: formValues?.npwp_number,
      identity_number: formValues?.identity_number,
      password: formValues?.password,
    };
  }

  function getHighschoolFormLabel() {
    return affiliate_type?.value !== "SIPLAH_AFFILIATE"
      ? "Sekolah (Opsional)"
      : "Sekolah";
  }

  async function fetchUsers() {
    setIsFetchingUsers(true);
    const response = await axios.get("/api/sso/users");
    const body = await response.data;
    setIsFetchingUsers(false);
    return body?.data;
  }

  async function fetchHighschools(search, page, per_page) {
    const response = await axios.get(
      `/api/interest-and-talent/schools?search=${search}&page=${page}&per_page=${per_page}`
    );
    const body = await response?.data;
    return {
      options: body?.data?.schools ?? [],
      hasMore: body?.data?.page < body?.data?.last_page,
    };
  }

  async function onSubmit() {
    setIsSubmitting(true);
    const payload = getFormPayload();
    axios
      .post(`/api/affiliates`, {
        ...payload,
        cancelToken: source.token,
      })
      .then(() => {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data afiliasi berhasil ditambah",
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
      const usersData = await fetchUsers();
      setUsers(usersData);
      setValue("ref_code", generateRandomRefCode());
    })();
    return () => {
      clearInterval();
      clearTimeout();
    };
  }, []);

  useEffect(() => {
    setValue("user", "");
    setValue("name", "");
    setValue("email", "");
    setValue("address", "");
    setValue("phone", "");
    setValue("password", "");
    setValue("password_confirmation", "");
  }, [create_new_account]);

  useEffect(() => {
    if (!school) {
      setValue("affiliate_type", "");
      return;
    }
    setValue(
      "affiliate_type",
      affiliateTypes?.find(
        (affiliateType) => affiliateType.value === "SIPLAH_AFFILIATE"
      )
    );
  }, [school]);

  return (
    <AvForm onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col md={6}>
          <FormGroup className="flex-fill">
            <Label for="user" className="form-label">
              Akun
            </Label>
            <Controller
              name="user"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { onChange } = field;
                return (
                  <Fragment>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      {...field}
                      options={users}
                      classNamePrefix="select"
                      className={classnames("react-select mb-50", {
                        "is-invalid":
                          !create_new_account && isFieldHasErrorMessage(error),
                      })}
                      id="user"
                      getOptionLabel={(option) =>
                        `${option.name} (${option.email})`
                      }
                      getOptionValue={(option) => option.id}
                      onChange={(event) => {
                        onUserChanged(event, onChange);
                      }}
                      placeholder="Pilih akun"
                      isDisabled={create_new_account}
                      isLoading={isFetchingUsers}
                    />
                    <FormFeedback className="mb-1">
                      {!create_new_account && error?.message
                        ? error?.message
                        : ""}
                    </FormFeedback>
                  </Fragment>
                );
              }}
            />
            <input type="checkbox" {...register("create_new_account")} /> Buat
            Akun Baru
          </FormGroup>

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
            name="email"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, ...rest } = field;
              return (
                <FormGroup className="flex-fill">
                  <Label for="email" className="form-label">
                    Email
                  </Label>
                  <Input
                    {...rest}
                    id="email"
                    type="email"
                    placeholder="john.doe@gmail.com"
                    innerRef={ref}
                    invalid={isFieldHasErrorMessage(error)}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />

          {create_new_account ? (
            <Fragment>
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
                    </FormGroup>
                  );
                }}
              />
            </Fragment>
          ) : null}

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
            name="ref_code"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, onChange: setRefCodeValue, ...rest } = field;
              return (
                <FormGroup className="flex-fill">
                  <Label for="ref_code" className="form-label">
                    Kode Referal
                  </Label>
                  <div className="d-flex justify-content-center align-items-center">
                    <Input
                      {...rest}
                      id="ref_code"
                      innerRef={ref}
                      invalid={isFieldHasErrorMessage(error)}
                      onChange={(event) =>
                        onRefCodeChanged(event, setRefCodeValue)
                      }
                      placeholder="M4BC32FD6"
                      disabled={true}
                    />
                  </div>
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />

          <Controller
            name="upline_ref_code"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, onChange: setRefCodeValue, ...rest } = field;
              return (
                <FormGroup className="flex-fill">
                  <Label for="upline_ref_code" className="form-label">
                    Kode Referal Upline (Opsional)
                  </Label>
                  <div className="d-flex justify-content-center align-items-center">
                    <Input
                      {...rest}
                      id="upline_ref_code"
                      innerRef={ref}
                      invalid={isFieldHasErrorMessage(error)}
                      onChange={(event) =>
                        onRefCodeChanged(event, setRefCodeValue)
                      }
                      placeholder="M4BC32FD6"
                    />
                  </div>
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
                    isDisabled={Boolean(school)}
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

          <FormGroup className="flex-fill">
            <Label for="school" className="form-label">
              {getHighschoolFormLabel()}
            </Label>
            <Controller
              name="school"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <Fragment>
                    <AsyncPaginate
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      options={highschools}
                      classNamePrefix="select"
                      className={classnames("react-select mb-50", {
                        "is-invalid": isFieldHasErrorMessage(error),
                      })}
                      id="school"
                      placeholder="Pilih sekolah"
                      isClearable={true}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id}
                      additional={highschoolDefaultAdditionalParams}
                      debounceTimeout={300}
                      value={highschools}
                      loadOptions={loadHighschoolOptionsWrapper}
                      onChange={setHighschools}
                      {...field}
                    />
                    <FormFeedback className="mb-1">
                      {error?.message ?? ""}
                    </FormFeedback>
                  </Fragment>
                );
              }}
            />
          </FormGroup>
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
  );
};

export default CreateAffiliateForm;
