import {
  Button,
  Card,
  CardBody,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  FormGroup,
  FormFeedback,
  Label,
} from "reactstrap";
import { Filter, Download, Send } from "react-feather";
import { useContext, useState, useEffect, Fragment } from "react";
import { StudentReportContext } from "../../../context/StudentReportContext";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  getClassroomProgram,
  getQueryParams,
  getStudentID,
} from "../../../utility/student-report";

import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import ContentLoader from "react-content-loader";

import "./ModuleFilter.css";
import { generateStudentProgressReportDocumentLink } from "../../../services/student-progress/student-report";
import { showToast } from "../../../utility/Utils";

const stageTypes = [
  {
    label: "Umum",
    value: "UMUM",
  },
  {
    label: "Kelas",
    value: "KELAS",
  },
];

const moduleTypes = [
  {
    label: "Semua Stage",
    value: "ALL_MODULE",
  },
  {
    label: "Pra-UKA Stage",
    value: "PRE_UKA",
  },
  {
    label: "UKA Stage",
    value: "UKA_STAGE",
  },
];
const studentId = getStudentID();

const ModuleFilter = () => {
  const {
    isFetchingStudentProfile,
    isFetchingStudentTarget,
    classroom,
    fetchStudentResult,
    setSelectedUkaType,
    setSelectedModuleType,
    setSendDocumentModalType,
    toggleShowSendDocumentModal,
  } = useContext(StudentReportContext);
  const [isGeneratingReportDocument, setIsGeneratingReportDocument] =
    useState(false);
  const classroomProgram = getClassroomProgram(classroom);

  const FormSchema = yup.object().shape({
    stageType: yup
      .object()
      .required("Wajib dipilih")
      .typeError("Wajib dipilih"),
    moduleType: yup
      .object()
      .required("Wajib dipilih")
      .typeError("Wajib dipilih"),
  });
  const { control, handleSubmit, setValue, watch } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      stageType: {
        label: "Umum",
        value: "UMUM",
      },
      moduleType: {
        label: "Semua UKA",
        value: "ALL_MODULE",
      },
    },
  });
  const { stageType, moduleType } = watch();

  const showSendDocumentModal = () => {
    setSendDocumentModalType("STUDENT_UKA_PROGRESS_REPORT");
    toggleShowSendDocumentModal();
  };

  const submitForm = (data) => {
    setSelectedUkaType(data?.stageType?.value);
    setSelectedModuleType(data?.moduleType?.value);
    fetchStudentResult(
      studentId,
      classroomProgram,
      data?.stageType?.value,
      data?.moduleType?.value
    );
  };

  const handleDownloadReport = async () => {
    try {
      setIsGeneratingReportDocument(true);
      const response = await generateStudentProgressReportDocumentLink(
        studentId,
        classroomProgram,
        stageType.value,
        moduleType.value,
        true
      );
      if (!response?.data?.link) {
        throw new Error("Proses gagal, silakan coba lagi nanti");
      }
      window.location.href = response?.data?.link;
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: "Proses gagal, silakan coba lagi nanti",
      });
    } finally {
      setIsGeneratingReportDocument(false);
    }
  };

  useEffect(() => {
    const params = getQueryParams();
    const module_type = params?.module_type ?? "ALL_MODULE";
    const stage_type = params?.stage_type ?? "UMUM";
    setValue(
      "moduleType",
      moduleTypes.find((moduleType) => moduleType?.value == module_type)
    );
    setValue(
      "stageType",
      stageTypes.find((stageType) => stageType?.value == stage_type)
    );
    return () => {
      clearInterval();
      clearTimeout();
    };
  }, []);

  return !isFetchingStudentProfile && !isFetchingStudentTarget ? (
    <Card>
      <CardBody>
        <div className="filter-container">
          <Form
            onSubmit={handleSubmit(submitForm)}
            className="d-flex align-items-center flex-grow-1"
            style={{ gap: "10px" }}
          >
            <Controller
              name="stageType"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup style={{ flexBasis: "250px" }}>
                    <Label className="form-label">Tipe Stage</Label>
                    <Select
                      {...field}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                      options={stageTypes}
                      classNamePrefix="select"
                      className={classnames("react-select filter-select")}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="moduleType"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup style={{ flexBasis: "250px" }}>
                    <Label className="form-label">Tipe Modul</Label>
                    <Select
                      {...field}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                      options={moduleTypes}
                      classNamePrefix="select"
                      className={classnames("react-select filter-select")}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Button
              color="none"
              className="btn-gradient-primary mt-50"
              type="submit"
            >
              <Filter size={14} className="mr-50" />
              Filter
            </Button>
          </Form>
          <UncontrolledButtonDropdown
            className={classnames("ml-auto mt-50", {
              disabled: isGeneratingReportDocument,
            })}
          >
            <DropdownToggle
              className="btn-gradient-info module-filter-report-dropdown"
              color="none"
              caret
            >
              {isGeneratingReportDocument ? (
                "Mohon tunggu..."
              ) : (
                <Fragment>
                  <Download size={14} className="mr-50" />
                  Rapor Perkembangan Belajar
                </Fragment>
              )}
            </DropdownToggle>
            <DropdownMenu className="w-100">
              <DropdownItem
                className="w-100"
                onClick={() => handleDownloadReport()}
              >
                <Download size={14} className="mr-50" />
                Unduh PDF
              </DropdownItem>
              <DropdownItem
                className="w-100"
                onClick={() => showSendDocumentModal()}
              >
                <Send size={14} className="mr-50" />
                Kirim PDF
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </div>
      </CardBody>
    </Card>
  ) : (
    <ContentLoader
      speed={2}
      width={400}
      height={160}
      viewBox="0 0 400 160"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <rect x="0" y="56" rx="3" ry="3" width="410" height="6" />
      <rect x="0" y="72" rx="3" ry="3" width="410" height="6" />
      <rect x="0" y="88" rx="3" ry="3" width="410" height="6" />
    </ContentLoader>
  );
};

export default ModuleFilter;
