import React, { useEffect, useState, useRef, useCallback } from "react";
import * as yup from "yup";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import classnames from "classnames";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardBody,
  Row,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Label,
} from "reactstrap";
import { Save, RefreshCw, Plus, Trash } from "react-feather";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import NumericEditor from "@inovua/reactdatagrid-community/NumericEditor";
import SelectEditor from "@inovua/reactdatagrid-community/SelectEditor";
import "@inovua/reactdatagrid-community/index.css";
import "flatpickr/dist/themes/airbnb.css";
import axios from "axios";
import { getCsrf, showToast } from "../../utility/Utils";
import FileUpload from "../core/file-upload/FileUpload";
import { useFileUpload } from "../../hooks/useFileUpload";
import SpinnerCenter from "../core/spinners/Spinner";
// import AddNewSkdRankModal from "./AddNewSkdRankModal";

const FormSchema = yup.object().shape({});

const generateLastFiveYearsOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    years.push({ label: currentYear - i, value: currentYear - i });
  }
  return years;
};

const years = generateLastFiveYearsOptions();
const polbitTypes = [
  { label: "Pusat", value: "PUSAT" },
  { label: "Daerah", value: "DAERAH" },
];
const gridStyle = { height: 550 };

const MySwal = withReactContent(Swal);
const statusData = [
  { id: "P/L", label: "P/L" },
  { id: "TL", label: "TL" },
  { id: "TH", label: "TH" },
];

