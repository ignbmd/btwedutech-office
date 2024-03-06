import axios from "axios";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { Controller } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "react-feather";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
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

const CreateStudent = ({
  control,
  stepper,
  register,
  setValue,
  formValues,
  handleSubmit,
  createStudent,
  selectedStudent,
  selectedProvince,
  emailCreatedForm,
  selectedDistrict,
  isCreatingStudent,
  handleToPreviousStep,
}) => {
  const [isFetchingProvince, setIsFetchingProvince] = useState(true);
  const [isFetchingDistrict, setIsFetchingDistrict] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [highschools, setHighschools] = useState([]);
  const [highschoolEducations, setHighschoolEducations] = useState([]);
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

  useEffect(() => {
    getProvinces();

    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    if (selectedProvince?.value && selectedDistrict?.value) {
      setValue("district", "");
    }
    if (selectedProvince?.value) {
      getDistricts(selectedProvince?.value);
    }
  }, [selectedProvince?.value]);

  useEffect(() => {
    if (!formValues?.last_education?.value) return;

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
    setValue("school_origin_district", "");
    setHighSchoolDistricts([]);

    setValue("school_origin", "");
    setHighschools([]);
    getHighSchoolDistricts(formValues?.school_origin_province?.value);
  }, [formValues?.school_origin_province?.value]);

  useEffect(() => {
    if (!formValues?.school_origin_district?.value) return;
    setHighschools([]);
    setValue("school_origin", "");
    getHighschools({
      type: formValues?.last_education?.value,
      location_id: formValues?.school_origin_district?.value,
    });
  }, [formValues?.school_origin_district?.value]);

  return (
    <>
      <AvForm
        className={classnames("mt-50", isCreatingStudent && "block-content")}
        onSubmit={handleSubmit(createStudent)}
      >
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
                      invalid={error && true}
                      disabled={selectedStudent?.id && emailCreatedForm}
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
                      Tanggal Lahir <span className="text-danger">*</span>
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
            <AvRadioGroup name="gender" {...register("gender")} required>
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
                    Pendidikan Terakhir <span className="text-danger">*</span>
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
                    Provinsi Asal Sekolah <span className="text-danger">*</span>
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
                    Asal Sekolah <span className="text-danger">*</span>
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

            <h6 className="text-uppercase">Informasi Orang Tua/Wali</h6>
            <Controller
              name="parent_name"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="parent_name">
                      Nama Ayah / Wali <span className="text-danger">*</span>
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
                    <Label for="birth_mother_name">Nama Ibu Kandung</Label>
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
                      No.HP Orang Tua <span className="text-danger">*</span>
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

            <div className="d-flex justify-content-between mt-3">
              <Button
                color="primary"
                className="btn-prev"
                onClick={() => handleToPreviousStep()}
              >
                <ArrowLeft
                  size={14}
                  className="align-middle mr-sm-25 mr-0"
                ></ArrowLeft>
                <span className="align-middle d-sm-inline-block d-none">
                  Sebelumnya
                </span>
              </Button>
              <Button
                type="submit"
                color="primary"
                className="btn-next"
                disabled={isCreatingStudent}
              >
                <span className="align-middle d-sm-inline-block d-none">
                  {isCreatingStudent
                    ? "Please wait..."
                    : selectedStudent?.id
                    ? "Perbarui & Lanjutkan"
                    : "Simpan & Lanjutkan"}
                </span>
                {!isCreatingStudent && (
                  <ArrowRight
                    size={14}
                    className="align-middle ml-sm-25 ml-0"
                  ></ArrowRight>
                )}
              </Button>
            </div>
          </Col>
        </Row>
      </AvForm>
    </>
  );
};

export default CreateStudent;
