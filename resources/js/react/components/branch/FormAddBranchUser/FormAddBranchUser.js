import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import { Save } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Label,
  Input,
  FormGroup,
  Row,
  Col,
  Button,
  FormFeedback,
} from "reactstrap";
import {
  AvRadioGroup,
  AvRadio,
  AvForm,
} from "availity-reactstrap-validation-safe";
import "filepond/dist/filepond.min.css";

import { getBranches } from "../../../data/branch";
import FileUpload from "../../core/file-upload/FileUpload";
import { useFileUpload } from "../../../hooks/useFileUpload";
import { formatMultipleBranchCodeInput } from "../../../utility/branch";
import {
  getLastSegment,
  isObjEmpty,
  selectThemeColors,
  showToast,
} from "../../../utility/Utils";
import axios from "axios";

const MemberSchema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email("Format email tidak valid").required("Wajib diisi"),
  phone: yup.string().required(),
  nik: yup.number().required(),
  address: yup.string().required(),
  branch_code: yup.array().of(yup.object()).required().min(1),
  gender: yup.string().required(),
});

const getIsBranchHasOwner = () => {
  const isHasOwner = document.querySelector("#isBranchHasOwner").innerText;
  return isHasOwner === "true";
};

const FormAddBranchUser = () => {
  const [branches, setBranches] = useState();
  const [isFetchingBranch, setIsFetchingBranch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userFiles] = useState({
    profile: [],
    ktp: [],
    npwp: [],
  });
  const {
    trigger,
    control,
    register,
    getValues,
    setError,
    setFocus,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(MemberSchema),
  });
  const {
    files,
    fileErrors,
    handleError,
    registerFile,
    checkIsFileValid,
    handleSelectedFile,
  } = useFileUpload(userFiles);
  const isCanceled = useRef(false);
  const branchCode = getLastSegment();
  const isHasOwner = getIsBranchHasOwner();

  useEffect(() => {
    return () => {
      isCanceled.current = true;
    };
  }, []);

  const createUser = async (formData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/sso/create-user", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.data;
      if (!isCanceled.current && data) {
        window.location.href = `/cabang/detail/${branchCode}`;
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Terjadi kesalahan",
        message:
          error?.response?.data?.data?.error ??
          "Sistem sedang dalam perbaikan, silakan coba lagi nanti",
      });
      if (!isCanceled.current) {
        setIsSubmitting(false);
        const errObj = error.response.data.data?.errors;
        if (errObj) {
          const arrKeyErrors = Object.keys(errObj);
          arrKeyErrors.map((key, index) => {
            const name = key.split(".").pop();
            setError(name, { message: errObj[key] });
            if (index === 0) {
              setFocus(name);
            }
          });
        }
      }
    }
  };

  const getFormData = () => {
    let formData = new FormData();
    Object.keys(files).map((fileKey) => {
      formData.append(fileKey, files[fileKey][0]);
    });
    const values = getValues();
    Object.keys(values).map((inputKey) => {
      if (inputKey == "roles") {
        formData.append(inputKey, JSON.stringify(values[inputKey]));
      } else if (inputKey == "branch_code") {
        formData.append(
          inputKey,
          formatMultipleBranchCodeInput(values.branch_code)
        );
      } else {
        formData.append(inputKey, values[inputKey]);
      }
    });
    return formData;
  };

  const onSubmit = () => {
    trigger();
    const isFormFileValid = checkIsFileValid();

    if (isObjEmpty(errors) && isFormFileValid) {
      const formData = getFormData();
      createUser(formData);
    }
  };

  const fetchBranches = async () => {
    try {
      setIsFetchingBranch(true);
      const data = await getBranches();
      if (!isCanceled.current) {
        setBranches(data);
        setValue("branch_code", [
          data.find((branch) => branch.code == branchCode),
        ]);
        setIsFetchingBranch(false);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingBranch(false);
      }
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <Fragment>
      <AvForm
        className={classnames("mt-50", isSubmitting && "block-content")}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Row>
          <Col md={6}>
            <Controller
              name="roles[]"
              defaultValue={[
                branchCode === "PT0000"
                  ? "admin"
                  : isHasOwner
                  ? "admin_cabang"
                  : "kepala_cabang",
              ]}
              control={control}
              render={({ field }) => {
                const { ref, ...rest } = field;
                return <Input {...rest} type="hidden" innerRef={ref} />;
              }}
            />
            <Controller
              name="name"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="name">Nama</Label>
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

            <FormGroup>
              <Label>
                Foto Profil <small>(Opsional)</small>
              </Label>
              <FileUpload
                {...registerFile("profile")}
                changed={handleSelectedFile}
                name="profile"
                maxFileSize="5MB"
                onerror={(e) => handleError("profile", e)}
                className={classnames({
                  "filepond-is-invalid": fileErrors.profile.length > 0,
                })}
              />
            </FormGroup>

            <Controller
              name="email"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input
                      {...rest}
                      id="email"
                      innerRef={ref}
                      invalid={error && true}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="phone"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="phone-number">No.HP</Label>
                    <Input
                      {...rest}
                      type="number"
                      id="phone-number"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />

            <AvRadioGroup
              required
              name="gender"
              {...register("gender", { required: true })}
            >
              <Label>Jenis Kelamin</Label>
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
                      type="number"
                      id="nik"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="address"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="address">Alamat</Label>
                    <Input
                      {...rest}
                      id="address"
                      placeholder=""
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="branch_code"
              control={control}
              defaultValue={[]}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Kode Cabang</Label>
                    <Select
                      {...field}
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isMulti={true}
                      isSearchable={true}
                      options={branches}
                      isLoading={isFetchingBranch}
                      isDisabled={isFetchingBranch}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.code}
                      classNamePrefix="select"
                      theme={selectThemeColors}
                      className={classnames("react-select", {
                        "is-invalid": error && true,
                      })}
                    />
                  </FormGroup>
                );
              }}
            />

            <FormGroup>
              <Label>Foto KTP</Label>
              <FileUpload
                {...registerFile("ktp", true)}
                changed={handleSelectedFile}
                name="ktp"
                maxFileSize="5MB"
                onerror={(e) => handleError("ktp", e)}
                className={classnames({
                  "filepond-is-invalid": fileErrors.ktp.length > 0,
                })}
              />
            </FormGroup>

            <FormGroup>
              <Label>Foto NPWP</Label>
              <FileUpload
                {...registerFile("npwp", true)}
                changed={handleSelectedFile}
                name="npwp"
                maxFileSize="5MB"
                onerror={(e) => handleError("npwp", e)}
                className={classnames({
                  "filepond-is-invalid": fileErrors.npwp.length > 0,
                })}
              />
            </FormGroup>
          </Col>
        </Row>

        <Col lg={6}>
          <div className="d-flex justify-content-end mt-2">
            <Button
              type="submit"
              color="success"
              className="btn-next"
              disabled={isFetchingBranch}
            >
              {isSubmitting && (
                <Save size={14} className="align-middle ml-sm-25 ml-0 mr-50" />
              )}
              <span className="align-middle d-sm-inline-block">
                {isSubmitting ? "Menyimpan data..." : "Simpan"}
              </span>
            </Button>
          </div>
        </Col>
      </AvForm>
    </Fragment>
  );
};

export default FormAddBranchUser;
