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
import {
  normalNumber,
  selectThemeColors,
  getLastSegment,
  showToast,
} from "../../utility/Utils";
import SpinnerCenter from "../core/spinners/Spinner";
import "flatpickr/dist/themes/airbnb.css";
import axios from "axios";

const genders = [
  { label: "Laki-laki", value: "L" },
  { label: "Perempuan", value: "P" },
  { label: "Semua", value: "ALL" },
];

const lastEdTypes = [
  { label: "Semua", value: "ALL" },
  { label: "Spesifik", value: "SPECIFIC" },
];

const FormSchema = yup.object().shape({
  name: yup.string().required("Wajib diisi"),
  school_id: yup.object().required("Wajib dipilih"),
  gender: yup.object().required("Wajib dipilih"),
  min_age_male: yup
    .number()
    .min(1, "Tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  min_age_female: yup
    .number()
    .min(1, "Tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  min_height_male: yup
    .number()
    .min(1, "Tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  min_height_female: yup
    .number()
    .min(1, "Tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  avg_report_score: yup
    .number()
    .min(1, "Tidak boleh 0")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  birth_date_specific: yup.string().required("Wajib diisi"),
  last_ed_type: yup.object().required("Wajib dipilih"),
  last_ed_ids: yup.array().when("last_ed_type", {
    is: (last_education_type) =>
      last_education_type && last_education_type.value === "SPECIFIC",
    then: (schema) => schema.required("Wajib dipilih").min(1, "Wajib dipilih"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});

const id = getLastSegment();
function checkArrayEquality(_array1, _array2) {
  if (_array1 == null || _array2 == null) return false;
  if (_array1.length !== _array2.length) return false;
  _array1.sort();
  _array2.sort();
  for (var i = 0; i < _array1.length; ++i) {
    if (_array1[i] !== _array2[i]) return false;
  }
  return true;
}

const EditStudyProgramForm = () => {
  const [studyProgram, setStudyProgram] = useState(null);
  const [schools, setSchools] = useState(null);
  const [lastEducations, setLastEducations] = useState(null);
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
      name: "",
      min_age_male: 0,
      min_age_female: 0,
      min_height_male: 0,
      min_height_female: 0,
      avg_report_score: 0,
      birth_date_specific: "",
    },
  });
  const { last_ed_type } = watch();

  const getStudyProgram = async () => {
    try {
      const response = await axios.get(
        `/api/competition-map/study-program/${id}`
      );
      const data = response.data;
      setStudyProgram(data?.data ?? null);
      return;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getSchool = async () => {
    try {
      const response = await axios.get("/api/competition-map/school");
      const data = response.data;
      setSchools(data?.data ?? []);
      return;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getLastEducation = async () => {
    try {
      const response = await axios.get("/api/competition-map/last-education");
      const data = response.data;
      setLastEducations(data?.data ?? []);
      return;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getPayload = () => {
    const form = getValues();
    return {
      name: form.name,
      min_age_male: parseInt(form.min_age_male),
      min_age_female: parseInt(form.min_age_female),
      min_height_male: parseInt(form.min_height_male),
      min_height_female: parseInt(form.min_height_female),
      birth_date_specific: moment.utc(form.birth_date_specific).format(),
      avg_report_score: parseInt(form.avg_report_score),
      gender: form.gender.value,
      last_ed_type: form.last_ed_type.value,
      last_ed_ids: form.last_ed_ids
        ? form.last_ed_ids.map((value) => value.id)
        : null,
      school_id: form.school_id.id,
    };
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = getPayload();
      if (payload.last_ed_type !== studyProgram.last_ed_type)
        payload.is_last_ed_updated = true;
      if (payload.last_ed_type === "ALL" && studyProgram.last_ed_type === "ALL")
        payload.is_last_ed_updated = false;
      if (
        payload.last_ed_type === "SPECIFIC" &&
        studyProgram.last_ed_type === "SPECIFIC"
      ) {
        const allowed_last_eds = studyProgram.allowed_last_ed.map(
          (value) => value.last_ed_id
        );
        const isLastEdIdsEqual = checkArrayEquality(
          payload.last_ed_ids,
          allowed_last_eds
        );
        if (isLastEdIdsEqual) payload.is_last_ed_updated = false;
        else payload.is_last_ed_updated = true;
      }
      await axios.put(`/api/competition-map/study-program/${id}`, {
        ...payload,
        cancelToken: source.token,
      });
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      if (!isCanceled.current) {
        console.error(error);
        const errorMessage = error.response.data.message;
        showToast({
          type: "error",
          title: "Terjadi Kesalahan",
          message: errorMessage,
        });
        setIsSubmitting(false);
      }
    }
    setIsSubmitting(false);
  };

  const redirectToIndex = () => {
    window.location.href = "/peta-persaingan/program-studi";
  };

  useEffect(() => {
    (async () => {
      await getSchool();
      await getLastEducation();
      await getStudyProgram();
    })();
    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    if (!studyProgram) return;
    setValue("name", studyProgram.name);
    setValue(
      "gender",
      genders.find((gender) => gender.value === studyProgram.gender)
    );
    setValue(
      "school_id",
      schools.find((school) => school.id === studyProgram.school_id)
    );
    setValue(
      "birth_date_specific",
      moment(studyProgram.birth_date_specific)
        .utcOffset("+0700")
        .format("YYYY-MM-DD")
    );
    setValue("min_age_male", studyProgram.min_age_male);
    setValue("min_age_female", studyProgram.min_age_female);
    setValue("min_height_male", studyProgram.min_height_male);
    setValue("min_height_female", studyProgram.min_height_female);
    setValue("avg_report_score", studyProgram.avg_report_score);
    setValue(
      "last_ed_type",
      lastEdTypes.find(
        (lastEdType) => lastEdType.value === studyProgram.last_ed_type
      )
    );
    if (studyProgram.last_ed_type === "SPECIFIC") {
      const allowed_last_ed_ids = studyProgram?.allowed_last_ed?.map(
        (value) => value.last_ed_id
      );
      setValue(
        "last_ed_ids",
        lastEducations?.filter((value) =>
          allowed_last_ed_ids?.includes(value.id)
        )
      );
    }
    setIsLoading(false);
  }, [studyProgram]);

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
                      name="name"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Nama</Label>
                            <Input
                              {...rest}
                              id="name"
                              innerRef={ref}
                              invalid={error && true}
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

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
                              isSearchable={true}
                              options={schools}
                              getOptionLabel={(option) => option.name}
                              getOptionValue={(option) => option.id}
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

                    <hr className="my-2" />

                    <Controller
                      name="min_age_male"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Usia Minimal Laki-laki
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
                              placeholder="Inputkan Usia Minimal Laki-laki"
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="min_age_female"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Usia Minimal Perempuan
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
                              placeholder="Inputkan Usia Minimal Perempuan"
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="min_height_male"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Tinggi Minimal Laki-laki (cm)
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
                              placeholder="Inputkan Tinggi Minimal Laki-laki"
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="min_height_female"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Tinggi Minimal Perempuan (cm)
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
                              placeholder="Inputkan Tinggi Minimal Perempuan"
                            />
                            <FormFeedback>{error?.message}</FormFeedback>
                          </FormGroup>
                        );
                      }}
                    />

                    <Controller
                      name="birth_date_specific"
                      control={control}
                      defaultValue=""
                      render={({
                        field: { onChange, ref, value },
                        fieldState: { error },
                      }) => (
                        <FormGroup>
                          <Label className="form-label">
                            Tanggal Kondisi Umur
                          </Label>
                          <Input
                            type="date"
                            ref={ref}
                            className={classnames("form-control", {
                              "is-invalid": error,
                            })}
                            value={value}
                            onChange={(date) => {
                              date.length === 0 ? onChange("") : onChange(date);
                            }}
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      )}
                    />

                    <Controller
                      name="gender"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">Jenis Kelamin</Label>
                            <Select
                              {...field}
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 9999,
                                }),
                              }}
                              isSearchable={false}
                              options={genders}
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

                    <hr className="my-2" />

                    <Controller
                      name="last_ed_type"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Tipe Pendidikan Terakhir
                            </Label>
                            <Select
                              {...field}
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 9999,
                                }),
                              }}
                              isSearchable={false}
                              options={lastEdTypes}
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

                    {last_ed_type && last_ed_type.value === "SPECIFIC" ? (
                      <Controller
                        name="last_ed_ids"
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const { ref, ...rest } = field;
                          return (
                            <FormGroup className="flex-fill">
                              <Label className="form-label">
                                Pendidikan Terakhir
                              </Label>
                              <Select
                                {...field}
                                styles={{
                                  menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999,
                                  }),
                                }}
                                isSearchable={true}
                                isMulti={true}
                                options={lastEducations}
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.id}
                                classNamePrefix="select"
                                theme={selectThemeColors}
                                className={classnames("react-select", {
                                  "is-invalid": error && true,
                                })}
                              />
                              <FormFeedback>{error?.message}</FormFeedback>
                            </FormGroup>
                          );
                        }}
                      />
                    ) : null}

                    <Controller
                      name="avg_report_score"
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <FormGroup className="flex-fill">
                            <Label className="form-label">
                              Rata-rata nilai raport
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
                              placeholder="Inputkan Rata-rata nilai raport"
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

export default EditStudyProgramForm;
