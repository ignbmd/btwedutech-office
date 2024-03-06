import React, { useEffect, useState, useRef } from "react";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { Save } from "react-feather";

import "flatpickr/dist/themes/airbnb.css";
import axios from "axios";

const FormSchema = yup.object().shape({
  name: yup.string().required("Wajib diisi"),
  type: yup.object().required("Wajib diisi").typeError("Wajib diisi"),
  parent_id: yup
    .object()
    .when("type", {
      is: (t) => t && t.value !== "PROVINCE",
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired().nullable(),
    })
    .typeError("Wajib diisi"),
});

const locationTypes = [
  { label: "PROVINCE", value: "PROVINCE" },
  { label: "REGION", value: "REGION" },
];

const CreateLocationForm = () => {
  const [provinces, setProvinces] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

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
      name: "",
      type: "",
      parent_id: null,
    },
  });
  const { type } = watch();

  const getProvinces = async () => {
    const response = await axios.get("/api/competition-map/location/provinces");
    const data = await response.data;
    setProvinces(data.data ?? []);
    return;
  };

  const getPayload = () => {
    const formValues = getValues();
    const locationType = formValues?.type?.value;
    return {
      name: formValues?.name,
      type: locationType,
      parent_id: locationType !== "PROVINCE" ? formValues.parent_id.id : null,
    };
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = getPayload();
      await axios.post("/api/competition-map/location", {
        ...payload,
        cancelToken: source.token,
      });
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      if (!isCanceled.current) {
        console.error(error);
        setIsSubmitting(false);
      }
    }
  };

  const redirectToIndex = () => {
    window.location.href = "/peta-persaingan/lokasi";
  };

  useEffect(() => {
    getProvinces();
    return () => {
      isCanceled.current = true;
    };
  }, []);

  return (
    <div className={classnames(isSubmitting && "block-content")}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardBody>
            <div className="d-flex">
              <Col md={6} className={classnames("pl-0")}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Nama</Label>
                        <Input
                          {...rest}
                          id="name"
                          innerRef={ref}
                          invalid={error && true}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

                <Controller
                  name="type"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Tipe</Label>
                        <Select
                          {...field}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999,
                            }),
                          }}
                          isSearchable={false}
                          options={locationTypes}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": error && true,
                          })}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

                {type.value && type.value !== "PROVINCE" ? (
                  <Controller
                    name="parent_id"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">Provinsi</Label>
                          <Select
                            {...field}
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                            isSearchable={false}
                            options={provinces}
                            classNamePrefix="select"
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                            className={classnames("react-select", {
                              "is-invalid": error && true,
                            })}
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />
                ) : null}

                <div className="text-right mt-4">
                  <Button type="submit" color="gradient-success">
                    <Save size={14} /> Simpan
                  </Button>
                </div>
              </Col>
            </div>
          </CardBody>
        </Card>
      </Form>
    </div>
  );
};

export default CreateLocationForm;
