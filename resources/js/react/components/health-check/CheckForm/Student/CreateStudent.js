import axios from "axios";
import Select from "react-select";
import classnames from "classnames";
import { ArrowRight } from "react-feather";
import { Controller } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
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
import { getAllBranch } from "../../../../services/branch/branch";

const CreateStudent = ({
  control,
  stepper,
  register,
  setValue,
  handleSubmit,
  createStudent,
  selectedStudent,
  selectedProvince,
  emailCreatedForm,
  selectedDistrict,
  isCreatingStudent,
  handleToPreviousStep,
}) => {
  const [userBranchCode, setUserBranchCode] = useState("");
  const [isFetchingBranch, setIsFetchingBranch] = useState(true);
  const [isFetchingProvince, setIsFetchingProvince] = useState(true);
  const [isFetchingDistrict, setIsFetchingDistrict] = useState(false);
  const [branches, setBranches] = useState();
  const [provinces, setProvinces] = useState([
    {
      label: "Bali",
      value: "1",
    },
  ]);
  const [districts, setDistricts] = useState([]);
  const [purposes] = useState([
    {
      label: "Persiapan Ujian CPNS",
      value: "CPNS_TEST_PREPARATION",
    },
    {
      label: "Persiapan Masuk Sekolah Kedinasan",
      value: "SEKDIN_TEST_PREPARATION",
    },
  ]);
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const getUserBranchCode = () => {
    const dom = document.getElementById("branchCode");
    return dom.innerText;
  };

  const getProvinces = async () => {
    try {
      const response = await axios.get("/api/location/get-province", {
        cancelToken: source.token,
      });
      const data = await response.data;
      if (!isCanceled.current) {
        setProvinces(
          data.map((province) => ({
            label: province.text,
            value: province.id,
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
      const response = await axios.get(
        `/api/location/get-region/${provinceId}`,
        {
          cancelToken: source.token,
        }
      );
      const data = await response.data;
      if (!isCanceled.current) {
        setDistricts(
          data.map((district) => ({
            label: district.text,
            value: district.id,
          }))
        );
        setIsFetchingDistrict(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBranchs = async (currentUserBranchCode) => {
    try {
      const res = await getAllBranch({ cancelToken: source.token });
      const branches = res.data;

      if (!isCanceled.current) {
        setBranches(branches);
        if (currentUserBranchCode != "PT0000") {
          setValue(
            "branch",
            branches.find((branch) => branch.code == currentUserBranchCode)
          );
        }
        setIsFetchingBranch(false);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingBranch(false);
      }
    }
  };

  useEffect(() => {
    const userBranchCode = getUserBranchCode();
    setUserBranchCode(userBranchCode);

    getProvinces();
    fetchBranchs(userBranchCode);

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
                      disabled={selectedStudent?.id && emailCreatedForm}
                      invalid={error && true}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="branch"
              control={control}
              defaultValue={[]}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup>
                    <Label className="form-label">Cabang</Label>
                    <Select
                      {...field}
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isSearchable={true}
                      options={branches}
                      isLoading={isFetchingBranch}
                      isDisabled={
                        isFetchingBranch || userBranchCode != "PT0000"
                      }
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.code}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": error && true,
                      })}
                    />
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="phone_number"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="phone_number">
                      No.HP <span className="text-danger">*</span>
                    </Label>
                    <Input
                      {...rest}
                      type="number"
                      id="phone_number"
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
                      Tempat, Tanggal Lahir{" "}
                      <span className="text-danger">*</span>
                    </Label>
                    <Input
                      {...rest}
                      id="birth_date"
                      innerRef={ref}
                      invalid={error && true}
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
            <Controller
              name="school"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="school">
                      Asal Sekolah <span className="text-danger">*</span>
                    </Label>
                    <Input
                      {...rest}
                      id="school"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="last_education"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="last_education">
                      Pendidikan Terakhir <span className="text-danger">*</span>
                    </Label>
                    <Input
                      {...rest}
                      id="last_education"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="major"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="major">
                      Jurusan <span className="text-danger">*</span>
                    </Label>
                    <Input
                      {...rest}
                      id="major"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="parent_name"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="parent_name">
                      Nama Orang Tua <span className="text-danger">*</span>
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
              name="parent_phone_number"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="parent_phone_number">
                      No.HP Orang Tua <span className="text-danger">*</span>
                    </Label>
                    <Input
                      {...rest}
                      type="number"
                      id="parent_phone_number"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />
            <Controller
              isClearable
              name="purpose"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormGroup>
                  <Label>
                    Tujuan Mengikuti Smart BTW{" "}
                    <span className="text-danger">*</span>
                  </Label>
                  <Select
                    {...field}
                    options={purposes}
                    className={classnames("react-select", {
                      "is-invalid": error,
                    })}
                    classNamePrefix="select"
                  />
                </FormGroup>
              )}
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-end mt-3">
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
      </AvForm>
    </>
  );
};

export default CreateStudent;
