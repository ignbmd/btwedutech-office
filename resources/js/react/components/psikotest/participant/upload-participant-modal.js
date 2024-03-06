import React, { useState, useContext } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormFeedback,
} from "reactstrap";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import "./CustomModal.css";
import { getCsrf, showToast } from "../../../utility/Utils";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { useEffect } from "react";

registerPlugin(FilePondPluginFileValidateType);

const filePondAcceptedFileTypes = ["application/pdf"];

const UploadParticipantModal = ({ open, close }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formSchema = yup.object().shape({
    files: yup
      .array()
      .min(1, "Wajib dipilih")
      .max(10, "Maksimal memilih 10 file")
      .required("Wajib dipilih")
      .test(
        "file-pattern",
        "Nama file tidak sesuai pola yang ditentukan",
        (value) => {
          const pattern = /^Laporan [A-Z0-9_\-]{10}\.pdf$/; // Perubahan pada pola
          return value.every((file) => pattern.test(file.name));
        }
      ),
  });
  const formDefaultValues = {
    files: [],
  };
  const {
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: formDefaultValues,
  });
  const { files } = watch();

  const submitForm = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      data.files.forEach((file, index) => {
        formData.append(`${index}`, file);
      });
      const response = await axios.post(
        "/api/psikotest/participant-list",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRF-TOKEN": getCsrf(),
          },
        }
      );
      showToast({
        type: "info",
        title: "Informasi",
        message: "Dokumen hasil minat bakat siswa sedang diproses",
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message:
          error?.response?.data?.message ??
          "Terjadi kesalahn silakan coba lagi nanti",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Modal
        isOpen={open}
        backdrop="static"
        centered={true}
        scrollable={true}
        keyboard={false}
        className="text-center"
      >
        <ModalHeader
          style={{ justifyContent: "center", backgroundColor: "#fff" }}
        >
          <div className="text-center my-2">Upload Data Hasil Peserta</div>
        </ModalHeader>
        <Form onSubmit={handleSubmit(submitForm)}>
          <ModalBody
            style={{
              padding: "0 20px",
              justifyContent: "center",
            }}
          >
            <Controller
              name="files"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <div>
                    <FilePond
                      acceptedFileTypes={filePondAcceptedFileTypes}
                      files={field.value}
                      allowMultiple={true}
                      maxFiles={10}
                      onupdatefiles={(fileItems) => {
                        field.onChange(
                          fileItems.map((fileItem) => fileItem.file)
                        );
                      }}
                      // server={{
                      //   process: {
                      //     url: "/api/psikotest/participant-list/process-pdf",
                      //     method: "POST",
                      //     withCredentials: false,
                      //     headers: {
                      //       "X-CSRF-TOKEN": getCsrf(),
                      //     },
                      //     onload: handleServerResponse,
                      //   },
                      // }}
                      name="files"
                      labelIdle='
                      <div class="mt-1">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <p class="my-1 filepond-label">Seret & Jatuhkan atau <span class="filepond--label-action">Pilih File</span> untuk di upload<p>
                        <p class="my-1 text-info-sm">PDF</p>
                      </div>'
                    />
                    {errors.files && (
                      <div style={{ color: "red" }}>{errors.files.message}</div>
                    )}
                    {files.map((file) => {
                      const pattern = /^Laporan [A-Z0-9]{10}\.pdf$/;
                      const isValid = pattern.test(file.name);

                      if (!isValid) {
                        return (
                          <div key={file.name} style={{ color: "red" }}>
                            {file.name} - Format file tidak sesuai dengan format
                            yang ditentukan
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                );
              }}
            />
          </ModalBody>
          <p style={{ marginLeft: 20, textAlign: "left", color: "#32cd32" }}>
            Contoh Format Nama File "Laporan (kode_ujian).pdf
          </p>
          <ModalFooter style={{ justifyContent: "center" }}>
            <Button color="secondary" onClick={close} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={files.length === 0 || isSubmitting}
            >
              Simpan Data
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default UploadParticipantModal;
