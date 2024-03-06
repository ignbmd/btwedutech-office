import React, { useEffect, useState, useRef } from "react";
import * as yup from "yup";
import classnames from "classnames";
import Cleave from "cleave.js/react";
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
  InputGroup,
  InputGroupAddon,
  Label,
} from "reactstrap";
import { Save } from "react-feather";

import { getLastSegment } from "../../utility/Utils";
import SpinnerCenter from "../core/spinners/Spinner";
import "flatpickr/dist/themes/airbnb.css";
import axios from "axios";

const numeralOptions = {
  numeral: true,
};

const FormSchema = yup.object().shape({
  name: yup.string().required("Wajib diisi"),
  ministry: yup.string().required("Wajib diisi"),
  address: yup.string().required("Wajib diisi"),
  link: yup.string().required("Wajib diisi"),
  leg_x: yup
    .number("Input tidak valid")
    .required("Wajib diisi")
    .typeError("Wajib diisi dengan angka"),
  leg_o: yup
    .number("Input tidak valid")
    .required("Wajib diisi")
    .typeError("Wajib diisi dengan angka"),
  eye_min: yup
    .number("Input tidak valid")
    .required("Wajib diisi")
    .typeError("Wajib diisi dengan angka"),
  eye_plus: yup
    .number("Input tidak valid")
    .required("Wajib diisi")
    .typeError("Wajib diisi dengan angka"),
  eye_cylinder: yup
    .number("Input tidak valid")
    .required("Wajib diisi")
    .typeError("Wajib diisi dengan angka"),
});

const CreateSchoolForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [school, setSchool] = useState(null);
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
      ministry: "",
      address: "",
      link: "",
      leg_x: 0,
      leg_o: 0,
      eye_min: 0,
      eye_plus: 0,
      eye_cylinder: 0,
    },
  });

  const fetchSchool = async () => {
    const id = getLastSegment();
    try {
      const response = await axios.get(`/api/competition-map/school/${id}`);
      const data = await response.data;
      setSchool(data?.data ?? null);
      setIsLoading(false);
      return;
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async () => {
    const schoolId = getLastSegment();
    try {
      setIsSubmitting(true);
      trigger();
      const formValues = getValues();
      await axios.put(`/api/competition-map/school/${schoolId}`, formValues);
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
    window.location.href = "/peta-persaingan/sekolah";
  };

  const loadFormValues = () => {
    setValue("name", school?.name);
    setValue("ministry", school?.ministry);
    setValue("address", school?.address);
    setValue("link", school?.link);
    setValue("leg_x", school?.leg_x);
    setValue("leg_o", school?.leg_o);
    setValue("eye_min", school?.eye_min);
    setValue("eye_plus", school?.eye_plus);
    setValue("eye_cylinder", school?.eye_cylinder);
  };

  useEffect(() => {
    fetchSchool();
    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    if (!school) return;
    loadFormValues();
  }, [school]);

  return (
    <>
      {isLoading ? (
        <SpinnerCenter />
      ) : (
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
                            <Label className="form-label">Nama Sekolah</Label>
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
                      name="ministry"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Kementrian</Label>
                            <Input
                              {...rest}
                              id="ministry"
                              innerRef={ref}
                              invalid={error && true}
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
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
                            <Label className="form-label">Alamat Sekolah</Label>
                            <Input
                              {...rest}
                              id="address"
                              innerRef={ref}
                              invalid={error && true}
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="link"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Alamat Situs Web
                            </Label>
                            <Input
                              {...rest}
                              id="link"
                              innerRef={ref}
                              invalid={error && true}
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="leg_x"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Kaki X</Label>
                            {/* <Input
                              {...rest}
                              id="leg_x"
                              innerRef={ref}
                              invalid={error && true}
                            /> */}
                            <InputGroup>
                              <Cleave
                                {...field}
                                options={numeralOptions}
                                id="leg_x"
                                className={classnames("form-control", {
                                  "is-invalid": error,
                                })}
                                onChange={(e) =>
                                  field.onChange(e.target.rawValue)
                                }
                                value={field.value ?? 0}
                              />
                              <InputGroupAddon addonType="append">
                                cm
                              </InputGroupAddon>
                            </InputGroup>
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="leg_o"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Kaki O</Label>
                            {/* <Input
                              {...rest}
                              id="leg_o"
                              innerRef={ref}
                              invalid={error && true}
                            /> */}
                            <InputGroup>
                              <Cleave
                                {...field}
                                options={numeralOptions}
                                id="leg_o"
                                className={classnames("form-control", {
                                  "is-invalid": error,
                                })}
                                onChange={(e) =>
                                  field.onChange(e.target.rawValue)
                                }
                                value={field.value ?? 0}
                              />
                              <InputGroupAddon addonType="append">
                                cm
                              </InputGroupAddon>
                            </InputGroup>
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="eye_min"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Mata Minus</Label>
                            {/* <Input
                              {...rest}
                              id="eye_min"
                              innerRef={ref}
                              invalid={error && true}
                            /> */}
                            <Cleave
                              {...field}
                              options={numeralOptions}
                              id="eye_min"
                              className={classnames("form-control", {
                                "is-invalid": error,
                              })}
                              onChange={(e) =>
                                field.onChange(e.target.rawValue)
                              }
                              value={field.value ?? 0}
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="eye_plus"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Mata Plus</Label>
                            {/* <Input
                              {...rest}
                              id="eye_plus"
                              innerRef={ref}
                              invalid={error && true}
                            /> */}
                            <Cleave
                              {...field}
                              options={numeralOptions}
                              id="eye_plus"
                              className={classnames("form-control", {
                                "is-invalid": error,
                              })}
                              onChange={(e) =>
                                field.onChange(e.target.rawValue)
                              }
                              value={field.value ?? 0}
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="eye_cylinder"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Mata Silinder</Label>
                            {/* <Input
                              {...rest}
                              id="eye_cylinder"
                              innerRef={ref}
                              invalid={error && true}
                            /> */}
                            <Cleave
                              {...field}
                              options={numeralOptions}
                              id="eye_cylinder"
                              className={classnames("form-control", {
                                "is-invalid": error,
                              })}
                              onChange={(e) =>
                                field.onChange(e.target.rawValue)
                              }
                              value={field.value ?? 0}
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />
                    <div className="text-right mt-4">
                      <Button
                        type="submit"
                        color="gradient-success"
                        disabled={isSubmitting}
                      >
                        <Save size={14} />{" "}
                        {isSubmitting ? "Menyimpan" : "Simpan"}
                      </Button>
                    </div>
                  </Col>
                </div>
              </CardBody>
            </Card>
          </Form>
        </div>
      )}
    </>
  );
};

export default CreateSchoolForm;
