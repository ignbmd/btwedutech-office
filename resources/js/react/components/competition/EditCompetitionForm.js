import React, { useEffect, useState, useRef } from "react";
import * as yup from "yup";
import Select from "react-select";
import Cleave from "cleave.js/react";
import classnames from "classnames";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { Save } from "react-feather";
import { normalNumber, getLastSegment } from "../../utility/Utils";
import SpinnerCenter from "../core/spinners/Spinner";
import "flatpickr/dist/themes/airbnb.css";
import axios from "axios";

const FormSchema = yup.object().shape({
  school_id: yup.object().typeError("Wajib dipilih").required("Wajib dipilih"),
  study_program_id: yup
    .object()
    .typeError("Wajib dipilih")
    .required("Wajib dipilih"),
  year: yup
    .number()
    .min(1, "Nilai tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  quota: yup
    .number()
    .min(1, "Nilai tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  region_id: yup.object().when("province_id", {
    is: (province) => province,
    then: (schema) =>
      schema.typeError("Wajib dipilih").required("Wajib dipilih"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  registered: yup
    .number()
    .min(1, "Nilai tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  lowest_score: yup
    .number()
    .min(1, "Nilai tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  lowest_position: yup
    .number()
    .min(1, "Nilai tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  polbit_type: yup
    .object()
    .typeError("Wajib dipilih")
    .required("Wajib dipilih"),
  lowest_status: yup
    .object()
    .typeError("Wajib dipilih")
    .required("Wajib dipilih"),
});

const polbitTypes = [
  { label: "Pusat", value: "PUSAT" },
  { label: "Daerah", value: "DAERAH" },
];

const lowestStatuses = [
  { label: "P/L", value: "P/L" },
  { label: "TL", value: "TL" },
  { label: "TH", value: "TH" },
];
const id = getLastSegment();

const EditCompetitionForm = () => {
  const [competition, setCompetition] = useState(null);
  const [studyProgram, setStudyProgram] = useState(null);
  const [location, setLocation] = useState(null);
  const [schools, setSchools] = useState(null);
  const [studyPrograms, setStudyPrograms] = useState(null);
  const [provinces, setProvinces] = useState(null);
  const [regions, setRegions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    resolver: yupResolver(FormSchema),
    defaultValues: {
      school_id: "",
      study_program_id: "",
      province_id: "",
      region_id: "",
      year: "",
      quota: "",
      registered: "",
      lowest_score: "",
      lowest_position: "",
      lowest_status: "",
    },
  });
  const { type, province_id, school_id } = watch();

  const getCompetition = async () => {
    try {
      const response = await axios.get(
        `/api/competition-map/competition/${id}`
      );
      const data = await response.data;
      setCompetition(data.data ?? null);
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  };

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
      return data.data ?? [];
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

  const getStudyProgramById = async (id) => {
    try {
      const response = await axios.get(
        `/api/competition-map/study-program/${id}`
      );
      const data = await response.data;
      setStudyProgram(data.data ?? null);
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const getLocationById = async (id) => {
    try {
      const response = await axios.get(`/api/competition-map/location/${id}`);
      const data = await response.data;
      setLocation(data.data ?? null);
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const getPayload = () => {
    const formValues = getValues();
    return {
      school_id: formValues.school_id.id,
      study_program_id: formValues.study_program_id.id,
      location_id: formValues?.region_id?.id ?? formValues?.province_id?.id,
      polbit_type: formValues.polbit_type.value,
      year: parseInt(formValues.year),
      quota: parseInt(formValues.quota),
      registered: parseInt(formValues.registered),
      lowest_position: parseInt(formValues.lowest_position),
      lowest_score: parseInt(formValues.lowest_score),
      lowest_status: formValues.lowest_status.value,
    };
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = getPayload();
      await axios.put(`/api/competition-map/competition/${id}`, {
        ...payload,
        cancelToken: source.token,
      });
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      if (!isCanceled.current) {
        console.error(error);
        setIsSubmitting(false);
      }
    }
    setIsSubmitting(false);
  };

  const redirectToIndex = () => {
    window.location.href = "/peta-persaingan/kompetisi";
  };

  useEffect(() => {
    getCompetition();
    getSchools();
    getProvinces();
    return () => {
      isCanceled.current = true;
    };
  }, []);

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
    getStudyProgramsBySchoolId(school_id.id);
  }, [school_id]);

  useEffect(() => {
    if (!competition) return;
    getStudyProgramById(competition.study_program_id);
    getLocationById(competition.location_id);
  }, [competition]);

  useEffect(() => {
    if (!studyProgram) return;
    setValue(
      "school_id",
      schools.find((value) => studyProgram.school_id === value.id)
    );
  }, [studyProgram]);

  useEffect(() => {
    if (!studyPrograms) return;
    setValue(
      "study_program_id",
      studyPrograms.find(
        (value) => competition.study_program_id === value.id
      ) ?? null
    );
  }, [studyPrograms]);

  useEffect(async () => {
    if (!location) return;
    setValue(
      "province_id",
      provinces.find((province) => province.id === location.parent_id) ?? null
    );
    setValue(
      "polbit_type",
      polbitTypes?.find(
        (polbit_type) => competition.polbit_type === polbit_type.value
      )
    );
    setValue("year", competition.year);
    setValue("quota", competition.quota);
    setValue("registered", competition.registered);
    setValue("lowest_score", competition.lowest_score);
    setValue("lowest_position", competition.lowest_position);
    setValue(
      "lowest_status",
      lowestStatuses?.find(
        (lowest_status) => competition.lowest_status === lowest_status.value
      )
    );
  }, [location]);

  useEffect(() => {
    if (!regions) return;
    if (location) {
      setValue(
        "region_id",
        regions.find((region) => region.id === location.id)
      );
    }
    setIsLoading(false);
  }, [regions]);

  return (
    <>
      {isLoading ? (
        <SpinnerCenter />
      ) : (
        <div className={classnames(isSubmitting && "block-content")}>
          <Form onSubmit={handleSubmit(onSubmit)}>
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

                    <Controller
                      name="year"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Tahun</Label>
                            <Cleave
                              {...field}
                              options={normalNumber}
                              className={classnames("form-control", {
                                "is-invalid": error,
                              })}
                              onChange={(e) =>
                                field.onChange(e.target.rawValue)
                              }
                              value={field.value ?? 0}
                              placeholder="Inputkan Tahun"
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="quota"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Kuota</Label>
                            <Cleave
                              {...field}
                              options={normalNumber}
                              className={classnames("form-control", {
                                "is-invalid": error,
                              })}
                              onChange={(e) =>
                                field.onChange(e.target.rawValue)
                              }
                              value={field.value ?? 0}
                              placeholder="Inputkan Kuota"
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="registered"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Terdaftar</Label>
                            <Cleave
                              {...field}
                              options={normalNumber}
                              className={classnames("form-control", {
                                "is-invalid": error,
                              })}
                              onChange={(e) =>
                                field.onChange(e.target.rawValue)
                              }
                              value={field.value ?? 0}
                              placeholder="Inputkan Nilai Terdaftar"
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="lowest_score"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Skor Terendah</Label>
                            <Cleave
                              {...field}
                              options={normalNumber}
                              className={classnames("form-control", {
                                "is-invalid": error,
                              })}
                              onChange={(e) =>
                                field.onChange(e.target.rawValue)
                              }
                              value={field.value ?? 0}
                              placeholder="Inputkan Skor Terendah"
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="lowest_position"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Posisi Terendah
                            </Label>
                            <Cleave
                              {...field}
                              options={normalNumber}
                              className={classnames("form-control", {
                                "is-invalid": error,
                              })}
                              onChange={(e) =>
                                field.onChange(e.target.rawValue)
                              }
                              value={field.value ?? 0}
                              placeholder="Inputkan Posisi Terendah"
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="lowest_status"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Status Terendah
                            </Label>
                            <Select
                              {...field}
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 9999,
                                }),
                              }}
                              placeholder="Pilih status terendah"
                              isSearchable={false}
                              options={lowestStatuses}
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

                    <div className="text-right mt-4">
                      <Button type="submit" color="gradient-success">
                        <Save size={14} /> Simpan
                      </Button>
                    </div>
                  </Col>
                </div>
              </CardBody>
            </Card>
          </Form>
        </div>
      )}
    </>
  );
};

export default EditCompetitionForm;
