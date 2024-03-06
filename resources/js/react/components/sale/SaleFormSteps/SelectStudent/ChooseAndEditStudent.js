import axios from "axios";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { Controller } from "react-hook-form";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "react-feather";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import debounce from "lodash.debounce";

import {
  Label,
  FormGroup,
  Row,
  Col,
  Button,
  Input,
  FormFeedback,
} from "reactstrap";

import { AvRadioGroup, AvRadio } from "availity-reactstrap-validation-safe";
import SpinnerCenter from "../../../core/spinners/Spinner";
const ChooseAndEditStudent = ({
  control,
  stepper,
  register,
  setValue,
  formValues,
  resetForm,
  clearErrors,
  handleSubmit,
  selectedStudent,
  setSelectedStudent,
  selectedDistrict,
  selectedProvince,
  currentStudentFormValue,
  setSelectedStudentDetail,
  updateStudent,
  isUpdatingStudent,
}) => {
  const [isFetchingProvince, setIsFetchingProvince] = useState(true);
  const [isFetchingDistrict, setIsFetchingDistrict] = useState(false);
  const [isFetchingStudentProfile, setIsFetchingStudentProfile] =
    useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [highschools, setHighschools] = useState([]);
  const [highschoolEducations, setHighschoolEducations] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [highschoolDistricts, setHighSchoolDistricts] = useState([]);
  const [lastEducationTypes] = useState([
    {
      label: "SMA/MA",
      value: "SMA",
    },
    {
      label: "SMK",
      value: "SMK",
    },
  ]);
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const getStudentProfile = async (id) => {
    try {
      setIsFetchingStudentProfile(true);
      setStudentProfile(null);
      const response = await axios.get(`/api/sale/student-detail-data/${id}`, {
        cancelToken: source.token,
      });
      const data = (await response?.data?.data) ?? null;
      if (!isCanceled.current) {
        setStudentProfile(data);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingStudentProfile(false);
      }
    }
  };

  const getProvinces = async () => {
    try {
      const response = await axios.get("/api/location", {
        params: {
          type: "PROVINCE",
        },
        cancelToken: source.token,
      });
      const data = await response.data?.data;
      if (!isCanceled.current) {
        setProvinces(
          data.map((province) => ({
            label: province.name,
            value: province._id,
          }))
        );
        setIsFetchingProvince(false);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingProvince(false);
      }
    }
  };

  const getDistricts = async (provinceId) => {
    try {
      setIsFetchingDistrict(true);
      const response = await axios.get(`/api/location`, {
        params: {
          type: "REGION",
        },
        cancelToken: source.token,
      });
      const data = (await response?.data?.data) ?? [];
      if (!isCanceled.current) {
        setDistricts(
          data
            .filter((district) => district.parent_id == provinceId)
            .map((district) => ({
              label: district.name,
              value: district._id,
              parent_id: district.parent_id,
            }))
        );
        setIsFetchingDistrict(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getHighschools = async ({ type, location_id }) => {
    try {
      const response = await axios.get(
        `/api/highschools/types/${type}/locations/${location_id}`,
        {
          cancelToken: source.token,
        }
      );
      const data = (await response?.data?.data) ?? [];
      if (!isCanceled.current) {
        setHighschools(
          data.map((highSchool) => ({
            label: highSchool.name,
            value: highSchool._id,
          }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getHighschoolEducations = async (highschool_type) => {
    try {
      setHighschoolEducations([]);
      const response = await axios.get(
        `/api/competition-map/school/origin/${highschool_type}/educations`,
        {
          cancelToken: source.token,
        }
      );
      const data = (await response?.data?.data) ?? [];
      if (!isCanceled.current) {
        setHighschoolEducations(
          data.map((education) => ({
            label: education.name,
            value: education.id,
          }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getHighSchoolDistricts = async (provinceId) => {
    try {
      try {
        const response = await axios.get(`/api/location`, {
          params: {
            type: "REGION",
            parent_id: provinceId,
          },
          cancelToken: source.token,
        });
        const data = (await response?.data?.data) ?? [];
        if (!isCanceled.current) {
          setHighSchoolDistricts(
            data
              .filter((district) => district.parent_id == provinceId)
              .map((district) => ({
                label: district.name,
                value: district._id,
                parent_id: district.parent_id,
              }))
          );
        }
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const promiseOptions = debounce((searchTerm, callback) => {
    if (searchTerm.length < 5) {
      return callback([], null);
    }
    axios
      .get(`/api/sale/find-student?email=${searchTerm}`)
      .then((result) => {
        const students = result.data.data;
        const studentOptions = students.map((student) => ({
          label: `${student.name} (${student.email}) (${student.account_type})`,
          email: student.email,
          name: student.name,
          value: student.smartbtw_id,
          address: student.address ?? "",
          phone_number: student.whatsapp_no,
        }));
        return callback(studentOptions);
      })
      .catch((error) => {
        return callback([], null);
      });
  }, 500);

  const setStudentBaseFormValue = (studentProfile) => {
    setValue("name", studentProfile?.name);
    setValue("email", studentProfile?.email);
    setValue("phone_number", studentProfile?.phone);
    setValue("birth_mother_name", studentProfile?.birth_mother_name);
    setValue("birth_place", studentProfile?.birth_place);
    setValue("nik", studentProfile?.nik);
    if (studentProfile?.birth_date == "0001-01-01T00:00:00Z") {
      setValue("birth_date", "");
    } else {
      setValue(
        "birth_date",
        moment(studentProfile?.birth_date).format("YYYY-MM-DD")
      );
    }
    setValue("gender", studentProfile?.gender == "L" ? "1" : "0");
    setValue("address", studentProfile?.address);
    setValue("parent_name", studentProfile?.parent_name);
    setValue("parent_phone_number", studentProfile?.parent_number);
    setValue(
      "province",
      provinces?.find(
        (province) => province.value === studentProfile?.province_id
      )
    );
    setValue("district", {
      label: studentProfile?.student_district?.name,
      value: studentProfile?.student_district?._id,
    });
    setValue(
      "last_education",
      lastEducationTypes?.find(
        (lastEducation) => lastEducation.value == studentProfile?.last_ed_type
      )
    );
    if (studentProfile?.student_highschool_province) {
      setValue(
        "school_origin_province",
        provinces?.find(
          (province) =>
            province.value == studentProfile?.student_highschool_province?._id
        )
      );
    }
  };

  const submitForm = (data) => {
    setSelectedStudent({
      ...selectedStudent,
      address: data.address,
      phone_number: data.phone_number,
    });
    setSelectedStudentDetail(data);
    stepper.next();
  };

  useEffect(() => {
    getProvinces();
    return () => {
      isCanceled.current = true;
    };
  }, []);

  // Get student profile when student is selected
  useEffect(() => {
    setStudentProfile(null);
    setValue("name", "");
    setValue("email", "");
    setValue("province", "");
    setValue("district", "");
    setValue("phone_number", "");
    setValue("birth_date", "");
    setValue("gender", "");
    setValue("address", "");
    setValue("parent_name", "");
    setValue("parent_phone_number", "");
    setDistricts([]);

    setValue("last_education", "");
    setValue("school_origin", "");
    setHighschools([]);

    setValue("school_origin_province", "");
    setValue("school_origin_district", "");
    setHighSchoolDistricts([]);

    setValue("major", "");
    setHighschoolEducations([]);

    if (!currentStudentFormValue?.value) return;
    getStudentProfile(currentStudentFormValue?.value);
  }, [currentStudentFormValue?.value]);

  useEffect(() => {
    // Set student base form value when student is selected
    if (!studentProfile) return;

    setStudentBaseFormValue(studentProfile);
    if (studentProfile?.last_ed_type) {
      if (studentProfile?.initial_majors?.length)
        setHighschoolEducations(studentProfile?.initial_majors);
      if (studentProfile?.initial_highschools?.length)
        setHighschools(studentProfile?.initial_highschools);
      if (studentProfile?.initial_highschool_districts?.length)
        setHighSchoolDistricts(studentProfile?.initial_highschool_districts);
    }
    setIsFetchingStudentProfile(false);
  }, [studentProfile]);

  useEffect(() => {
    if (
      !studentProfile?.initial_majors?.length ||
      !highschoolEducations?.length
    )
      return;
    if (studentProfile && !studentProfile?.student_major) return;
    setValue(
      "major",
      studentProfile?.initial_majors?.find(
        (major) => major.value == studentProfile?.last_ed_major_id
      )
    );
    setStudentProfile({ ...studentProfile, student_major: null });
  }, [studentProfile?.initial_majors, highschoolEducations]);

  useEffect(() => {
    if (
      !studentProfile?.initial_highschool_districts?.length ||
      !highschoolDistricts?.length
    )
      return;
    if (studentProfile && !studentProfile?.student_highschool_district) return;
    setValue(
      "school_origin_district",
      studentProfile?.initial_highschool_districts?.find(
        (district) => district.value == studentProfile?.last_ed_region_id
      )
    );
    setStudentProfile({
      ...studentProfile,
      student_major: null,
      student_highschool_province: null,
      student_highschool_district: null,
    });
  }, [studentProfile?.initial_highschool_districts, highschoolDistricts]);

  useEffect(() => {
    if (!studentProfile?.initial_highschools?.length || !highschools?.length)
      return;
    if (studentProfile && !studentProfile?.student_highschool) return;
    setValue(
      "school_origin",
      studentProfile?.initial_highschools?.find(
        (highschool) => highschool.value == studentProfile?.last_ed_id
      )
    );
    setStudentProfile({
      ...studentProfile,
      student_major: null,
      student_highschool_province: null,
      student_highschool_district: null,
    });
  }, [studentProfile?.initial_highschools, highschools]);

  // Get highschool education when last education changed
  useEffect(() => {
    if (!formValues?.last_education?.value) return;
    if (studentProfile?.student_major) return;
    // Reset previous selected major,
    // then repopulate the major data
    setValue("major", "");
    setHighschoolEducations([]);

    setValue("school_origin_province", "");

    setValue("school_origin_district", "");
    setHighSchoolDistricts([]);

    setValue("school_origin", "");
    setHighschools([]);

    getHighschoolEducations(formValues?.last_education?.value);
  }, [formValues?.last_education?.value]);

  useEffect(() => {
    if (!formValues?.school_origin_province?.value) return;
    if (studentProfile?.student_highschool_province) return;
    setValue("school_origin_district", "");
    setHighSchoolDistricts([]);

    setValue("school_origin", "");
    setHighschools([]);
    getHighSchoolDistricts(formValues?.school_origin_province?.value);
  }, [formValues?.school_origin_province?.value]);

  useEffect(() => {
    if (!formValues?.school_origin_district?.value) return;
    if (studentProfile?.student_highschool_district) return;
    if (studentProfile?.student_highschool) return;

    setHighschools([]);
    setValue("school_origin", "");
    getHighschools({
      type: formValues?.last_education?.value,
      location_id: formValues?.school_origin_district?.value,
    });
  }, [formValues?.school_origin_district?.value]);

  useEffect(() => {
    if (!formValues?.school_origin?.value) return;
    if (studentProfile?.student_highschool) {
      setStudentProfile({ ...studentProfile, student_highschool: null });
    }
  }, [formValues?.school_origin?.value]);

  useEffect(() => {
    if (selectedProvince?.value && selectedDistrict?.value) {
      setValue("district", "");
    }
    if (selectedProvince?.value) {
      getDistricts(selectedProvince?.value);
    }
  }, [selectedProvince?.value]);

  useEffect(() => {
    if (isFetchingStudentProfile && studentProfile) {
      setValue(
        "district",
        districts?.find(
          (district) => district.value == studentProfile?.domicile_region_id
        )
      );
    }
  }, [districts]);

  return (
    <>
      <AvForm
        className={classnames("mt-50", isUpdatingStudent && "block-content")}
        onSubmit={handleSubmit(updateStudent)}
      >
        <Row className="justify-content-between align-items-end">
          <Col md={12}>
            <FormGroup>
              <Label for="student">Pilih Siswa</Label>
              <Controller
                isClearable
                id="student"
                name="student"
                control={control}
                defaultValue=""
                render={({ field, fieldState: { error } }) => (
                  <AsyncSelect
                    {...field}
                    loadOptions={promiseOptions}
                    placeholder="Ketikkan email siswa"
                    className={classnames("react-select", {
                      "is-invalid": error,
                    })}
                    classNamePrefix="select"
                  />
                )}
              />
              <p className="text-warning">
                <small>Harap Menginputkan Minimal 5 Karakter</small>
              </p>
            </FormGroup>
            {isFetchingStudentProfile ? <SpinnerCenter /> : null}
            {currentStudentFormValue?.value ? (
              <Fragment>
                <div className={isFetchingStudentProfile ? "d-none" : ""}>
                  <div className="mb-1 font-weight-bold">
                    Preview Data Siswa yang dipilih
                  </div>
                  <div className="alert alert-warning p-2" role="alert">
                    Harap data di bawah disesuaikan kebenarannya dengan data
                    yang terdapat pada <br /> kartu identitas milik Siswa (KTP,
                    Ijazah, dll).
                  </div>
                  <Row className="justify-content-between align-items-end">
                    <Col md={12}>
                      <Controller
                        name="name"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const { ref, ...rest } = field;
                          return (
                            <FormGroup>
                              <Label for="name">
                                Nama <span className="text-danger">*</span>
                              </Label>
                              <Input
                                {...rest}
                                id="name"
                                innerRef={ref}
                                invalid={error && true}
                              />
                            </FormGroup>
                          );
                        }}
                      />
                      <Controller
                        name="email"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const { ref, ...rest } = field;
                          return (
                            <FormGroup>
                              <Label for="email">
                                Email <span className="text-danger">*</span>
                              </Label>
                              <Input
                                {...rest}
                                id="email"
                                innerRef={ref}
                                disabled={true}
                                invalid={error && true}
                              />
                              <FormFeedback>{error?.message}</FormFeedback>
                            </FormGroup>
                          );
                        }}
                      />
                      <Controller
                        name="phone_number"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          return (
                            <FormGroup>
                              <Label for="phone_number">
                                No.HP <span className="text-danger">*</span>
                              </Label>
                              <Cleave
                                name="phone_number"
                                options={{
                                  numericOnly: true,
                                }}
                                className={classnames("form-control", {
                                  "is-invalid": error && true,
                                })}
                                {...field}
                              />
                            </FormGroup>
                          );
                        }}
                      />
                      <Controller
                        name="nik"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const { ref, ...rest } = field;
                          return (
                            <FormGroup>
                              <Label for="nik">NIK</Label>
                              <Input
                                {...rest}
                                id="nik"
                                innerRef={ref}
                                invalid={error && true}
                              />
                            </FormGroup>
                          );
                        }}
                      />
                      <Controller
                        name="birth_place"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const { ref, ...rest } = field;
                          return (
                            <FormGroup>
                              <Label for="birth_place">Tempat Lahir</Label>
                              <Input
                                {...rest}
                                id="birth_place"
                                innerRef={ref}
                                invalid={error && true}
                              />
                            </FormGroup>
                          );
                        }}
                      />
                      <Controller
                        name="birth_date"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const { ref, ...rest } = field;
                          return (
                            <FormGroup>
                              <Label for="birth_date">
                                Tanggal Lahir{" "}
                                <span className="text-danger">*</span>
                              </Label>
                              <Input
                                {...rest}
                                type="date"
                                id="birth_date"
                                innerRef={ref}
                                invalid={error && true}
                                onChange={(e) => {
                                  setValue("birth_date", e.target.value);
                                }}
                              />
                            </FormGroup>
                          );
                        }}
                      />
                      <AvRadioGroup
                        name="gender"
                        {...register("gender")}
                        required
                      >
                        <Label for="title">
                          Jenis Kelamin <span className="text-danger">*</span>
                        </Label>
                        <div className="d-flex">
                          <AvRadio
                            className="mb-1 mr-50"
                            customInput
                            label="Laki-laki"
                            value="1"
                          />
                          <AvRadio customInput label="Perempuan" value="0" />
                        </div>
                      </AvRadioGroup>
                      <h6 className="text-uppercase">Informasi Domisili</h6>
                      <Controller
                        isClearable
                        name="province"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FormGroup>
                            <Label>
                              Provinsi Tempat Tinggal{" "}
                              <span className="text-danger">*</span>
                            </Label>
                            <Select
                              {...field}
                              options={provinces}
                              isLoading={isFetchingProvince}
                              className={classnames("react-select", {
                                "is-invalid": error,
                              })}
                              classNamePrefix="select"
                            />
                          </FormGroup>
                        )}
                      />
                      <Controller
                        isClearable
                        name="district"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FormGroup>
                            <Label>
                              Kabupaten Tempat Tinggal{" "}
                              <span className="text-danger">*</span>
                            </Label>
                            <Select
                              {...field}
                              options={districts}
                              isLoading={isFetchingDistrict}
                              isDisabled={isFetchingProvince}
                              className={classnames("react-select", {
                                "is-invalid": error,
                              })}
                              classNamePrefix="select"
                            />
                          </FormGroup>
                        )}
                      />
                      <Controller
                        name="address"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const { ref, ...rest } = field;
                          return (
                            <FormGroup>
                              <Label for="address">
                                Alamat Tempat Tinggal{" "}
                                <span className="text-danger">*</span>
                              </Label>
                              <Input
                                {...rest}
                                id="address"
                                innerRef={ref}
                                invalid={error && true}
                              />
                            </FormGroup>
                          );
                        }}
                      />
                      <h6 className="text-uppercase">Informasi Pendidikan</h6>
                      <Controller
                        isClearable
                        name="last_education"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FormGroup>
                            <Label>
                              Pendidikan Terakhir{" "}
                              <span className="text-danger">*</span>
                            </Label>
                            <Select
                              {...field}
                              options={lastEducationTypes}
                              className={classnames("react-select", {
                                "is-invalid": error,
                              })}
                              classNamePrefix="select"
                            />
                          </FormGroup>
                        )}
                      />
                      <Controller
                        isClearable
                        name="major"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FormGroup>
                            <Label>
                              Jurusan <span className="text-danger">*</span>
                            </Label>
                            <Select
                              {...field}
                              options={highschoolEducations}
                              className={classnames("react-select", {
                                "is-invalid": error,
                              })}
                              classNamePrefix="select"
                            />
                          </FormGroup>
                        )}
                      />
                      <h6 className="text-uppercase">Informasi Asal Sekolah</h6>
                      <Controller
                        isClearable
                        name="school_origin_province"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FormGroup>
                            <Label>
                              Provinsi Asal Sekolah{" "}
                              <span className="text-danger">*</span>
                            </Label>
                            <Select
                              {...field}
                              options={provinces}
                              className={classnames("react-select", {
                                "is-invalid": error,
                              })}
                              classNamePrefix="select"
                            />
                          </FormGroup>
                        )}
                      />

                      <Controller
                        isClearable
                        name="school_origin_district"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FormGroup>
                            <Label>
                              Kabupaten Asal Sekolah{" "}
                              <span className="text-danger">*</span>
                            </Label>
                            <Select
                              {...field}
                              options={highschoolDistricts}
                              className={classnames("react-select", {
                                "is-invalid": error,
                              })}
                              classNamePrefix="select"
                            />
                          </FormGroup>
                        )}
                      />

                      <Controller
                        isClearable
                        name="school_origin"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <FormGroup>
                            <Label>
                              Asal Sekolah{" "}
                              <span className="text-danger">*</span>
                            </Label>
                            <Select
                              {...field}
                              options={highschools}
                              className={classnames("react-select", {
                                "is-invalid": error,
                              })}
                              classNamePrefix="select"
                            />
                          </FormGroup>
                        )}
                      />

                      <h6 className="text-uppercase">
                        Informasi Orang Tua/Wali
                      </h6>
                      <Controller
                        name="parent_name"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const { ref, ...rest } = field;
                          return (
                            <FormGroup>
                              <Label for="parent_name">
                                Nama Ayah / Wali{" "}
                                <span className="text-danger">*</span>
                              </Label>
                              <Input
                                {...rest}
                                id="parent_name"
                                innerRef={ref}
                                invalid={error && true}
                              />
                            </FormGroup>
                          );
                        }}
                      />
                      <Controller
                        name="birth_mother_name"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const { ref, ...rest } = field;
                          return (
                            <FormGroup>
                              <Label for="birth_mother_name">
                                Nama Ibu Kandung
                              </Label>
                              <Input
                                {...rest}
                                id="birth_mother_name"
                                innerRef={ref}
                                invalid={error && true}
                              />
                            </FormGroup>
                          );
                        }}
                      />
                      <Controller
                        name="parent_phone_number"
                        defaultValue=""
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          return (
                            <FormGroup>
                              <Label for="parent_phone_number">
                                No.HP Orang Tua{" "}
                                <span className="text-danger">*</span>
                              </Label>
                              <Cleave
                                name="parent_phone_number"
                                options={{
                                  numericOnly: true,
                                }}
                                className={classnames("form-control", {
                                  "is-invalid": error && true,
                                })}
                                {...field}
                              />
                            </FormGroup>
                          );
                        }}
                      />
                    </Col>
                  </Row>
                </div>
              </Fragment>
            ) : null}
            <div className="d-flex justify-content-between mt-3">
              <Button
                color="primary"
                className="btn-prev"
                onClick={() => {
                  resetForm();
                  setSelectedStudent();
                  if (clearErrors) {
                    clearErrors();
                  }
                  stepper.previous();
                }}
              >
                <ArrowLeft
                  size={14}
                  className="align-middle mr-sm-25 mr-0"
                ></ArrowLeft>
                <span className="align-middle d-sm-inline-block d-none">
                  Sebelumnya
                </span>
              </Button>
              <Button type="submit" color="primary" className="btn-next">
                <span className="align-middle d-sm-inline-block d-none">
                  Pilih & Lanjutkan
                </span>

                <ArrowRight
                  size={14}
                  className="align-middle ml-sm-25 ml-0"
                ></ArrowRight>
              </Button>
            </div>
          </Col>
        </Row>
      </AvForm>
    </>
  );
};

export default ChooseAndEditStudent;
