import axios from "axios";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import { Save } from "react-feather";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Label, Input, FormGroup, Row, Col, Button } from "reactstrap";
import {
  AvRadioGroup,
  AvRadio,
  AvForm,
} from "availity-reactstrap-validation-safe";

import "filepond/dist/filepond.min.css";
import SpinnerCenter from "../../core/spinners/Spinner";
import FileUpload from "../../core/file-upload/FileUpload";
import { useFileUpload } from "../../../hooks/useFileUpload";
import {
  getLastSegment,
  selectThemeColors,
  isObjEmpty,
  showToast,
} from "../../../utility/Utils";
import { getBranches } from "../../../data/branch";
import { explodeMultipleStringBranchCode, formatMultipleBranchCodeInput } from "../../../utility/branch";

const ImagePreview = ({ files, name }) => {
  return (
    <div
      className={classnames(
        typeof files?.[name][0] !== "string" && "d-none",
        "mt-50"
      )}
    >
      <img src={files[name][0]} width="100" />
    </div>
  );
};

const MemberSchema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
  nik: yup.number().required(),
  address: yup.string().required(),
  gender: yup.string().required(),
});

const FormEditBranchUser = () => {
  const [user, setUser] = useState();
  const [branches, setBranches] = useState();
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingBranch, setIsFetchingBranch] = useState(false);
  const [userFiles, setUserFiles] = useState({
    profile: [],
    ktp: [],
    npwp: [],
  });
  const {
    reset,
    control,
    trigger,
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: useMemo(() => {
      return user;
    }, [user]),
    resolver: yupResolver(MemberSchema),
  });
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const {
    files,
    fileErrors,
    handleError,
    registerFile,
    checkIsFileValid,
    handleSelectedFile,
  } = useFileUpload(
    useMemo(() => {
      return userFiles;
    }, [userFiles])
  );

  const getBranchCode = () => {
    const dom = document.getElementById("branchCode");
    return dom.innerText;
  };

  const getUser = async () => {
    const ssoId = getLastSegment();
    try {
      const response = await axios.get(`/api/sso/user/${ssoId}`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const user = data?.data ?? {};
      if (!isCanceled.current) {
        setIsFetching(false);
        const values = {
          name: user.name,
          email: user.email,
          address: user.address,
          phone: user.phone,
          gender: `${user.gender}`,
          nik: user.nik,
          branch_code: user.branch_code,
        };

        const currentFiles = {
          profile: [user.profile_image],
          ktp: [user.ktp_image],
          npwp: [user.npwp_image],
        };
        setUser(values);
        setUserFiles(currentFiles);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetching(false);
      }
    }
  };

  const updateUser = async (formData) => {
    try {
      setIsSubmitting(true);
      const ssoId = getLastSegment();
      const response = await axios.post(
        `/api/sso/update-user/${ssoId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const data = await response.data;
      if (!isCanceled.current && data) {
        window.location.href = `/cabang/detail/${getBranchCode()}`;
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsSubmitting(false);
        const errMessage = error.response.data?.messages;
        if (errMessage) {
          showToast({
            type: "error",
            title: "Terjadi Kesalahan",
            message: errMessage,
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
      if (inputKey == "branch_code") {
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
      const fd = getFormData();
      updateUser(fd);
    }
  };

  const fetchBranches = async () => {
    try {
      setIsFetchingBranch(true);
      const data = await getBranches();
      if (!isCanceled.current) {
        setBranches(data);
        const branchCodes = explodeMultipleStringBranchCode(user.branch_code);
        setValue(
          "branch_code",
          data.filter((branch) => branchCodes.includes(branch.code))
        );
        setIsFetchingBranch(false);
      }
    } catch (error) {
      console.log({ error });
      if (!isCanceled.current) {
        setIsFetchingBranch(false);
      }
    }
  };

  useEffect(() => {
    reset(user);
    if (user) {
      fetchBranches();
    }
  }, [user]);

  useEffect(() => {
    getUser();
    return () => {};
  }, []);

  return isFetching ? (
    <SpinnerCenter />
  ) : (
    <Fragment>
      <AvForm
        className={classnames("mt-50", isSubmitting && "block-content")}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Row>
          <Col md={6}>
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
              <ImagePreview files={files} name="profile" />
            </FormGroup>

            <Controller
              name="email"
              defaultValue=""
              control={control}
              render={({ field }) => {
                const { ref } = field;
                return (
                  <Input
                    id="email"
                    type="hidden"
                    innerRef={ref}
                    value={user?.email ?? ""}
                  />
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
              value="1"
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
              <ImagePreview files={files} name="ktp" />
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
              <ImagePreview files={files} name="npwp" />
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col lg={6}>
            <div className="d-flex justify-content-end mt-2">
              <Button type="submit" color="primary" className="btn-next">
                {!isSubmitting && (
                  <Save
                    size={14}
                    className="align-middle ml-sm-25 ml-0 mr-50"
                  />
                )}
                <span className="align-middle d-sm-inline-block">
                  {isSubmitting ? "Memperbarui data..." : "Perbarui"}
                </span>
              </Button>
            </div>
          </Col>
        </Row>
      </AvForm>
    </Fragment>
  );
};

export default FormEditBranchUser;
