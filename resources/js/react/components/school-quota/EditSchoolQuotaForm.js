import React, { useEffect, useState, useRef } from "react";
import * as yup from "yup";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import Select from "react-select";
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

import { getLastSegment, normalNumber, showToast } from "../../utility/Utils";
import SpinnerCenter from "../core/spinners/Spinner";
import "flatpickr/dist/themes/airbnb.css";
import axios from "axios";

const FormSchema = yup.object().shape({
  school_id: yup.object().typeError("Wajib diisi").required("Wajib diisi"),
  quota: yup
    .number()
    .min(1, "Kuota tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  year: yup
    .number()
    .min(1, "Tahun tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
});
const id = getLastSegment();

const EditSchoolQuotaForm = () => {
  const [schools, setSchools] = useState(null);
  const [schoolQuota, setSchoolQuota] = useState(null);
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
      school_id: "",
      quota: 0,
      year: 0,
    },
  });

  const getSchools = async () => {
    try {
      const response = await axios.get("/api/competition-map/school");
      const data = response.data;
      setSchools(data?.data ?? null);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getSchoolQuota = async () => {
    try {
      const id = getLastSegment();
      const response = await axios.get(
        `/api/competition-map/school-quota/${id}`
      );
      const data = response.data;
      setSchoolQuota(data.data ?? null);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      trigger();
      const payload = getPayload();
      await axios.put(`/api/competition-map/school-quota/${id}`, payload);
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      if (!isCanceled.current) {
        console.error(error);
        const errorMessage = error.response.data.message;
        showToast({
          type: "error",
          title: "Terjadi Kesalahan",
          message: errorMessage,
        });
        setIsSubmitting(false);
      }
    }
  };

  const redirectToIndex = () => {
    window.location.href = "/peta-persaingan/kuota-sekolah";
  };

  const loadFormValues = () => {
    setValue(
      "school_id",
      schools?.find((value) => value.id === schoolQuota.school_id) ?? ""
    );
    setValue("quota", schoolQuota?.quota);
    setValue("year", schoolQuota?.year);
    setIsLoading(false);
  };

  const getPayload = () => {
    const form = getValues();

    return {
      school_id: parseInt(form.school_id.id),
      quota: parseInt(form.quota),
      year: parseInt(form.year),
    };
  };

  useEffect(() => {
    (async () => {
      await getSchools();
      await getSchoolQuota();
      return () => {
        isCanceled.current = true;
      };
    })();
  }, []);

  useEffect(() => {
    if (!schoolQuota) return;
    loadFormValues();
  }, [schoolQuota]);

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
                      name="school_id"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Sekolah</Label>
                            <Select
                              {...field}
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 9999,
                                }),
                              }}
                              isSearchable={true}
                              options={schools}
                              getOptionLabel={(option) => option.name}
                              getOptionValue={(option) => option.id}
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

                    <Controller
                      name="quota"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Kuota</Label>
                            <Cleave
                              {...field}
                              options={normalNumber}
                              className={classnames("form-control", {
                                "is-invalid": error,
                              })}
                              onChange={(e) =>
                                field.onChange(e.target.rawValue)
                              }
                              value={field.value ?? 0}
                              placeholder="Inputkan Kuota"
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="year"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Tahun</Label>
                            <Cleave
                              {...field}
                              options={normalNumber}
                              className={classnames("form-control", {
                                "is-invalid": error,
                              })}
                              onChange={(e) =>
                                field.onChange(e.target.rawValue)
                              }
                              value={field.value ?? 0}
                              placeholder="Inputkan Tahun"
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

export default EditSchoolQuotaForm;
