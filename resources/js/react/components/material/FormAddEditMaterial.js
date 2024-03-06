import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Save, Trash2, X } from "react-feather";
import axios from "axios";
import FileUpload from "../core/file-upload/FileUpload";
import { useFileUpload } from "../../hooks/useFileUpload";
import FilePreview from "../core/file-upload/FilePreview";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Row,
  Col,
  Card,
  CardBody,
  FormGroup,
  FormFeedback,
  Label,
  Input,
  Button,
} from "reactstrap";
import { getUserFromBlade, getCsrf } from "../../utility/Utils";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import { AvRadioGroup, AvRadio } from "availity-reactstrap-validation-safe";
import classnames from "classnames";
import SpinnerCenter from "../core/spinners/Spinner";

const formSchema = yup.object().shape({
  title: yup.string().required("Judul harus diisi"),
  status: yup.string().required("Status harus dipilih"),
  attachments: yup.array().notRequired(),
  files: yup.array().when(["attachments"], {
    is: (attachments) => !attachments.length,
    then: yup.array().min(1, "File harus diisi minimal 1"),
  }),
});

const FormAddEditReport = ({ type }) => {
  const [file] = useState({ material: [] });
  const [user, setUser] = useState(getUserFromBlade());
  const [materialId, setMaterialId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    files,
    fileErrors,
    registerFile,
    handleRemoveFile,
    setInputRequireds,
    checkIsFileValid,
    handleSelectedFile,
    handleBeforeAddFile,
    handleError: handleFileError,
  } = useFileUpload(file);
  const {
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      status: "",
      attachments: [],
    },
    resolver: yupResolver(formSchema),
  });
  const attachmentsForm = useFieldArray({
    control,
    name: "attachments",
  });

  const { title: materialTitle } = watch();

  useEffect(async () => {
    setUser(getUserFromBlade());
    setMaterialId(getMaterialId());
  }, []);

  useEffect(() => {
    loadEdit();
  }, [materialId]);

  useEffect(() => {
    // console.log(attachmentsForm.fields.length, !materialTitle);
    if (attachmentsForm.fields.length === 0 && materialTitle) {
      setInputRequireds((current) => [...current, "material"]);
    }
  }, [attachmentsForm.fields]);

  const loadEdit = async () => {
    if (!materialId) return;
    const data = await fetchEdit();
    setValue("title", data?.title, { shouldValidate: true });
    setValue("sso_id", data?.sso_id, { shouldValidate: true });
    setValue("status", data?.status, { shouldValidate: true });
    setValue("attachments", data?.attachments);
  };

  const onSubmit = async (data) => {
    const isInputFileValid = checkIsFileValid();
    if (!isInputFileValid) return;
    const { material: materialFiles } = files;
    const fd = new FormData();

    fd.append("title", data?.title);
    fd.append("branch_code", user?.branch_code);
    fd.append("sso_id", user?.id);
    fd.append("status", data?.status);
    materialFiles.forEach((file) => {
      fd.append("files[]", file);
    });
    (data?.attachments ?? []).forEach((attachment) => {
      fd.append("attachments[]", JSON.stringify(attachment));
    });
    setIsSubmitting(true);
    const result = await saveMaterial(fd);
    setIsSubmitting(false);
    if (!result?.success) return;
    redirect();
  };

  const redirect = async () => {
    const url = `/material`;
    window.location.href = url;
  };

  const saveMaterial = async (formData) => {
    try {
      const materialId = getMaterialId();
      const url = `/api/learning/material/${materialId}`;
      const response = await axios.post(url, formData, {
        headers: {
          "X-CSRF-TOKEN": getCsrf(),
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.data;
      return data;
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.messages?.join("");
      if (!message) return;
      toastr.error(message, "Gagal!", {
        closeButton: true,
        tapToDismiss: false,
        timeOut: 3000,
      });
    }
  };

  const fetchEdit = async () => {
    try {
      const materialId = getMaterialId();
      const response = await axios.get(`/api/learning/material/${materialId}`);
      const data = await response.data;
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getMaterialId = () => {
    const dom = document.getElementById("materialId");
    return dom.innerText;
  };

  const getFileColor = (mimeType) => {
    const colors = {
      doc: "primary",
      docx: "primary",
      pdf: "success",
    };
    const isSupported = typeof colors[mimeType] != "undefined";
    return isSupported ? colors[mimeType] : "primary";
  };

  return (
    <Card>
      <CardBody>
        {!materialTitle && type === "edit" ? (
          <SpinnerCenter />
        ) : (
          <AvForm onSubmit={handleSubmit(onSubmit)}>
            <Row className="justify-content-between align-items-end">
              <Col md={8}>
                <Controller
                  control={control}
                  name="title"
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <Label for="title">Judul</Label>
                      <Input {...field} type="text" invalid={Boolean(error)} />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />

                <Controller
                  control={control}
                  name="status"
                  render={({ field: { onChange, value } }) => (
                    <AvRadioGroup
                      name="status"
                      value={value ?? "PUBLIC"}
                      onChange={(e) => onChange(e.target.value)}
                      required
                      validate={{
                        required: {
                          value: true,
                          errorMessage: "Status harus dipilih",
                        },
                      }}
                    >
                      <Label>Status</Label>
                      <div className="d-flex">
                        <AvRadio
                          className="mb-1 mr-1"
                          customInput
                          label="Public"
                          value="PUBLIC"
                        />
                        <AvRadio customInput label="Private" value="PRIVATE" />
                      </div>
                    </AvRadioGroup>
                  )}
                />

                <FormGroup>
                  <Label>Lampiran</Label>
                  <FileUpload
                    {...registerFile(
                      "material",
                      (attachmentsForm.fields.length == 0 && !materialTitle) ||
                        !materialId
                    )}
                    name="material"
                    maxFileSize="50mb"
                    allowMultiple={true}
                    changed={handleSelectedFile}
                    handleRemoveFile={handleRemoveFile}
                    handleBeforeAddFile={handleBeforeAddFile}
                    onerror={(e) => handleFileError("material", e)}
                    className={classnames({
                      "filepond-is-invalid": fileErrors.material[0],
                    })}
                  />
                  <p className="text-danger small">{fileErrors.material[0]}</p>

                  {attachmentsForm.fields.map((attachment, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <FilePreview
                        title={attachment.file_name}
                        desc={attachment.mime_type}
                        color={`light-${getFileColor(attachment.mime_type)}`}
                        className="mb-0"
                      />
                      <Trash2
                        size="20"
                        className="text-danger mr-1 cursor-pointer"
                        onClick={() => attachmentsForm.remove(i)}
                      />
                    </div>
                  ))}
                </FormGroup>
              </Col>
            </Row>

            <Col md="8">
              <div className="d-flex justify-content-end mb-5">
                <Button
                  disabled={isSubmitting}
                  color={type === "edit" ? "primary" : "success"}
                >
                  <Save size={14} className="mr-50" />{" "}
                  {isSubmitting
                    ? "Menyimpan..."
                    : type === "edit"
                    ? "Perbarui"
                    : "Simpan"}
                </Button>
              </div>
            </Col>
          </AvForm>
        )}
      </CardBody>
    </Card>
  );
};

export default FormAddEditReport;
