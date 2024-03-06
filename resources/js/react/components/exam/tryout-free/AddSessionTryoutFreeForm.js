import React, { useState, useRef } from "react";
import * as yup from "yup";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
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
} from "reactstrap";
import { Save } from "react-feather";

import {
  baseNumeralOptions,
  getLastSegment,
  isObjEmpty,
} from "../../../utility/Utils";
import axios from "../../../utility/http";

const FormSchema = yup.object().shape({
  title: yup.string().required("Wajib diisi"),
  start_datetime: yup.string().required("Wajib diisi"),
  end_datetime: yup.string().required("Wajib diisi"),
  status: yup.boolean().required("Wajib diisi"),
  max_capacity: yup
    .string()
    .required("Wajib diisi")
    .min(1, "Kapasitas Maksimal harus lebih dari 0"),
});

const AddSessionTryoutFreeForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    trigger,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      status: true,
    },
  });

  const isCanceled = useRef(false);

  const convertUTC = (date) => {
    return moment.utc(date).subtract(7, "hour").format();
  };

  const getPayload = () => {
    const form = getValues();
    const packages_id = getLastSegment();
    let start = "";
    let end = "";
    form.start_datetime.length > 0
      ? (start = convertUTC(form.start_datetime))
      : (start = null);
    form.end_datetime.length > 0
      ? (end = convertUTC(form.end_datetime))
      : (end = null);

    const payload = {
      title: form.title,
      max_capacity: form.max_capacity,
      packages_id: packages_id,
      start_datetime: start,
      end_datetime: end,
      status: form.status,
    };
    return payload;
  };

  const redirectToIndexPage = () => {
    window.location.href = "/ujian/tryout-gratis";
  };

  const submitHandler = async () => {
    trigger();
    if (isObjEmpty(errors)) {
      (async () => {
        try {
          const payload = getPayload();
          if (payload) {
            setIsSubmitting(true);
            await axios.post("/exam/tryout-free/add-session", payload);
          }
          if (!isCanceled.current) {
            redirectToIndexPage();
          }
        } catch (error) {
          console.log(error);
          if (!isCanceled.current) {
            setIsSubmitting(false);
          }
        }
      })();
    }
  };

  return (
    <div className={classnames(isSubmitting && "block-content")}>
      <Form onSubmit={handleSubmit(submitHandler)}>
        <Card>
          <CardBody>
            <div className="d-flex">
              <Col md={6} className={classnames("pl-0")}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Judul Sesi</Label>
                        <Input
                          {...rest}
                          id="title"
                          innerRef={ref}
                          invalid={error && true}
                        />
                      </FormGroup>
                    );
                  }}
                />

                <Controller
                  name="max_capacity"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Kapasitas Maksimal</Label>
                        <InputGroup
                          className={classnames({
                            "is-invalid": error && true,
                          })}
                        >
                          <Cleave
                            {...field}
                            options={baseNumeralOptions}
                            className={classnames("form-control", {
                              "is-invalid": error,
                            })}
                            onChange={(e) => field.onChange(e.target.rawValue)}
                            value={field.value ?? 0}
                            placeholder="0"
                          />

                          <InputGroupAddon addonType="append">
                            <InputGroupText>Peserta</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

                <Controller
                  control={control}
                  name="start_datetime"
                  render={({
                    field: { onChange, ref, value },
                    fieldState: { error },
                  }) => (
                    <FormGroup>
                      <Label className="form-label">Waktu Dimulai</Label>
                      <Input
                        type="datetime-local"
                        ref={ref}
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        value={value}
                        onChange={(date) => {
                          date.length === 0 ? onChange("") : onChange(date);
                        }}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />

                <Controller
                  control={control}
                  name="end_datetime"
                  render={({
                    field: { onChange, ref, value },
                    fieldState: { error },
                  }) => (
                    <FormGroup>
                      <Label className="form-label">Waktu Berakhir</Label>
                      <Input
                        type="datetime-local"
                        ref={ref}
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        value={value}
                        onChange={(date) => {
                          date.length === 0 ? onChange("") : onChange(date);
                        }}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />

                <Controller
                  name="status"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, value: isActive, ...rest } = field;
                    return (
                      <>
                        <CustomInput
                          {...rest}
                          className="mt-50"
                          innerRef={ref}
                          type="switch"
                          id="status"
                          checked={isActive}
                          label={isActive ? "Aktif" : "Tidak Aktif"}
                          inline
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </>
                    );
                  }}
                />
              </Col>
            </div>
          </CardBody>
        </Card>

        <div className="text-right mt-4">
          <Button type="submit" color="gradient-success">
            <Save size={14} /> Simpan
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddSessionTryoutFreeForm;
