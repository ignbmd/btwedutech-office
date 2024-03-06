import {
  Button,
  Card,
  CardBody,
  Form,
  FormFeedback,
  FormGroup,
  Label,
} from "reactstrap";
import { Filter, Download } from "react-feather";
import { useContext, useEffect, useState } from "react";
import { ClassroomReportContext } from "../../../context/ClassroomReportContext";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import "./ModuleFilter.css";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  getClassroomProgram,
  getUserBranchCode,
  getQueryParams,
  isNonCentralBranchUser,
} from "../../../utility/classroom-report";
import { generatePDFPerformaKelasDocumentLink } from "../../../services/student-progress/classroom-report";
import { showToast } from "../../../utility/Utils";

const ukaTypes = [
  {
    label: "Stage Umum",
    value: "UMUM",
  },
  {
    label: "Stage Kelas",
    value: "KELAS",
  },
];

const ukaModules = [
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

let params = getQueryParams();

const ModuleFilter = () => {
  const {
    isFetchingBranches,
    branches,
    fetchBranches,
    isFetchingClassrooms,
    classrooms,
    fetchBranchClassrooms,
    setSelectedBranch,
    setSelectedClassroom,
    setSelectedUkaType,
    setSelectedUkaModule,
    isFetchingClassroomResults,
    fetchClassroomResults,
    classroomResults,
  } = useContext(ClassroomReportContext);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const FormSchema = yup.object().shape({
    branch: yup.object().required("Wajib dipilih").typeError("Wajib dipilih"),
    uka_type: yup.object().required("Wajib dipilih").typeError("Wajib dipilih"),
    uka_module: yup
      .object()
      .required("Wajib dipilih")
      .typeError("Wajib dipilih"),
    classroom: yup
      .object()
      .required("Wajib dipilih")
      .typeError("Wajib dipilih"),
  });
  const { control, watch, handleSubmit, setValue } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      branch: "",
      classroom: "",
      uka_type: "",
      uka_module: {
        label: "Semua Stage",
        value: "ALL_MODULE",
      },
    },
  });
  const { branch, classroom, uka_module, uka_type } = watch();

  const submitForm = async () => {
    setSelectedClassroom(classroom);
    setSelectedUkaType(uka_type);
    setSelectedUkaModule(uka_module);
    fetchClassroomResults(
      branch.code,
      classroom._id,
      uka_type.value,
      uka_module.value
    );
  };

  const downloadPDFPerformaKelas = async () => {
    try {
      setIsGeneratingPDF(true);
      const response = await generatePDFPerformaKelasDocumentLink(
        classroom._id,
        getClassroomProgram(classroom),
        uka_type.value,
        uka_module.value,
        classroom.title,
        `${uka_type.label} - ${uka_module.label}`,
        true
      );
      if (!response?.link) {
        throw new Error(
          response?.message ??
            "Data rapor tidak ditemukan, Silakan coba lagi nanti"
        );
      }
      window.location.href = response?.link;
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: error?.message,
        duration: 3000,
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    const module_type = params?.module_type ?? "ALL_MODULE";
    const stage_type = params?.stage_type ?? "UMUM";
    setValue(
      "uka_module",
      ukaModules.find((moduleType) => moduleType?.value == module_type)
    );
    setValue(
      "uka_type",
      ukaTypes.find((stageType) => stageType?.value == stage_type)
    );
    fetchBranches();
    return () => {
      clearTimeout();
    };
  }, []);

  useEffect(() => {
    if (!branches.length) return;
    if (isNonCentralBranchUser) {
      const userBranchCode = getUserBranchCode();
      const branchToSelect = branches.find(
        (branch) => branch.code == userBranchCode
      );
      setSelectedBranch(branchToSelect);
      setValue("branch", branchToSelect);
    }
    console.log(branches);
  }, [branches]);

  useEffect(() => {
    if (!branch?.code) return;
    setSelectedBranch(branch);
    fetchBranchClassrooms(branch?.code);
  }, [branch?.code]);

  useEffect(() => {
    if (!classrooms.length) return;
    const classroom_id = params?.cid ?? null;
    const navigation = window.performance.getEntriesByType("navigation")[0];
    if (classroom_id && navigation.type == "navigate") {
      const classroomToSelect = classrooms.find(
        (item) => item._id == classroom_id
      );
      const classroomBranch = branches.find(
        (item) => item?.code == classroomToSelect?.branch_code
      );
      const ukaModule = ukaModules.find(
        (item) => item.value == params.module_type
      );
      const ukaType = ukaTypes.find((item) => item.value == params.stage_type);

      setValue("classroom", classroomToSelect);
      fetchClassroomResults(
        classroomToSelect?.branch_code,
        classroomToSelect?._id,
        ukaType.value,
        ukaModule.value
      );
      setSelectedClassroom(classroomToSelect);
      setSelectedBranch(classroomBranch);
      setSelectedUkaModule(ukaModule);
      setSelectedUkaType(ukaType);
      params = {};
    }
  }, [classrooms]);

  return (
    <Card>
      <CardBody>
        <div className="module-filter-container">
          <Form
            onSubmit={handleSubmit(submitForm)}
            className="d-flex align-items-center flex-grow-1"
            style={{ gap: "10px" }}
          >
            <Controller
              name="branch"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup
                    className={classnames("flex-fill", {
                      "d-none": isNonCentralBranchUser(),
                    })}
                  >
                    <Label className="form-label">Cabang</Label>
                    <Select
                      {...field}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                      isSearchable={true}
                      isLoading={isFetchingBranches}
                      options={branches}
                      getOptionLabel={(option) =>
                        `${option.name} (${option.code})`
                      }
                      getOptionValue={(option) => option.code}
                      classNamePrefix="select"
                      className={classnames(
                        "react-select module-filter-select"
                      )}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="classroom"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Kelas</Label>
                    <Select
                      {...field}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                      isSearchable={true}
                      isLoading={isFetchingClassrooms}
                      options={classrooms}
                      getOptionLabel={(option) =>
                        `${option.title} (${option.year})`
                      }
                      getOptionValue={(option) => option._id}
                      classNamePrefix="select"
                      className={classnames(
                        "react-select module-filter-select"
                      )}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="uka_type"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Tipe UKA</Label>
                    <Select
                      {...field}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                      isSearchable={true}
                      options={ukaTypes}
                      classNamePrefix="select"
                      className={classnames(
                        "react-select module-filter-select"
                      )}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="uka_module"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Modul UKA</Label>
                    <Select
                      {...field}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                      }}
                      isSearchable={true}
                      options={ukaModules}
                      classNamePrefix="select"
                      className={classnames(
                        "react-select module-filter-select"
                      )}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
            <Button
              color="none"
              type="submit"
              className="btn-gradient-primary mt-50"
              disabled={isFetchingClassroomResults}
            >
              <Filter size={14} className="mr-50" />
              {isFetchingClassroomResults ? "Mohon Tunggu..." : "Filter"}
            </Button>
          </Form>
          {classroomResults ? (
            <Button
              color="none"
              className="btn-gradient-info ml-auto mt-50"
              onClick={() => downloadPDFPerformaKelas()}
              disabled={isGeneratingPDF}
            >
              <Download size={14} className="mr-50" />
              {isGeneratingPDF ? "Mohon tunggu..." : "Rapor Performa Kelas"}
            </Button>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
};

export default ModuleFilter;
