import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  FormFeedback,
} from "reactstrap";
import { Controller, useForm } from "react-hook-form";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { InterestAndTalentSchoolContext } from "../../../../context/InterestAndTalentSchoolContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import clsx from "clsx";
import axios from "axios";
import classnames from "classnames";
import moment from "moment-timezone";
import { showToast } from "../../../../utility/Utils";
import Flatpickr from "react-flatpickr";
import "react-slidedown/lib/slidedown.css";
import "flatpickr/dist/themes/airbnb.css";
import "filepond/dist/filepond.min.css";

registerPlugin(FilePondPluginFileValidateType);

const AssignNewAccessCodeForm = ({ codeRequest = null }) => {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { school, toggleAssignNewAccessCodeModalVisibility } = useContext(
    InterestAndTalentSchoolContext
  );
  const filePondAcceptedFileTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const formSchema = yup.object().shape({
    access_code: yup
      .string()
      .test(
        "access_code_is_required",
        "Silakan input kode akses atau upload file excel .xlsx",
        function (value, context) {
          const access_code_files = context?.parent?.access_code_files;
          if (!access_code_files.length && !value) return false;
          return true;
        }
      ),
    access_code_files: yup
      .array()
      .test(
        "access_code_files_is_required",
        "Silakan input kode akses atau upload file excel .xlsx",
        function (value, context) {
          const access_code = context?.parent?.access_code;
          if (!access_code && !value.length) return false;
          return true;
        }
      )
      .test(
        "access_code_files_type_is_invalid",
        "Tipe/extension dari file yang dipilih harus .xlsx",
        function (files, _) {
          if (!files.length) return true;
          return files.every((file) =>
            filePondAcceptedFileTypes.includes(file.type)
          );
        }
      ),
    access_code_start_date: yup.string().required("Wajib diisi"),
    access_code_start_time: yup.string().required("Wajib diisi"),
    access_code_expire_date: yup
      .string()
      .required("Wajib diisi")
      .test(
        "access_code_expire_date_is_not_valid",
        "Tanggal yang di-inputkan kurang dari 'Tanggal Kode Akses Mulai Berlaku'",
        function (value, context) {
          const access_code_start_date =
            context?.parent?.access_code_start_date;
          if (value < access_code_start_date) return false;
          return true;
        }
      ),
    access_code_expire_time: yup
      .string()
      .required("Wajib diisi")
      .test(
        "access_code_expire_time_is_not_valid",
        "Jam yang di-inputkan harus setelah jam 'Tanggal Kode Akses Mulai Berlaku",
        function (value, context) {
          const access_code_start_date =
            context?.parent?.access_code_start_date;
          const access_code_expire_date =
            context?.parent?.access_code_expire_date;
          if (access_code_start_date !== access_code_expire_date) return true;

          const access_code_start_time = moment(
            context?.parent?.access_code_start_time,
            "HH:mm:ss.SSSZ"
          );
          const access_code_expire_time = moment(value, "HH:mm:ss.SSSZ");
          return access_code_start_time.isBefore(access_code_expire_time);
        }
      ),
  });

  const formDefaultValues = {
    access_code: "",
    access_code_files: [],
    access_code_start_date: codeRequest
      ? moment(codeRequest.start_date).tz("Asia/Jakarta").format("YYYY-MM-DD")
      : "",
    access_code_start_time: codeRequest
      ? moment(codeRequest.start_date).tz("Asia/Jakarta").format("HH:mm")
      : "",
    access_code_expire_date: codeRequest
      ? moment(codeRequest.expired_date).tz("Asia/Jakarta").format("YYYY-MM-DD")
      : "",
    access_code_expire_time: codeRequest
      ? moment(codeRequest.expired_date).tz("Asia/Jakarta").format("HH:mm")
      : "",
  };

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isValid },
    clearErrors,
  } = useForm({
    defaultValues: formDefaultValues,
    mode: "all",
    resolver: yupResolver(formSchema),
  });

  const { access_code, access_code_files } = watch();

  useEffect(() => {
    if (access_code && !access_code_files.length) {
      clearErrors("access_code");
      clearErrors("access_code_files");
    }

    if (!access_code && access_code_files.length) {
      setValue("access_code", "");
      clearErrors("access_code");
      const isValidFileType = access_code_files.every((file) =>
        filePondAcceptedFileTypes.includes(file.type)
      );
      if (isValidFileType) clearErrors("access_code_files");
    }
  }, [access_code, access_code_files]);

  const handleAccessCodeChanged = (event, updateValue) => {
    const value = event.target.value;
    const allowedValue = /^[a-zA-Z0-9_]*$/;
    if (!allowedValue.test(value)) return null;
    updateValue(value.toUpperCase());
  };

  const submitForm = async (data) => {
    try {
      setIsFormSubmitting(true);
      const formData = new FormData();
      formData.append("access_code", data.access_code);
      if (data.access_code_files.length) {
        formData.append("access_code_file", data.access_code_files[0]);
      }
      formData.append("school", JSON.stringify(school));
      formData.append("codeRequest", JSON.stringify(codeRequest));

      formData.append(
        "start_date",
        `${data.access_code_start_date} ${data.access_code_start_time}`
      );
      formData.append(
        "expire_date",
        `${data.access_code_expire_date} ${data.access_code_expire_time}`
      );

      const response = await axios.post(
        `/api/interest-and-talent/schools/${school?.id}/access-codes`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response?.data?.success) {
        showToast({
          type: "info",
          title: "Berhasil",
          message: "Data kode akses sedang diproses",
          duration: 3000,
        });
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message:
          error?.response?.data?.message ??
          "Terjadi kesalahn silakan coba lagi nanti",
        duration: 3000,
      });
      setIsFormSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(submitForm)}>
      <h5 className="mb-1" style={{ color: "#949494", fontWeight: "600" }}>
        Tanggal Kode Berlaku
      </h5>
      <Row>
        <Col md="9">
          <Controller
            control={control}
            name="access_code_start_date"
            render={({
              field: { onChange, ref, value },
              fieldState: { error },
            }) => (
              <FormGroup>
                <Label>Tanggal Kode Akses Mulai Berlaku</Label>
                <Flatpickr
                  className={classnames("flatpickr-input", "form-control", {
                    "is-invalid": !isValid && error,
                  })}
                  ref={ref}
                  readOnly={false}
                  value={value}
                  onChange={(date) =>
                    onChange(
                      date.length ? moment(date[0]).format("YYYY-MM-DD") : ""
                    )
                  }
                  disabled={codeRequest?.start_date}
                  placeholder="Input Tanggal"
                />
                {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
              </FormGroup>
            )}
          />
        </Col>
        <Col md="3">
          <Controller
            control={control}
            name="access_code_start_time"
            render={({
              field: { onChange, ref, value },
              fieldState: { error },
            }) => (
              <FormGroup>
                <Label>Jam (WIB)</Label>
                <Flatpickr
                  data-no-calendar
                  data-enable-time
                  data-time_24hr
                  className={classnames("flatpickr-input", "form-control", {
                    "is-invalid": !isValid && error,
                  })}
                  ref={ref}
                  readOnly={false}
                  value={value}
                  onChange={(date) =>
                    onChange(
                      date.length ? moment(date[0]).format("HH:mm:ss.SSS") : ""
                    )
                  }
                  placeholder="Input Jam"
                  disabled={codeRequest?.start_date}
                />
                {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
              </FormGroup>
            )}
          />
        </Col>
      </Row>
      <Row>
        <Col md="9">
          <Controller
            control={control}
            name="access_code_expire_date"
            render={({
              field: { onChange, ref, value },
              fieldState: { error },
            }) => (
              <FormGroup>
                <Label>Tanggal Kode Akses Kadaluarsa</Label>
                <Flatpickr
                  className={classnames("flatpickr-input", "form-control", {
                    "is-invalid": !isValid && error,
                  })}
                  ref={ref}
                  readOnly={false}
                  value={value}
                  onChange={(date) =>
                    onChange(
                      date.length ? moment(date[0]).format("YYYY-MM-DD") : ""
                    )
                  }
                  placeholder="Input Tanggal"
                  disabled={codeRequest?.expired_date}
                />
                {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
              </FormGroup>
            )}
          />
        </Col>
        <Col md="3">
          <Controller
            control={control}
            name="access_code_expire_time"
            render={({
              field: { onChange, ref, value },
              fieldState: { error },
            }) => (
              <FormGroup>
                <Label>Jam (WIB)</Label>
                <Flatpickr
                  data-no-calendar
                  data-enable-time
                  data-time_24hr
                  className={classnames("flatpickr-input", "form-control", {
                    "is-invalid": !isValid && error,
                  })}
                  ref={ref}
                  readOnly={false}
                  value={value}
                  onChange={(date) =>
                    onChange(
                      date.length ? moment(date[0]).format("HH:mm:ss.SSS") : ""
                    )
                  }
                  placeholder="Input Jam"
                  disabled={codeRequest?.expired_date}
                />
                {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
              </FormGroup>
            )}
          />
        </Col>
      </Row>
      <hr className="my-2" />
      <h5 className="mb-1" style={{ color: "#949494", fontWeight: "600" }}>
        Input Kode Akses
      </h5>
      <Row>
        <Col md="12">
          <Controller
            name="access_code"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, onChange, ...rest } = field;
              return (
                <FormGroup>
                  <Label for="access_code" className="form-label">
                    Masukan Kode Akses
                  </Label>
                  <Input
                    type="text"
                    className={clsx(`form-control`)}
                    id="access_code"
                    innerRef={ref}
                    invalid={error && !isValid}
                    onChange={(event) =>
                      handleAccessCodeChanged(event, onChange)
                    }
                    disabled={access_code_files.length}
                    {...rest}
                  />
                  {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col md="12" className={clsx("my-1")}>
          <div className={clsx("text-option")}>atau</div>
        </Col>
      </Row>
      <Row>
        <Col md="12">
          <Controller
            name="access_code_files"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label
                    for="access_code_files"
                    className={clsx("form-label font-weight-bolder")}
                  >
                    Upload File XLSX<span>*</span>
                  </Label>
                  <FilePond
                    acceptedFileTypes={filePondAcceptedFileTypes}
                    name="access_code_files"
                    id="access_code_files"
                    className={classnames("flatpickr-input", "form-control", {
                      "is-invalid": error,
                    })}
                    files={field.value}
                    disabled={!!access_code}
                    onupdatefiles={(fileItems) => {
                      field.onChange(
                        fileItems.map((fileItem) => fileItem.file)
                      );
                    }}
                    labelIdle='
                    <div class="mt-1">
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      <p class="my-1 filepond-label">Seret & Jatuhkan atau <span class="filepond--label-action">Pilih File</span> untuk di upload<p>
                      <p class="my-1 text-info-sm">XLSX</p>
                    </div>
                  '
                  />
                  {!isValid && error && (
                    <p
                      style={{
                        width: "100%",
                        marginTop: "0.25rem",
                        fontSize: "0.857rem",
                        color: "#ea5455",
                      }}
                    >
                      {error?.message}
                    </p>
                  )}
                  <p className={clsx("text-info-sm")}>
                    *Upload file jika jumlah kode akses lebih dari satu
                  </p>
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>
      <Row className="mt-5">
        <Col md={12} className="d-flex justify-content-end align-items-center">
          <a
            href="https://btw-cdn.com/peminatan/template_assign_kode_akses.xlsx"
            target="__blank"
            className="btn btn-info mr-auto"
            rel="noreferrer"
          >
            Download Template Excel Assign Kode Akses
          </a>
          <Button
            color="outline-primary"
            className="mr-25"
            onClick={toggleAssignNewAccessCodeModalVisibility}
            disabled={isFormSubmitting}
          >
            Tutup
          </Button>
          <Button
            type="submit"
            color="gradient-primary"
            disabled={isFormSubmitting}
          >
            Assign Kode Akses
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default AssignNewAccessCodeForm;
