import React, { Fragment, useEffect, useState, useRef } from "react";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import Flatpickr from "react-flatpickr";
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

import { baseNumeralOptions } from "../../../utility/Utils";
import "flatpickr/dist/themes/airbnb.css";
import { nanoid } from "nanoid";
import axios from "axios";
import { programs } from "../../../config/program-cpns";
import MultipleInputSelect from "../../core/multiple-input-select/MultipleInputSelect";

const documentTypes = [
  { label: "PDF", value: "PDF" },
  { label: "PPT", value: "PPT" },
  { label: "VIDEO", value: "VIDEO" },
];

const DocumentsFormSchema = yup.object().shape({
  id: yup.string().nullable().notRequired(),
  status: yup.boolean().required("Wajib diisi"),
  name: yup.string().required("Wajib diisi"),
  path: yup.string().required("Wajib diisi"),
  thumbnail: yup.string().optional().notRequired().nullable(),
  type: yup.object().typeError("Wajib dipilih").required("Wajib dipilih"),
});

const getS3AWSURL = () => {
  const dom = document.getElementById("s3-aws-url");
  return dom.innerText;
};

const getEmptyDocumentFields = () => {
  return {
    id: nanoid(),
    status: false,
    name: "",
    path: "",
    thumbnail: "",
    type: "",
  };
};