const IndexSkdRankForm = () => {
  const [skdRanks, setSkdRanks] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [schools, setSchools] = useState(null);
  const [studyPrograms, setStudyPrograms] = useState(null);
  const [provinces, setProvinces] = useState(null);
  const [regions, setRegions] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddSkdRank, setIsAddSkdRank] = useState(false);
  const [isAllFormFilled, setIsAllFormFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [proofFile] = useState({ proof: [] });
  const isCanceled = useRef(false);

  const {
    watch,
    register,
    control,
    trigger,
    setValue,
    setError,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      school_id: "",
      study_program_id: "",
      polbit_type: "",
      province_id: "",
      region_id: "",
      year: years[0],
    },
  });

  const {
    school_id,
    study_program_id,
    polbit_type,
    province_id,
    region_id,
    year,
  } = watch();

  const {
    files,
    fileErrors,
    registerFile,
    handleError: handleFileError,
    handleSelectedFile,
    checkIsFileValid,
  } = useFileUpload(proofFile);

  const getSchools = async () => {
    try {
      const response = await axios.get("/api/competition-map/school");
      const data = await response.data;
      setSchools(data.data ?? []);
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const getSkdRank = async (queryParams = {}) => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/competition-map/skd-rank", {
        params: queryParams,
      });
      const data = await response.data;
      const mappedData = data?.data?.map((value) => {
        value.isFromDB = true;
        value.isDirty = false;
        value.isDeleted = false;
        value.isManualCreated = false;
        return value;
      });
      setSkdRanks(mappedData ?? []);
    } catch (error) {
      console.error(error);
      setSkdRanks(mappedData ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  const getProvinces = async () => {
    try {
      const response = await axios.get(
        "/api/competition-map/location/provinces"
      );
      const data = await response.data;
      setProvinces(data.data ?? []);
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const getRegionsByProvinceId = async (id) => {
    try {
      const response = await axios.get(
        `/api/competition-map/location/location-parent/${id}`
      );
      const data = await response.data;
      setRegions(data.data ?? []);
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const getStudyProgramsBySchoolId = async (id) => {
    try {
      const response = await axios.get(
        `/api/competition-map/study-program/school/${id}`
      );
      const data = await response.data;
      setStudyPrograms(data.data ?? []);
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const onFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const payload = {
        data,
        skdRanks,
        removedIds,
      };
      await axios.post("/api/competition-map/skd-rank/cud", payload);
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Data berhasil diperbarui",
      });
      window.location.href = "/peta-persaingan/perangkingan-skd";
    } catch (error) {
      console.error(error);
      const errObj = error.response.data?.data || error.response.data;
      const errMessage = errObj?.message
        ? errObj?.message
        : "Sistem dalam perbaikan, harap mencoba beberapa saat lagi";
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: errMessage,
      });
      setIsSubmitting(false);
    }
  };

  const onFileImport = async (data) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("data", JSON.stringify(data));
      await axios.post("/api/competition-map/skd-rank/import", formData, {
        headers: {
          "X-CSRF-TOKEN": getCsrf(),
          "Content-Type": "multipart/form-data",
        },
      });
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Proses import berhasil",
      });
      window.location.href = "/peta-persaingan/perangkingan-skd";
    } catch (error) {
      console.error(error);
      const errObj = error.response.data?.data || error.response.data;
      const errMessage = errObj?.message
        ? errObj?.message
        : "Sistem dalam perbaikan, harap mencoba beberapa saat lagi";
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: errMessage,
      });
      setIsSubmitting(false);
    }
  };

  const handleShowModal = () => {
    setIsAddSkdRank(true);
  };

  const skdRankColumns = [
    {
      name: "id",
      header: "ID",
      type: "number",
      defaultVisible: false,
    },
    {
      name: "rank",
      header: "Ranking",
      editor: NumericEditor,
    },
    {
      name: "registration_number",
      header: "No. Pendaftaran",
    },
    {
      name: "name",
      header: "Nama",
    },
    {
      name: "twk",
      header: "TWK",
      editor: NumericEditor,
    },
    {
      name: "tiu",
      header: "TIU",
      editor: NumericEditor,
    },
    {
      name: "tkp",
      header: "TKP",
      editor: NumericEditor,
    },
    {
      name: "total",
      header: "Total",
      editor: NumericEditor,
    },
    {
      name: "status",
      header: "Status",
      editor: SelectEditor,
      editorProps: {
        idProperty: "id",
        dataSource: statusData,
        collapseOnSelect: true,
        clearIcon: null,
      },
    },
    {
      header: "Aksi",
      editable: false,
      render: (props) => {
        const isSomeColumnEmpty = isSomePropertyValueEmpty(props.data);
        // const isLastRow = props.rowIndex === props.totalDataCount - 1;
        if (isSomeColumnEmpty) {
          return (
            <>
              <Button
                type="button"
                className="datagrid-button"
                color="danger"
                id={`remove-${props.rowIndex}`}
                onClick={removeTableRow}
                data-row={JSON.stringify(props.data)}
              >
                <Trash size={14} />
              </Button>
            </>
          );
        }
        return (
          <>
            <Button
              type="button"
              className="datagrid-button"
              color="warning"
              id={`refresh-${props.rowIndex}`}
              onClick={clearTableRow}
              data-row={JSON.stringify(props.data)}
            >
              <RefreshCw size={14} />
            </Button>
          </>
        );
      },
    },
  ];

  function isSomePropertyValueEmpty(obj) {
    for (let key in obj) {
      if (
        !obj["id"] ||
        !obj["name"] ||
        !obj["rank"] ||
        !obj["registration_number"] ||
        !obj["status"] ||
        !obj["twk"] ||
        !obj["tiu"] ||
        !obj["tkp"] ||
        !obj["total"]
      )
        return true;
    }
    return false;
  }

  async function clearTableRow(e) {
    const state = await MySwal.fire({
      title: "Apakah anda yakin ingin menghapus data ini!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-outline-secondary ml-1",
      },
      buttonsStyling: false,
    });
    if (state.isDismissed) return;
    const currentData = [...skdRanks];

    const id = this.id.split("-")[1];
    const button = document.getElementById(this.id);
    const selectedData = JSON.parse(button.getAttribute("data-row"));

    const emptyRowObj = {
      rank: "",
      registration_number: "",
      name: "",
      twk: "",
      tiu: "",
      tkp: "",
      total: "",
      status: "",
      isDeleted: selectedData.isDeleted,
      isFromDB: selectedData.isFromDB,
      isDirty: true,
      isManualCreated: selectedData.isManualCreated,
    };
    if (emptyRowObj.isFromDB) emptyRowObj.id = selectedData.id;
    currentData[id] = emptyRowObj;
    setSkdRanks(currentData);
  }

  function removeTableRow() {
    const currentData = [...skdRanks];
    const id = this.id.split("-")[1];
    const button = document.getElementById(this.id);
    const selectedData = JSON.parse(button.getAttribute("data-row"));
    if (selectedData.isFromDB) {
      const identity = (x) => x;
      const ids = removedIds.map(identity);
      ids.push(selectedData.id);
      setRemovedIds(ids);
    }
    currentData.splice(id, 1);
    setSkdRanks(currentData);
  }

  const addTableRow = () => {
    const currentData = [...skdRanks];
    const emptyRowObj = {
      id: currentData[currentData.length - 1].id + 1,
      rank: "",
      registration_number: "",
      name: "",
      twk: "",
      tiu: "",
      tkp: "",
      total: "",
      status: "",
      isManualCreated: true,
      isFromDB: false,
      isDirty: false,
      isDeleted: false,
    };
    currentData.push(emptyRowObj);
    setSkdRanks(currentData);
  };

  const onEditComplete = useCallback(
    ({ value, columnId, rowId }) => {
      const buttons = document.querySelectorAll(".datagrid-button");
      buttons.forEach((button) => (button.disabled = false));
      const currentData = [...skdRanks];
      const currentDataIndex = currentData
        .map((value) => value.id)
        .indexOf(rowId);
      if (currentData[currentDataIndex][columnId] != value)
        currentData[currentDataIndex]["isDirty"] = true;
      currentData[currentDataIndex][columnId] = value;
      setSkdRanks(currentData);
    },
    [skdRanks]
  );

  const onEditStart = useCallback((props) => {
    const buttons = document.querySelectorAll(".datagrid-button");
    buttons.forEach((button) => (button.disabled = true));
  }, []);

  useEffect(() => {
    getSchools();
    getProvinces();
    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    if (!skdRanks) return;
  }, [skdRanks]);

  useEffect(() => {
    setValue("region_id", null);
    if (!province_id) {
      setRegions([]);
      return;
    }
    getRegionsByProvinceId(province_id.id);
  }, [province_id]);

  useEffect(() => {
    if (!school_id) return;
    setValue("study_program_id", null);
    getStudyProgramsBySchoolId(school_id.id);
  }, [school_id]);

  useEffect(() => {
    let isAllFilled = false;
    if (polbit_type && polbit_type.value === "DAERAH")
      isAllFilled = Boolean(
        school_id &&
          study_program_id &&
          polbit_type &&
          province_id &&
          region_id &&
          year
      );
    if (polbit_type && polbit_type.value === "PUSAT")
      isAllFilled = Boolean(
        school_id && study_program_id && polbit_type && year
      );
    if (isAllFilled) {
      getSkdRank({
        location_id: region_id?.id ?? null,
        study_program_id: study_program_id?.id,
        year: year?.value,
      });
      setIsAllFormFilled(true);
    } else {
      setIsAllFormFilled(false);
    }
  }, [school_id, study_program_id, polbit_type, province_id, region_id, year]);

  useEffect(() => {
    setValue("file", files.proof[0]);
  }, [files.proof]);

  useEffect(() => {
    if (!checkIsFileValid())
      setError("file", {
        type: "manual",
        message: fileErrors?.proof?.[0] ?? "",
      });
  }, [fileErrors.proof]);

  return (
    <div className={classnames(isSubmitting && "block-content")}>
      <Form
        onSubmit={handleSubmit(!skdRanks.length ? onFileImport : onFormSubmit)}
      >
        <Card>
          <CardBody>
            <div className="d-flex">
              <Col md={6} className={classnames("pl-0")}>
                <Controller
                  name="school_id"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Sekolah</Label>
                        <Select
                          {...field}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999,
                            }),
                          }}
                          placeholder="Pilih sekolah"
                          isSearchable={false}
                          options={schools ?? []}
                          getOptionValue={(option) => option.id}
                          getOptionLabel={(option) => option.name}
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
                  name="study_program_id"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Studi Program</Label>
                        <Select
                          {...field}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999,
                            }),
                          }}
                          placeholder="Pilih program studi"
                          isSearchable={false}
                          options={studyPrograms ?? []}
                          getOptionValue={(option) => option.id}
                          getOptionLabel={(option) => option.name}
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
                  name="polbit_type"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Tipe Polbit</Label>
                        <Select
                          {...field}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999,
                            }),
                          }}
                          placeholder="Pilih tipe polbit"
                          isSearchable={false}
                          options={polbitTypes}
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
                {polbit_type && polbit_type.value === "DAERAH" ? (
                  <>
                    <Controller
                      name="province_id"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Lokasi (Opsional)
                            </Label>
                            <Select
                              {...field}
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 9999,
                                }),
                              }}
                              placeholder="Pilih provinsi"
                              isSearchable={true}
                              isClearable={true}
                              options={provinces ?? []}
                              getOptionValue={(option) => option.id}
                              getOptionLabel={(option) => option.name}
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
                      name="region_id"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Select
                              {...field}
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 9999,
                                }),
                              }}
                              placeholder="Pilih kabupaten/kota"
                              isSearchable={true}
                              isClearable={true}
                              options={regions ?? []}
                              getOptionValue={(option) => option.id}
                              getOptionLabel={(option) => option.name}
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
                  </>
                ) : null}

                <Controller
                  name="year"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Tahun</Label>
                        <Select
                          {...field}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999,
                            }),
                          }}
                          placeholder="Pilih tahun"
                          options={years ?? []}
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
              </Col>
            </div>
            <hr />
            {isAllFormFilled ? (
              isLoading ? (
                <SpinnerCenter />
              ) : !skdRanks.length ? (
                <>
                  <FormGroup>
                    <Row>
                      <Col md={6}>
                        <Label className="form-label">
                          Dokumen Perangkingan SKD
                        </Label>
                        <FileUpload
                          {...registerFile("proof", false)}
                          changed={handleSelectedFile}
                          maxFileSize="5mb"
                          onerror={(e) => handleFileError("proof", e)}
                          name="proof"
                          className={classnames({
                            "mb-1": true,
                            "filepond-is-invalid": errors?.file?.message,
                          })}
                        />
                        <Button
                          type="submit"
                          color="gradient-success"
                          className="mt-50"
                        >
                          <Save size={14} /> Import Data
                        </Button>
                      </Col>
                    </Row>
                  </FormGroup>
                </>
              ) : (
                <>
                  <div className="row">
                    <div className="col-auto">
                      <h6 className="my-1">Data Perangkingan SKD</h6>
                    </div>
                    <div className="col-auto ml-auto mb-50">
                      <Button
                        type="button"
                        color="gradient-primary"
                        onClick={handleShowModal}
                      >
                        <Plus size={14} /> Tambah Data Perangkingan SKD
                      </Button>
                    </div>
                  </div>
                  <ReactDataGrid
                    idProperty="id"
                    editable={true}
                    style={gridStyle}
                    rowHeight={100}
                    onEditComplete={onEditComplete}
                    onEditStart={onEditStart}
                    autoFocusOnEditComplete={false}
                    autoFocusOnEditEscape={false}
                    enableKeyboardNavigation={false}
                    showColumnMenuTool={false}
                    showFilteringMenuItems={false}
                    sortable={false}
                    columns={skdRankColumns}
                    dataSource={skdRanks}
                  />
                  <div className="text-right mt-4">
                    <Button type="submit" color="gradient-success">
                      <Save size={14} /> Simpan
                    </Button>
                  </div>
                </>
              )
            ) : null}
          </CardBody>
          {/* <AddNewSkdRankModal
            isShow={isAddSkdRank}
            handleShow={setIsAddSkdRank}
          /> */}
        </Card>
      </Form>
    </div>
  );
};

export default IndexSkdRankForm;
