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
import { getLastSegment } from "../../utility/Utils";
import SpinnerCenter from "../core/spinners/Spinner";
import "flatpickr/dist/themes/airbnb.css";
import axios from "axios";

const FormSchema = yup.object().shape({
  name: yup.string().required("Wajib diisi"),
  type: yup.object().required("Wajib diisi").typeError("Wajib diisi"),
});

const lastEdTypes = [
  { label: "SMA/MA", value: "SMA" },
  { label: "SMK", value: "SMK" },
  { label: "PAKET C", value: "PAKET_C" },
];

const EditLastEducationForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState(null);

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
    },
  });

  const getPayload = () => {
    const formValues = getValues();
    return {
      name: formValues.name,
      type: formValues.type.value,
    };
  };

  const fetchLastEducation = async () => {
    const id = getLastSegment();
    const response = await axios.get(
      `/api/competition-map/last-education/${id}`
    );
    const data = response.data;
    setData(data?.data ?? null);
    setIsLoading(false);
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const id = getLastSegment();
      const payload = getPayload();
      await axios.put(`/api/competition-map/last-education/${id}`, {
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
    window.location.href = "/peta-persaingan/pendidikan-terakhir";
  };

  useEffect(() => {
    fetchLastEducation();
    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    if (!data) return;
    setValue("name", data?.name);
    setValue(
      "type",
      lastEdTypes.find((type) => type.value === data?.type)
    );
  }, [data]);

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
                              options={lastEdTypes}
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
      )}
    </>
  );
};

export default EditLastEducationForm;
