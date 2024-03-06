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
import { InterestAndTalentSchoolContext } from "../../../../context/InterestAndTalentSchoolContext";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import clsx from "clsx";
import classnames from "classnames";
import moment from "moment-timezone";
import { showToast } from "../../../../utility/Utils";
import Flatpickr from "react-flatpickr";
import "react-slidedown/lib/slidedown.css";
import "flatpickr/dist/themes/airbnb.css";

const AssignEditHistoryCodeForm = ({ codeHistory = null }) => {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { school, toggleAssignedUpdateAccessCodeModalVisibility } = useContext(
    InterestAndTalentSchoolContext
  );

  const formSchema = yup.object().shape({
    amount_access_code: yup
      .string()
      .test(
        "amount_access_code_limit",
        "Estimasi tidak boleh lebih dari 350 peserta dalam satu tes minat bakat",
        function (value) {
          // Parse the value to a number before comparing
          const numericValue = parseFloat(value);

          // Check if the value is a number and it is less than or equal to 350
          return !isNaN(numericValue) && numericValue <= 350;
        }
      )
      .test("access_code_is_required", function (value, context) {
        return true;
      }),
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
    access_code_start_date: codeHistory
      ? moment(codeHistory.start_date).tz("Asia/Jakarta").format("YYYY-MM-DD")
      : "",
    access_code_start_time: codeHistory
      ? moment(codeHistory.start_date).tz("Asia/Jakarta").format("HH:mm")
      : "",
    access_code_expire_date: codeHistory
      ? moment(codeHistory.expired_date).tz("Asia/Jakarta").format("YYYY-MM-DD")
      : "",
    access_code_expire_time: codeHistory
      ? moment(codeHistory.expired_date).tz("Asia/Jakarta").format("HH:mm")
      : "",
    amount_access_code: codeHistory ? codeHistory.amount : "",
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

  const { amount_access_code, access_code_files } = watch();
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
      formData.append("amount_code", data.amount_access_code);
      formData.append("school", JSON.stringify(school));
      formData.append("codeHistory", JSON.stringify(codeHistory));
      formData.append(
        "start_datetime",
        `${data.access_code_start_date} ${data.access_code_start_time}`
      );
      formData.append(
        "expire_datetime",
        `${data.access_code_expire_date} ${data.access_code_expire_time}`
      );
      const response = await axios.post(
        `/api/interest-and-talent/schools/${codeHistory?.group_test_id}/update`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            // "Content-Type": "multipart/form-data",
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
                  style={{ backgroundColor: "#ffff" }}
                  value={value}
                  onChange={(date) =>
                    onChange(
                      date.length ? moment(date[0]).format("YYYY-MM-DD") : ""
                    )
                  }
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
                  style={{ backgroundColor: "#ffff" }}
                  onChange={(date) =>
                    onChange(
                      date.length ? moment(date[0]).format("HH:mm:ss.SSS") : ""
                    )
                  }
                  placeholder="Input Jam"
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
                  style={{ backgroundColor: "#ffff" }}
                  onChange={(date) =>
                    onChange(
                      date.length ? moment(date[0]).format("YYYY-MM-DD") : ""
                    )
                  }
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
                  style={{ backgroundColor: "#ffff" }}
                  onChange={(date) =>
                    onChange(
                      date.length ? moment(date[0]).format("HH:mm:ss.SSS") : ""
                    )
                  }
                  placeholder="Input Jam"
                />
                {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
              </FormGroup>
            )}
          />
        </Col>
      </Row>
      <hr className="my-2" />
      <h5 className="mb-1" style={{ color: "#949494", fontWeight: "600" }}>
        Jumlah Kode Akses
      </h5>
      <Row>
        <Col md="12">
          <Controller
            name="amount_access_code"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, onChange, ...rest } = field;
              return (
                <FormGroup>
                  <Input
                    type="text"
                    className={clsx(`form-control`)}
                    id="amount_access_code"
                    innerRef={ref}
                    invalid={error && !isValid}
                    onChange={(event) =>
                      handleAccessCodeChanged(event, onChange)
                    }
                    // disabled={access_code_files.length}
                    {...rest}
                  />
                  {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>
      <Row className="mt-5">
        <Col md={12} className="d-flex justify-content-end align-items-center">
          <Button
            color="outline-primary"
            className="mr-25"
            onClick={toggleAssignedUpdateAccessCodeModalVisibility}
            disabled={isFormSubmitting}
          >
            Tutup
          </Button>
          <Button
            type="submit"
            color="gradient-primary"
            disabled={isFormSubmitting}
          >
            Update Assign Kode Akses
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default AssignEditHistoryCodeForm;
