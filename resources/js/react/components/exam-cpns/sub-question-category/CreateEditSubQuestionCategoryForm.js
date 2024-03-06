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
  Label,
} from "reactstrap";
import { Save } from "react-feather";
import { CKEditor } from "ckeditor4-react";

import axios from "../../../utility/http";
import {
  baseNumeralOptions,
  getLastSegment,
  isObjEmpty,
} from "../../../utility/Utils";
import { programs } from "../../../config/programs";
import { useEffect } from "react";
import SpinnerCenter from "../../core/spinners/Spinner";

const FormSchema = yup.object().shape({
  category: yup.object().required("Wajib diisi"),
  sub_category: yup.string().required("Wajib diisi"),
  passing_grade: yup.string().required("Wajib diisi"),
});

const CreateEditSubQuestionCategoryForm = ({ type }) => {
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [categories, setCategories] = useState();
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
      sub_category: "",
      passing_grade: "",
    },
  });
  const isCanceled = useRef(false);
  const source = Axios.CancelToken.source();
  const forms = watch();

  const getCategories = async () => {
    try {
      setIsFetchingCategories(true);
      const response = await axios.get(`/exam-cpns/question-category`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const categoryData = data?.data ?? [];
      if (!isCanceled.current) {
        setIsFetchingCategories(false);
        setCategories(categoryData);
      }
    } catch (error) {
      console.log(error);
      setIsFetchingCategories(false);
    }
  };

  const getCurrentSubCategory = async () => {
    try {
      const id = getLastSegment();
      const response = await axios.get(
        `/exam-cpns/sub-question-category/detail/${id}`,
        {
          cancelToken: source.token,
        }
      );
      const data = await response.data;
      const subQuestionCategoryData = data?.data ?? [];
      return subQuestionCategoryData;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const loadEdit = async () => {
    setIsLoading(true);
    const data = await getCurrentSubCategory();
    setValue("category", data.question_categories);
    setValue("sub_category", data.title);
    setValue("passing_grade", data.passing_grade);
    setIsLoading(false);
  };

  const redirectToIndex = () => {
    window.location.href = "/ujian-cpns/sub-kategori-soal";
  };

  const getPayload = () => {
    const form = getValues();
    const payload = {
      title: form.sub_category,
      question_categories_id: form.category?.id,
      passing_grade: parseInt(form.passing_grade),
      program: form.category?.program,
    };
    return payload;
  };

  const processForm = async () => {
    setIsSubmitting(true);
    const payload = getPayload();
    try {
      if (type === "edit") {
        const id = getLastSegment();
        await axios.put(`/exam-cpns/sub-question-category/${id}`, payload);
      } else {
        await axios.post("/exam-cpns/sub-question-category/create", payload);
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
    getCategories();
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
                name="category"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill mt-1">
                      <Label className="form-label">Kategori</Label>
                      <Select
                        {...field}
                        isSearchable={false}
                        options={categories}
                        isLoading={isFetchingCategories}
                        isDisabled={isFetchingCategories}
                        getOptionLabel={(option) => option.category}
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
                name="sub_category"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Nama Sub Kategori</Label>
                      <Input
                        {...rest}
                        id="sub_category"
                        innerRef={ref}
                        invalid={error && true}
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

              <div className="text-right mt-4">
                {type == "create" ? (
                  <Button
                    type="submit"
                    color="gradient-success"
                    disabled={isFetchingCategories}
                  >
                    {isSubmitting ? (
                      "Sedang Menyimpan..."
                    ) : (
                      <>
                        <Save size={14} /> Simpan
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    color="gradient-primary"
                    disabled={isFetchingCategories}
                  >
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
