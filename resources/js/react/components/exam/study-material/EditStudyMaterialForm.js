import * as yup from "yup";
import { nanoid } from "nanoid";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { Fragment, useState, useEffect, useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { getLastSegment } from "../../../utility/Utils";
import {
  Col,
  Card,
  Form,
  Input,
  Label,
  Button,
  CardBody,
  FormGroup,
  InputGroup,
  CustomInput,
  FormFeedback,
  InputGroupText,
  InputGroupAddon,
  CardHeader,
} from "reactstrap";
import { Save } from "react-feather";
import MultipleInputSelect from "../../core/multiple-input-select/MultipleInputSelect";

import { baseNumeralOptions } from "../../../utility/Utils";
import "flatpickr/dist/themes/airbnb.css";
import { programs } from "../../../config/programs";
import SpinnerCenter from "../../core/spinners/Spinner";
import axios from "axios";

const id = getLastSegment();

const getS3AWSURL = () => {
  const dom = document.getElementById("s3-aws-url");
  return dom.innerText;
};

const EditStudyMaterialForm = () => {
  const [studyMaterial, setStudyMaterial] = useState(null);
  const [preTestPackages, setPreTestPackages] = useState([]);
  const [isFetchingPreTestPackages, setIsFetchingPreTestPackages] =
    useState(false);
  const [postTestPackages, setPostTestPackages] = useState([]);
  const [isFetchingPostTestPackages, setIsFetchingPostTestPackages] =
    useState(false);
  const [questionCategories, setQuestionCategories] = useState([]);
  const [isFetchingQuestionCategories, setIsFetchingQuestionCategories] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const fieldSchema = yup.object().shape({
    status: yup.boolean().required("Wajib dipilih"),
    title: yup.string().required("Wajib diisi"),
    description: yup.string().required("Wajib diisi"),
    thumbnail: yup.string().optional().notRequired().nullable(),
    foot_note: yup.string().required("Wajib diisi"),
    order: yup.string().required("Wajib diisi"),
    meta: yup.array().of(yup.string()).optional().notRequired(),
    tags: yup.array().of(yup.string()).optional().notRequired(),
    pre_test_packages_id: yup
      .object()
      .typeError("Wajib diisi")
      .required("Wajib diisi"),
    post_test_packages_id: yup
      .object()
      .typeError("Wajib diisi")
      .required("Wajib diisi"),
    question_category_id: yup
      .object()
      .typeError("Wajib diisi")
      .required("Wajib diisi"),
    program: yup.object().required("Wajib diisi"),
  });

  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(fieldSchema),
    defaultValues: {
      status: true,
      title: "",
      description: "",
      thumbnail: "",
      order: 1,
      foot_note: "",
      meta: [],
      tags: [],
      pre_test_packages_id: "",
      post_test_packages_id: "",
      question_category_id: "",
      program: {},
    },
  });

  const { program } = watch();

  window.openFileManager = (e, key) => {
    e.preventDefault();
    window.open(
      `/file-manager?key=${key}`,
      "Manajer File",
      "height=600;weight=800"
    );
  };

  window.setFileAttachment = (key, url) => {
    let s3AWSURL = getS3AWSURL();
    let path = new URL(url).pathname;
    path = path.substr(path.indexOf("/") + 1);
    setValue(key, `${s3AWSURL}/${path}`);
  };

  const fetchStudyMaterial = async (id) => {
    try {
      const response = await axios.get(`/api/exam/study-material/${id}`, {
        cancelToken: source.token,
      });
      setStudyMaterial(response.data);
    } catch (error) {
      setStudyMaterial(null);
      console.error(error);
    }
  };

  const fetchPreTestPackages = async (program) => {
    try {
      setIsFetchingPreTestPackages(true);
      const response = await axios.get(
        `/api/exam/pre-test-package/programs/${program}`,
        { cancelToken: source.token }
      );
      setPreTestPackages(response.data.data);
      setValue(
        "pre_test_packages_id",
        response?.data.data?.find(
          (preTestPackage) =>
            preTestPackage?.id === studyMaterial?.pre_test_packages_id
        )
      );
    } catch (error) {
      setPreTestPackages([]);
      console.error(error);
    } finally {
      setIsFetchingPreTestPackages(false);
    }
  };

  const fetchPostTestPackages = async (program) => {
    try {
      setIsFetchingPostTestPackages(true);
      const response = await axios.get(
        `/api/exam/post-test-package/programs/${program}`,
        { cancelToken: source.token }
      );
      setPostTestPackages(response.data.data);
      setValue(
        "post_test_packages_id",
        response?.data?.data?.find(
          (postTestPackage) =>
            postTestPackage?.id === studyMaterial?.post_test_packages_id
        )
      );
    } catch (error) {
      setPostTestPackages([]);
      console.error(error);
    } finally {
      setIsFetchingPostTestPackages(false);
    }
  };

  const fetchQuestionCategories = async (program) => {
    try {
      setIsFetchingQuestionCategories(true);
      const response = await axios.get(
        `/api/exam/question-category/${program}`,
        { cancelToken: source.token }
      );
      setQuestionCategories(response.data.data);
      setValue(
        "question_category_id",
        response?.data?.data?.find(
          (questionCategory) =>
            questionCategory?.id === studyMaterial?.question_category_id
        )
      );
    } catch (error) {
      setQuestionCategories([]);
      console.error(error);
    } finally {
      setIsFetchingQuestionCategories(false);
    }
  };

  const updateStudyMaterial = async (id, payload) => {
    try {
      const response = await axios.put(`/api/exam/study-material/${id}`, {
        data: payload,
        cancelToken: source.token,
      });
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);

      trigger();

      const formValues = getValues();
      const payload = {
        status: formValues.status,
        title: formValues.title,
        description: formValues.description,
        thumbnail: !formValues.thumbnail ? "-" : formValues.thumbnail,
        order: +formValues.order,
        foot_note: formValues.foot_note,
        meta: formValues.meta,
        tags: formValues.tags,
        pre_test_packages_id: formValues.pre_test_packages_id.id,
        post_test_packages_id: formValues.post_test_packages_id.id,
        question_category_id: formValues.question_category_id.id,
        program: formValues.program.slug,
      };

      const response = await updateStudyMaterial(id, payload);
      if (response.status == 200 && !isCanceled.current) showSuccessToast();
      else showErrorToast();
    } catch (error) {
      if (!isCanceled.current) {
        console.error(error);
        showErrorToast();
        setIsSubmitting(false);
      }
    }
  };

  const showSuccessToast = () => {
    toastr.success(`Materi belajar berhasil diperbarui`, `Berhasil`, {
      timeOut: 2000,
      closeButton: true,
      tapToDismiss: true,
      preventDuplicates: true,
      onHidden() {
        window.location.href = `/ujian/materi-belajar`;
      },
    });
  };

  const showErrorToast = () => {
    toastr.error(
      `Materi belajar gagal diperbarui, silakan coba lagi nanti`,
      `Terjadi kesalahan`,
      {
        timeOut: 2000,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
      }
    );
  };

  useEffect(() => {
    fetchStudyMaterial(id);
    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    if (!studyMaterial) return;
    setValue(
      "program",
      programs?.find((program) => program?.slug === studyMaterial?.program)
    );
    setValue("title", studyMaterial?.title);
    setValue("status", studyMaterial?.status);
    setValue("description", studyMaterial?.description);
    setValue("thumbnail", studyMaterial?.thumbnail);
    setValue("order", studyMaterial?.order);
    setValue("foot_note", studyMaterial?.foot_note);
    setValue("meta", studyMaterial?.meta);
    setValue("tags", studyMaterial?.tags);
    console.log(studyMaterial?.meta, studyMaterial.tags);
    setIsLoading(false);
  }, [studyMaterial]);

  useEffect(() => {
    if (!program?.slug || !studyMaterial?.id) return;
    setValue("pre_test_packages_id", "");
    setValue("post_test_packages_id", "");
    setValue("question_category_id", "");
    fetchPreTestPackages(program?.slug);
    fetchPostTestPackages(program?.slug);
    fetchQuestionCategories(program?.slug);
  }, [program?.slug]);

  return isLoading ? (
    <SpinnerCenter />
  ) : (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <Col md={6} className={classnames("pl-0")}>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Nama Materi</Label>
                    <Input
                      {...rest}
                      id="title"
                      innerRef={ref}
                      invalid={error && true}
                      placeholder="Contoh: Nasionalisme"
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
                    <Label className="form-label">Deskripsi</Label>
                    <Input
                      {...rest}
                      id="description"
                      innerRef={ref}
                      invalid={error && true}
                      type="textarea"
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
              name="pre_test_packages_id"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill mt-1">
                    <Label className="form-label">Modul Pre-Test</Label>
                    <Select
                      {...field}
                      isSearchable={true}
                      isLoading={isFetchingPreTestPackages}
                      isDisabled={isFetchingPreTestPackages}
                      options={preTestPackages}
                      getOptionLabel={(option) => option.title}
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
              name="post_test_packages_id"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill mt-1">
                    <Label className="form-label">Modul Post-Test</Label>
                    <Select
                      {...field}
                      isSearchable={true}
                      isLoading={isFetchingPostTestPackages}
                      isDisabled={isFetchingPostTestPackages}
                      options={postTestPackages}
                      getOptionLabel={(option) => option.title}
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
              name="question_category_id"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill mt-1">
                    <Label className="form-label">Kategori Soal Materi</Label>
                    <Select
                      {...field}
                      isSearchable={true}
                      isLoading={isFetchingQuestionCategories}
                      isDisabled={isFetchingQuestionCategories}
                      options={questionCategories}
                      getOptionLabel={(option) => option.description}
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
              name="order"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Urutan ke</Label>
                    <Cleave
                      {...field}
                      options={baseNumeralOptions}
                      className={classnames("form-control bg-white", {
                        "is-invalid": error,
                      })}
                      onChange={(e) => field.onChange(e.target.rawValue)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              isClearable
              control={control}
              name="input_tags"
              render={({ field, fieldState: { error } }) => (
                <FormGroup className="flex-fill mt-50">
                  <Label>
                    Tag <small>(Opsional)</small>
                  </Label>
                  <MultipleInputSelect
                    setValue={setValue}
                    fieldName={field.name}
                    valueName="tags"
                    defaultValue={studyMaterial?.tags ?? []}
                    // valueName="tags"
                    currentValue={field.value}
                    changeHandler={field.onChange}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                  <small>
                    Gunakan simbol koma (,) untuk penginputan lebih dari 1
                  </small>
                </FormGroup>
              )}
            />

            <Controller
              isClearable
              control={control}
              name="input_meta"
              render={({ field, fieldState: { error } }) => (
                <FormGroup className="flex-fill mt-50">
                  <Label>
                    Meta <small>(Opsional)</small>
                  </Label>
                  <MultipleInputSelect
                    setValue={setValue}
                    fieldName={field.name}
                    valueName="meta"
                    defaultValue={studyMaterial?.meta}
                    // valueName="tags"
                    currentValue={field.value}
                    changeHandler={field.onChange}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                  <small>
                    Gunakan simbol koma (,) untuk penginputan lebih dari 1
                  </small>
                </FormGroup>
              )}
            />

            <Controller
              name="thumbnail"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">
                      Thumbnail Materi <small>(Opsional)</small>
                    </Label>
                    <Input
                      {...rest}
                      id="thumbnail"
                      innerRef={ref}
                      invalid={error && true}
                      placeholder="Pilih dokumen thumbnail materi"
                      onClick={(e) => openFileManager(e, "thumbnail")}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="foot_note"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Catatan Kaki</Label>
                    <Input
                      {...rest}
                      id="description"
                      innerRef={ref}
                      invalid={error && true}
                      placeholder="Contoh: 28 halaman"
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="status"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, value: isActive, ...rest } = field;
                return (
                  <>
                    <Label className="form-label">Status Materi</Label>
                    <CustomInput
                      {...rest}
                      className="mt-50"
                      innerRef={ref}
                      type="switch"
                      id="status"
                      checked={isActive}
                      label={isActive ? "Aktif" : "Tidak Aktif"}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </>
                );
              }}
            />
          </Col>
        </CardHeader>
        <div className={classnames("bg-light-success text-right mt-3 p-2")}>
          <Button
            type="submit"
            color="gradient-success"
            disabled={isSubmitting}
          >
            <Save size={14} /> {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </Card>
    </Form>
  );
};

export default EditStudyMaterialForm;