const CreateStudyMaterialForm = () => {
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

  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const fieldSchema = yup.object().shape({
    status: yup.boolean().required("Wajib dipilih"),
    title: yup.string().required("Wajib diisi"),
    description: yup.string().required("Wajib diisi"),
    thumbnail: yup.string().optional().notRequired(),
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
    documents: yup
      .array()
      .of(DocumentsFormSchema)
      .required()
      .min(1, "Minimal Membuat 1 Dokumen"),
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
      program: { name: "SKD", slug: "skd" },
      documents: [getEmptyDocumentFields()],
    },
  });

  const {
    fields: documents,
    append,
    update,
    remove,
  } = useFieldArray({
    control,
    name: "documents",
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

  const fetchPreTestPackages = async (program) => {
    try {
      setIsFetchingPreTestPackages(true);
      const response = await axios.get(
        `/api/exam-cpns/pre-test-package/programs/${program}`,
        { cancelToken: source.token }
      );
      setPreTestPackages(response.data.data);
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
        `/api/exam-cpns/post-test-package/programs/${program}`,
        { cancelToken: source.token }
      );
      setPostTestPackages(response.data.data);
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
        `/api/exam-cpns/question-category/${program}`,
        { cancelToken: source.token }
      );
      setQuestionCategories(response.data.data);
    } catch (error) {
      setQuestionCategories([]);
      console.error(error);
    } finally {
      setIsFetchingQuestionCategories(false);
    }
  };

  const createStudyMaterial = async (payload) => {
    try {
      const response = await axios.post(`/api/exam-cpns/study-material`, {
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
        documents: formValues.documents.map((doc) => ({
          status: doc.status,
          name: doc.name,
          path: doc.path,
          thumbnail: !doc.thumbnail ? "-" : doc.thumbnail,
          type: doc.type.value,
        })),
      };

      const response = await createStudyMaterial(payload);
      if (response.status == 201 && !isCanceled.current) showSuccessToast();
      else showErrorToast();
    } catch (error) {
      if (!isCanceled.current) {
        console.error(error);
        showErrorToast();
        setIsSubmitting(false);
      }
    }
  };

  const handleAddNewForm = () => {
    append(getEmptyDocumentFields());
  };

  const showSuccessToast = () => {
    toastr.success(`Materi belajar berhasil ditambah`, `Berhasil`, {
      timeOut: 2000,
      closeButton: true,
      tapToDismiss: true,
      preventDuplicates: true,
      onHidden() {
        window.location.href = `/ujian-cpns/materi-belajar`;
      },
    });
  };

  const showErrorToast = () => {
    toastr.error(
      `Materi belajar gagal ditambah, silakan coba lagi nanti`,
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
    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    if (!program?.slug) return;
    setValue("pre_test_packages_id", "");
    setValue("post_test_packages_id", "");
    setValue("question_category_id", "");
    fetchPreTestPackages(program?.slug);
    fetchPostTestPackages(program?.slug);
    fetchQuestionCategories(program?.slug);
  }, [program?.slug]);

  return (
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
                    defaultValue={[]}
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
                    defaultValue={[]}
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
      </Card>

      <Card>
        <CardBody>
          {documents.map((document, index) => (
            <Fragment key={document.id}>
              <div className="content-header">
                <h5 className="mb-0 text-primary font-weight-bolder">
                  #{index + 1}
                </h5>
                <small className="text-muted">
                  Tambah dokumen untuk materi
                </small>
              </div>

              <Col md={6} className={classnames("mt-2 pl-0")}>
                <Controller
                  name={`documents.${index}.name`}
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">
                          Nama Dokumen Materi
                        </Label>
                        <Input
                          {...rest}
                          innerRef={ref}
                          invalid={error && true}
                          id={`documents.${index}.name`}
                          placeholder="PPT Nasionalisme 01"
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

                <Controller
                  name={`documents.${index}.path`}
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Dokumen Materi</Label>
                        <Input
                          {...rest}
                          innerRef={ref}
                          invalid={error && true}
                          id={`documents.${index}.path`}
                          placeholder="Pilih dokumen materi"
                          onClick={(e) =>
                            openFileManager(e, `documents.${index}.path`)
                          }
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

                <Controller
                  name={`documents.${index}.thumbnail`}
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">
                          Thumbnail Dokumen Materi <small>(Opsional)</small>
                        </Label>
                        <Input
                          {...rest}
                          innerRef={ref}
                          invalid={error && true}
                          id={`documents.${index}.thumbnail`}
                          placeholder="Pilih dokumen thumbnail dokumen materi"
                          onClick={(e) =>
                            openFileManager(e, `documents.${index}.thumbnail`)
                          }
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

                <Controller
                  name={`documents.${index}.type`}
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">
                          Tipe Dokumen Materi
                        </Label>
                        <Select
                          {...field}
                          styles={{
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                          }}
                          isSearchable={true}
                          options={documentTypes}
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
                  name={`documents.${index}.status`}
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, value: isActive, ...rest } = field;
                    return (
                      <>
                        <Label className="form-label">
                          Status Dokumen Materi
                        </Label>
                        <CustomInput
                          {...rest}
                          className="mt-50"
                          innerRef={ref}
                          type="switch"
                          id={`documents.${index}.status`}
                          checked={isActive}
                          label={isActive ? "Aktif" : "Tidak Aktif"}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </>
                    );
                  }}
                />
              </Col>

              {/* Add & Remove Button */}
              <div className="d-flex mt-2 justify-content-end align-items-center">
                {documents.length > 1 ? (
                  <Button
                    size="md"
                    color="danger"
                    className="mr-1"
                    onClick={() => remove(index)}
                  >
                    <Trash2 size={14} /> Hapus Formulir
                  </Button>
                ) : null}

                <Controller
                  name={`documents.${index}.form_action`}
                  control={control}
                  defaultValue={false}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, value: isActive, ...rest } = field;
                    return (
                      <Button color="primary" onClick={handleAddNewForm}>
                        <Plus size={14} /> Tambah Formulir Baru
                      </Button>
                      // <ButtonDropdown
                      //   isOpen={isActive}
                      //   toggle={() => field.onChange(!isActive)}
                      // >
                      //   <DropdownToggle color="primary" caret>
                      //     <Plus size={14} /> Tambah Formulir
                      //   </DropdownToggle>
                      //   <DropdownMenu>
                      //     <DropdownItem
                      //       onClick={handleAddNewForm}
                      //       className="w-100"
                      //     >
                      //       Buat Formulir Baru
                      //     </DropdownItem>
                      //   </DropdownMenu>
                      // </ButtonDropdown>
                    );
                  }}
                />
              </div>
              {documents.length !== index + 1 ? (
                <hr className="my-3 mx-n2 border-primary" />
              ) : null}
              {/* End Add & Remove Button */}
            </Fragment>
          ))}
        </CardBody>

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

export default CreateStudyMaterialForm;
