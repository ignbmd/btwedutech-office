import React, { Fragment, useEffect, useState, useRef } from "react";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
  ButtonGroup,
  DropdownItem,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  ToastHeader,
} from "reactstrap";
import { Copy, Plus, Save, Trash2 } from "react-feather";
import { normalNumber, showToast } from "../../utility/Utils";
import "flatpickr/dist/themes/airbnb.css";
import { nanoid } from "nanoid";
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

const CreateSchoolQuotaForm = () => {
  const [schools, setSchools] = useState(null);
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

  const getPayload = () => {
    const form = getValues();

    return {
      school_id: parseInt(form.school_id.id),
      quota: parseInt(form.quota),
      year: parseInt(form.year),
    };
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formValues = getPayload();
      await axios.post("/api/competition-map/school-quota", formValues);
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

  useEffect(() => {
    getSchools();
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
                          onChange={(e) => field.onChange(e.target.rawValue)}
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
                          onChange={(e) => field.onChange(e.target.rawValue)}
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
                    <Save size={14} /> {isSubmitting ? "Menyimpan" : "Simpan"}
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

export default CreateSchoolQuotaForm;
