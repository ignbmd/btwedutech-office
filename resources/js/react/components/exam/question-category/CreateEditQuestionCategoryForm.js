import React, { useRef, useState } from "react";
import Axios from "axios";
import * as yup from "yup";
import Select from "react-select";
import PropTypes from "prop-types";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { yupResolver } from "@hookform/resolvers/yup";
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
  InputGroupText,
  Label,
} from "reactstrap";
import { Save, Youtube } from "react-feather";
import { CKEditor } from "ckeditor4-react";

import axios from "../../../utility/http";
import {
  normalNumber,
  baseNumeralOptions,
  getLastSegment,
  isObjEmpty,
} from "../../../utility/Utils";
import { programs } from "../../../config/programs";
import { useEffect } from "react";
import SpinnerCenter from "../../core/spinners/Spinner";

const specificPrograms = ["tps", "utbk", "tka-saintek", "tka-soshum", "pppk"];
const FormSchema = yup.object().shape({
  category: yup.string().required("Wajib diisi"),
  description: yup.string().required("Wajib diisi"),
  program: yup.object().required("Wajib diisi"),
  duration: yup.string().when("program", {
    is: (p) => p?.slug && specificPrograms.includes(p?.slug),
    then: yup.string().required("Wajib diisi"),
    otherwise: yup.string(),
  }),
  passing_grade: yup.string().required("Wajib diisi"),
  default_position: yup.string().required("Wajib diisi"),
});

const CreateEditSubQuestionCategoryForm = ({ type }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpecificProgramSelected, setIsSpecificProgramSelected] =
    useState(false);

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
      category: "",
      passing_grade: "",
      default_position: "",
      duration: "",
    },
  });
  const isCanceled = useRef(false);
  const source = Axios.CancelToken.source();
  const { program } = watch();

  const getPayload = () => {
    const form = getValues();
    const payload = {
      ...form,
      default_position: parseInt(form.default_position),
      passing_grade: parseInt(form.passing_grade),
      program: form.program?.slug,
      duration: form.duration ? parseInt(form.duration) : null,
    };
    return payload;
  };

  const getCurrentInstruction = async () => {
    try {
      const id = getLastSegment();
      const response = await axios.get(`/exam/question-category/detail/${id}`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const instructionData = data?.data ?? [];
      return instructionData;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const loadEdit = async () => {
    setIsLoading(true);
    const data = await getCurrentInstruction();
    setValue("category", data.category);
    setValue("description", data.description ?? "");
    setValue(
      "program",
      programs.find((program) => program.slug == data.program)
    );
    setValue("passing_grade", data.passing_grade);
    setValue("default_position", data.default_position);
    setValue("duration", data.duration ?? "");
    setData(data);
    setIsLoading(false);
  };

  const redirectToIndex = () => {
    window.location.href = "/ujian/kategori-soal";
  };

  const processForm = async () => {
    setIsSubmitting(true);
    const payload = getPayload();
    try {
      if (type === "edit") {
        const id = getLastSegment();
        await axios.put(`/exam/question-category/${id}`, payload);
      } else {
        await axios.post("/exam/question-category/create", payload);
      }
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const submitHandler = () => {
    trigger();
    if (isObjEmpty(errors)) {
      processForm();
    }
  };

  useEffect(() => {
    if (type === "edit") {
      loadEdit();
    }
  }, []);

  useEffect(() => {
    if (!isSpecificProgramSelected) {
      setValue("duration", "");
      return;
    }
    setValue("duration", data?.duration);
  }, [isSpecificProgramSelected]);

  useEffect(() => {
    if (!program?.slug) return;
    setIsSpecificProgramSelected(specificPrograms.includes(program?.slug));
  }, [program?.slug]);

  return (
    <Card>
      <CardBody className={classnames(isSubmitting && "block-content")}>
        {isLoading ? (
          <SpinnerCenter />
        ) : (
          <Form onSubmit={handleSubmit(submitHandler)}>
            <Col md={6} className={classnames("pl-0")}>
              <Controller
                name="category"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Nama Kategori</Label>
                      <Input
                        {...rest}
                        id="title"
                        placeholder="Contoh: TWK"
                        innerRef={ref}
                        invalid={error && true}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              <Controller
                name="description"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Deskripsi Kategori</Label>
                      <Input
                        {...rest}
                        id="description"
                        placeholder="Contoh: Tes Wawasan Kebangsaan"
                        innerRef={ref}
                        invalid={error && true}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              <Controller
                name="program"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill mt-1">
                      <Label className="form-label">Program</Label>
                      <Select
                        {...field}
                        isSearchable={false}
                        options={programs}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.slug}
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
                name="passing_grade"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Passing Grade</Label>
                      <Cleave
                        {...field}
                        options={baseNumeralOptions}
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        onChange={(e) => field.onChange(e.target.rawValue)}
                        value={field.value}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              {isSpecificProgramSelected ? (
                <Controller
                  name="duration"
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Durasi Kategori</Label>
                        <InputGroup
                          className={classnames({
                            "is-invalid": error && true,
                          })}
                        >
                          <Cleave
                            {...field}
                            options={normalNumber}
                            className={classnames("form-control", {
                              "is-invalid": error,
                            })}
                            onChange={(e) => field.onChange(e.target.rawValue)}
                            value={field.value ?? 0}
                            placeholder="Inputkan Durasi Kategori"
                          />

                          <InputGroupAddon addonType="append">
                            <InputGroupText>Detik</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
              ) : null}

              <Controller
                name="default_position"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Urutan Kategori</Label>
                      <Cleave
                        {...field}
                        options={baseNumeralOptions}
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        onChange={(e) => field.onChange(e.target.rawValue)}
                        value={field.value}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              <div className="text-right mt-4">
                {type == "create" ? (
                  <Button type="submit" color="gradient-success">
                    {isSubmitting ? (
                      "Sedang Menyimpan..."
                    ) : (
                      <>
                        <Save size={14} /> Simpan
                      </>
                    )}
                  </Button>
                ) : (
                  <Button type="submit" color="gradient-primary">
                    {isSubmitting ? (
                      "Sedang Memperbarui..."
                    ) : (
                      <>
                        <Save size={14} /> Perbarui
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Col>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

CreateEditSubQuestionCategoryForm.propTypes = {
  type: PropTypes.oneOf(["create", "edit"]),
};

export default CreateEditSubQuestionCategoryForm;
