import { useContext, useEffect, useState } from "react";
import { Alert, Button, Modal, ModalBody } from "reactstrap";
import { StudentReportContext } from "../../../context/StudentReportContext";
import "./SendDocumentModal.css";
import { Edit3 } from "react-feather";
import { showToast } from "../../../utility/Utils";

const SendDocumentModal = () => {
  const {
    isSendDocumentModalShown,
    toggleShowSendDocumentModal,
    studentProfile,
    studentResult,
    sendDocumentModalType,
    selectedUkaType,
    selectedModuleType,
  } = useContext(StudentReportContext);
  const [isSendingDocument, setIsSendingDocument] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(
    studentProfile?.parent_number ? studentProfile?.parent_number : ""
  );
  const [isEditPhoneNumber, setIsEditPhoneNumber] = useState(false);
  const [phoneNumberErrorMessage, setPhoneNumberErrorMessage] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const getReportTypeLabel = (documentType) => {
    if (documentType == "STUDENT_UKA_STAGE_REPORT") {
      return "UKA Stage";
    }
    return "Perkembangan Belajar";
  };

  const handleOnButtonClick = () => {
    if (isEditPhoneNumber) {
      const phoneNumberInputElement = document.getElementById("phone-number");
      const phoneNumberInputValue = phoneNumberInputElement.value;
      if (phoneNumberInputValue && !isNaN(phoneNumberInputValue)) {
        setPhoneNumber(phoneNumberInputValue);
      }
      if (!phoneNumberInputValue) {
        setPhoneNumberErrorMessage("Nomor tidak boleh kosong");
        phoneNumberInputElement.focus();
        return;
      }
      if (phoneNumberInputValue.length < 10) {
        setPhoneNumberErrorMessage("Nomor minimal 10 digit");
        phoneNumberInputElement.focus();
        return;
      }
      if (phoneNumberInputValue.length > 15) {
        setPhoneNumberErrorMessage("Nomor maksimal 15 digit");
        phoneNumberInputElement.focus();
        return;
      }
    }
    setPhoneNumberErrorMessage("");
    setIsEditPhoneNumber(!isEditPhoneNumber);
  };

  const handleOnPhoneNumberChange = (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
  };

  const handleOnModalIsOpened = () => {
    if (isEditPhoneNumber) {
      const phoneNumberInputElement = document.getElementById("phone-number");
      phoneNumberInputElement.focus();
    }
  };

  const sendDocument = async () => {
    try {
      setIsSendingDocument(true);
      const response =
        sendDocumentModalType == "STUDENT_UKA_PROGRESS_REPORT"
          ? await sendStudentProgressReportDocument()
          : await sendStudentUKAReportDocument();
      if (!response.data.success) {
        throw new Error(
          response?.data?.message ??
            "Terjadi kesalahan, silakan coba lagi nanti"
        );
      }
      showToast(
        {
          type: "info",
          title: "Informasi",
          message: response?.data?.message ?? "Rapor sedang dikirimkan",
        },
        3000
      );
      toggleShowSendDocumentModal();
    } catch (error) {
      showToast(
        {
          type: "error",
          title: "Terjadi Kesalahan",
          message: error?.response?.data?.message ?? error.message,
        },
        3000
      );
    } finally {
      setIsSendingDocument(false);
    }
  };

  const sendStudentProgressReportDocument = async () => {
    return await axios.post("/api/student-progress-report/send", {
      smartbtw_id: [studentProfile?.smartbtw_id],
      uka_type: selectedModuleType,
      stage_type: selectedUkaType,
      program: studentResult?.student?.program,
      student_name: studentProfile?.name,
      phone_number: phoneNumber,
    });
  };

  const sendStudentUKAReportDocument = async () => {
    return await axios.post("/api/student-uka-report/send", {
      smartbtw_id: studentProfile?.smartbtw_id,
      program: studentResult?.student?.program,
      student_name: studentProfile?.name,
      phone_number: phoneNumber,
      task_id: selectedReport?.task_id,
    });
  };

  useEffect(() => {
    document.addEventListener("report.selected", (data) => {
      setSelectedReport(data.detail.report);
    });
    return () => {
      document.removeEventListener("report.selected", () => {
        setSelectedReport(null);
      });
    };
  }, []);

  useEffect(() => {
    if (isEditPhoneNumber && isSendDocumentModalShown) {
      document.getElementById("phone-number").value = phoneNumber ?? "";
    }
  }, [isEditPhoneNumber]);

  useEffect(() => {
    if (!studentProfile) return;
    if (!studentProfile?.parent_number) {
      setIsEditPhoneNumber(true);
    }
  }, [studentProfile]);

  return (
    <Modal
      isOpen={isSendDocumentModalShown}
      toggle={() => toggleShowSendDocumentModal()}
      onOpened={handleOnModalIsOpened}
    >
      <ModalBody className="p-2">
        <div className="h1 mb-1 font-weight-bolder">
          Konfirmasi Pengiriman Rapor PDF{" "}
          {getReportTypeLabel(sendDocumentModalType)}
        </div>
        <div>Apakah anda ingin mengirim PDF ke nomor ini?</div>
        <div className="d-flex align-items-center my-1" style={{ gap: "10px" }}>
          {isEditPhoneNumber ? (
            <input
              type="text"
              name="phone_number"
              id="phone-number"
              className="h4 m-0"
              onChange={handleOnPhoneNumberChange}
              autoFocus
            />
          ) : (
            <div className="h4 m-0" id="phone-number-text">
              {phoneNumber}
            </div>
          )}
          <button
            onClick={handleOnButtonClick}
            className="send-document-btn font-weight-bolder"
          >
            <span>
              <Edit3 size={14} className="mr-50 mb-25" />
              {isEditPhoneNumber ? "Selesai" : "Ganti Nomor"}
            </span>
          </button>
        </div>
        {phoneNumberErrorMessage ? (
          <div className="text-danger mb-50 font-weight-bolder">
            {phoneNumberErrorMessage}
          </div>
        ) : null}
        <Alert color="warning" className="p-1 text-justify">
          <span className="font-weight-bolder">PENTING!</span>{" "}
          <span className="text-dark">
            Nomor diatas adalah nomor Orang Tua yang telah di inputkan
            sebelumnya, jika ingin mengganti nomor klik pada tombol Ganti Nomor.
          </span>
        </Alert>
        <div className="d-flex align-items-center" style={{ gap: "10px" }}>
          <Button
            color="none"
            className="btn btn-outline-primary flex-fill"
            onClick={() => toggleShowSendDocumentModal()}
          >
            Batal
          </Button>
          <Button
            color="none"
            className="btn btn-info flex-fill"
            disabled={isEditPhoneNumber || isSendingDocument}
            onClick={() => sendDocument()}
          >
            Konfirmasi
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default SendDocumentModal;
