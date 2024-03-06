import React, { useRef, useState } from "react";
import Axios from "axios";
import * as yup from "yup";
import Select from "react-select";
import PropTypes from "prop-types";
import classnames from "classnames";
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
  Label,
} from "reactstrap";
import { Save } from "react-feather";
import { CKEditor } from "ckeditor4-react";

import axios from "../../../utility/http";
import { getLastSegment, isObjEmpty } from "../../../utility/Utils";
import { programs } from "../../../config/program-cpns";
import { useEffect } from "react";
import SpinnerCenter from "../../core/spinners/Spinner";

const FormSchema = yup.object().shape({
  title: yup.string().required("Wajib diisi"),
  program: yup.object().required("Wajib diisi"),
  instruction: yup.string().required("Wajib diisi"),
});

const CreateEditInstructionForm = ({ type }) => {
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
      program: "",
      instruction: "",
    },
  });
  const isCanceled = useRef(false);
  const source = Axios.CancelToken.source();
  const forms = watch();

  const getPayload = () => {
    const form = getValues();
    const payload = {
      ...form,
      program: form.program?.slug,
    };
    return payload;
  };

  const getCurrentInstruction = async () => {
    try {
      const id = getLastSegment();
      const response = await axios.get(`/exam-cpns/instruction/detail/${id}`, {
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
    setValue("title", data.title);
    setValue(
      "program",
      programs.find((program) => program.slug == data.program)
    );
    setValue("instruction", data.instruction);
    setIsLoading(false);
  };

  const redirectToIndex = () => {
    window.location.href = "/ujian-cpns/instruksi";
  };

  const processForm = async () => {
    setIsSubmitting(true);
    const payload = getPayload();
    try {
      if (type === "edit") {
        const id = getLastSegment();
        await axios.put(`/exam-cpns/instruction/${id}`, payload);
      } else {
        await axios.post("/exam-cpns/instruction/create", payload);
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
                      <Label className="form-label">Judul Instruksi</Label>
                      <Input
                        {...rest}
                        id="title"
                        innerRef={ref}
                        invalid={error && true}
                        placeholder="Inputkan Judul Instruksi"
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
                name="instruction"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => {
                  return (
                    <>
                      <Label className="form-label">Instruksi</Label>
                      <FormGroup>
                        <div
                          className={classnames(error && "custom-is-invalid")}
                        >
                          <CKEditor
                            initData={value}
                            data={value}
                            onChange={({ editor }) =>
                              onChange(editor.getData())
                            }
                            config={{
                              extraPlugins: "mathjax",
                              mathJaxLib:
                                "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML",
                            }}
                          />
                        </div>
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    </>
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

CreateEditInstructionForm.propTypes = {
  type: PropTypes.oneOf(["create", "edit"]),
};

export default CreateEditInstructionForm;
