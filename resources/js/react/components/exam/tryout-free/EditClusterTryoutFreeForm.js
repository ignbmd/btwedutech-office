import React, { useEffect, useState, useRef } from "react";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import Flatpickr from "react-flatpickr";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  CustomInput,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Badge,
  Label,
} from "reactstrap";
import { Plus, Save, Trash2 } from "react-feather";

import {
  getLastSegment,
  baseNumeralOptions,
  isObjEmpty,
} from "../../../utility/Utils";
import "flatpickr/dist/themes/airbnb.css";
import axios from "../../../utility/http";
import Axios from "axios";
import SpinnerCenter from "../../core/spinners/Spinner";

const FormSchema = yup.object().shape({
  title: yup.string().required("Wajib diisi"),
  start_datetime: yup.string().nullable(),
  end_datetime: yup.string().nullable(),
  status: yup.boolean().required("Wajib diisi"),
  max_capacity: yup
    .string()
    .required("Wajib diisi")
    .min(1, "Kapasitas Maksimal harus lebih dari 0"),
});

const EditClusterTryoutFreeForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      title: "",
      max_capacity: "",
    },
  });
  const { start_datetime, end_datetime } = watch();
  const isCanceled = useRef(false);
  const source = Axios.CancelToken.source();

  const getClusterTryoutFree = async () => {
    try {
      const id = getLastSegment();
      const response = await axios.get(`/exam/tryout-free/clusters/${id}`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const tryoutFree = data?.data ?? [];
      return tryoutFree;
    } catch (error) {
      return null;
    }
  };

  const convertUTC = (date) => {
    return moment.utc(date).subtract(7, "hour").format();
  };

  const getPayload = () => {
    const form = getValues();
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
      packages_id: form.packages_id,
      start_datetime: start,
      end_datetime: end,
      status: form.status,
    };

    return payload;
  };

  const url = window.location.href;
  const splitByForwardSlash = url.split("/");
  const packageId = splitByForwardSlash[splitByForwardSlash.length - 3];

  const redirectToIndex = () => {
    window.location.href = "/ujian/tryout-gratis/detail/" + packageId;
  };

  const loadEdit = async () => {
    setIsLoading(true);
    const data = await getClusterTryoutFree();
    setValue("packages_id", data?.packages_id);
    setValue("title", data?.title);
    setValue("max_capacity", data?.max_capacity);
    setValue(
      "start_datetime",
      data?.start_datetime
        ? moment(data?.start_datetime)
            .utcOffset("+0700")
            .format("YYYY-MM-DDTHH:mm")
        : ""
    );
    setValue(
      "end_datetime",
      data?.end_datetime
        ? moment(data?.end_datetime)
            .utcOffset("+0700")
            .format("YYYY-MM-DDTHH:mm")
        : ""
    );
    setValue("status", data?.status);
    setIsLoading(false);
  };

  useEffect(() => {
    loadEdit();
  }, []);

  useEffect(() => {
    if (!start_datetime || !end_datetime) setValue("max_capacity", 0);
  }, [start_datetime, end_datetime]);

  const submitHandler = async () => {
    trigger();
    if (isObjEmpty(errors)) {
      setIsSubmitting(true);
      const payload = getPayload();
      payload.id = parseInt(getLastSegment());
      try {
        const response = await axios.put(
          "/exam/tryout-free/update-clusters/",
          payload
        );
        if (!isCanceled.current) {
          redirectToIndex();
        }
      } catch (error) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card>
      <CardBody className={classnames(isSubmitting && "block-content")}>
        {isLoading ? (
          <SpinnerCenter />
        ) : (
          <Form onSubmit={handleSubmit(submitHandler)}>
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
                defaultValue=""
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
                          readOnly={!start_datetime || !end_datetime}
                          value={field.value ?? 0}
                          placeholder="0"
                        />

                        <InputGroupAddon addonType="append">
                          <InputGroupText>
                            {" "}
                            {field.value == 0 ? "Tidak Terbatas" : "Peserta"}
                          </InputGroupText>
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
                defaultValue=""
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
                defaultValue=""
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
                        label={isActive ? "Aktif" : "Nonaktif"}
                        inline
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </>
                  );
                }}
              />

              <div className="text-right mt-4">
                <Button type="submit" color="gradient-primary">
                  <Save size={14} /> Perbarui
                </Button>
              </div>
            </Col>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

export default EditClusterTryoutFreeForm;
