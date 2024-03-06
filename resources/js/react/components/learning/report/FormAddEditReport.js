import { useState, useEffect } from "react";
import { ContentState, convertFromHTML, EditorState } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { Editor } from "react-draft-wysiwyg";
import { Save, Trash, Trash2, X } from "react-feather";
import { useForm, Controller } from "react-hook-form";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import axios from "axios";
import FileUpload from "../../core/file-upload/FileUpload";
import { useFileUpload } from "../../../hooks/useFileUpload";
import FilePreview from "../../core/file-upload/FilePreview";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  FormFeedback,
  Label,
  Input,
  Button,
} from "reactstrap";

const formSchema = yup.object().shape({
  title: yup.string().required("Judul harus diisi"),
});

const FormAddEditReport = ({ type }) => {
  const [file] = useState({ report: [] });
  const [reportId, setReportId] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      title: "",
    },
    resolver: yupResolver(formSchema),
  });
  const { files, registerFile, checkIsFileValid, handleSelectedFile } =
    useFileUpload(file);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    loadEdit();
  }, [reportId]);

  const initialize = () => {
    setReportId(getReportId());
  };

  const loadEdit = async () => {
    if (!reportId) return;
    const data = await fetchEdit();
    // Set title
    setValue("title", data.title, { shouldValidate: true });

    // Set Editor
    setEditorState(
      EditorState.createWithContent(
        ContentState.createFromBlockArray(convertFromHTML(data.description))
      )
    );
    setAttachments(data.attachments);
  };

  const handleRemoveAttachment = (id) => {
    const newAttachments = [...attachments].filter((v) => v._id != id);
    setAttachments(newAttachments);
  };

  const onSubmit = async (data) => {
    const description = stateToHTML(editorState.getCurrentContent());

    const isInputFileValid = checkIsFileValid();
    if (!isInputFileValid) return;

    const { report: reportFiles } = files;

    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("description", description);
    fd.append("class_schedule_id", getScheduleId());
    fd.append("classroom_id", getClassroomId());
    reportFiles.forEach((file) => {
      fd.append("files[]", file);
    });
    attachments.forEach((attachment) => {
      fd.append("attachments[]", JSON.stringify(attachment));
    });

    setIsSubmitting(true);
    const result = await fetchSaveReport(fd);
    setIsSubmitting(false);
    if (!result?.success) return;
    redirect();
  };

  const redirect = async () => {
    const url = `/pembelajaran/laporan/${getScheduleId()}`;
    window.location.href = url;
  };

  const fetchSaveReport = async (formData) => {
    try {
      const reportId = getReportId();
      const url = `/api/learning/report/${reportId}`;
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
      const reportId = getReportId();
      const url = `/api/learning/report/${reportId}`;
      const response = await axios.get(url);
      const data = await response.data;
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getCsrf = () => {
    const csrf = document.querySelector('meta[name="csrf-token"]').content;
    return csrf;
  };

  const getScheduleId = () => {
    const dom = document.getElementById("scheduleId");
    return dom.innerText;
  };

  const getClassroomId = () => {
    const dom = document.getElementById("classroomId");
    return dom.innerText;
  };

  const getReportId = () => {
    const dom = document.getElementById("reportId");
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
        <Form onSubmit={handleSubmit(onSubmit)}>
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

              <FormGroup>
                <Label for="description">Isi Laporan</Label>
                <Editor
                  editorState={editorState}
                  onEditorStateChange={setEditorState}
                />
              </FormGroup>

              <FormGroup>
                <Label>
                  Lampiran <small>(Opsional)</small>
                </Label>
                <FileUpload
                  {...registerFile("report")}
                  allowMultiple={true}
                  changed={handleSelectedFile}
                  name="report"
                  maxFileSize="5mb"
                />
                {attachments.map((attachment) => (
                  <div
                    key={attachment._id}
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
                      onClick={() => {
                        handleRemoveAttachment(attachment._id);
                      }}
                    />
                  </div>
                ))}
              </FormGroup>
            </Col>
          </Row>

          <Col md="8">
            <div className="d-flex justify-content-end mb-5">
              <Button
                color={type === "edit" ? "primary" : "success"}
                disabled={isSubmitting}
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
        </Form>
      </CardBody>
    </Card>
  );
};

export default FormAddEditReport;
