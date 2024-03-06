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
import { programs } from "../../../config/programs";
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

const getStudyMaterialId = () => {
  const dom = document.getElementById("study-material-id");
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

const CreateStudyMaterialDocumentForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const fieldSchema = yup.object().shape({
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

  const studyMaterialId = getStudyMaterialId();

  const createStudyMaterialDocument = async (payload) => {
    try {
      const response = await axios.post(
        `/api/exam/study-material/${studyMaterialId}/documents`,
        {
          data: payload,
          cancelToken: source.token,
        }
      );
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
      const payload = formValues.documents.map((doc) => ({
        status: doc.status,
        name: doc.name,
        path: doc.path,
        thumbnail: !doc.thumbnail ? "-" : doc.thumbnail,
        type: doc.type.value,
        documentable_id: +studyMaterialId,
        documentable_type: "study-material",
      }));

      const response = await createStudyMaterialDocument(payload);
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
    toastr.success(`Dokumen Materi belajar berhasil ditambah`, `Berhasil`, {
      timeOut: 2000,
      closeButton: true,
      tapToDismiss: true,
      preventDuplicates: true,
      onHidden() {
        window.location.href = `/ujian/materi-belajar/dokumen/${studyMaterialId}`;
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

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
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

export default CreateStudyMaterialDocumentForm;
