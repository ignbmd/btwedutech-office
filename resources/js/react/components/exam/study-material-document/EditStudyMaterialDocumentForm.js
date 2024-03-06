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

const documentId = getLastSegment();

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

const EditStudyMaterialDocumentForm = () => {
  const [doc, setDoc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    resolver: yupResolver(DocumentsFormSchema),
    defaultValues: getEmptyDocumentFields(),
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

  const fetchDocument = async () => {
    try {
      const response = await axios.get(
        `/api/exam/study-material/${studyMaterialId}/documents/${documentId}`
      );
      setDoc(response?.data ?? null);
    } catch (error) {
      console.error(error);
      setDoc(null);
    }
  };

  const updateStudyMaterialDocument = async (payload) => {
    try {
      const response = await axios.put(
        `/api/exam/study-material/${studyMaterialId}/documents/${documentId}`,
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
      const payload = {
        status: formValues.status,
        name: formValues.name,
        path: formValues.path,
        thumbnail: !formValues.thumbnail ? "-" : formValues.thumbnail,
        type: formValues.type.value,
        documentable_id: +studyMaterialId,
        documentable_type: "study-material",
      };

      const response = await updateStudyMaterialDocument(payload);
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
    toastr.success(`Dokumen Materi belajar berhasil diperbarui`, `Berhasil`, {
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
    fetchDocument();
    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    if (!doc) return;
    setValue("status", doc.status);
    setValue("name", doc.name);
    setValue("path", doc.path);
    setValue("thumbnail", !doc.thumbnail ? "-" : doc.thumbnail);
    setValue(
      "type",
      documentTypes.find((docType) => docType.value === doc.type)
    );
    setIsLoading(false);
  }, [doc]);

  return isLoading ? (
    <SpinnerCenter />
  ) : (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardBody>
          <Col md={6} className={classnames("mt-2 pl-0")}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Nama Dokumen Materi</Label>
                    <Input
                      {...rest}
                      innerRef={ref}
                      invalid={error && true}
                      id="name"
                      placeholder="PPT Nasionalisme 01"
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="path"
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
                      id="path"
                      placeholder="Pilih dokumen materi"
                      onClick={(e) => openFileManager(e, `path`)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="thumbnail"
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
                      id="thumbnail"
                      placeholder="Pilih dokumen thumbnail dokumen materi"
                      onClick={(e) => openFileManager(e, `thumbnail`)}
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
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Tipe Dokumen Materi</Label>
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
              name="status"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, value: isActive, ...rest } = field;
                return (
                  <>
                    <Label className="form-label">Status Dokumen Materi</Label>
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

export default EditStudyMaterialDocumentForm;
