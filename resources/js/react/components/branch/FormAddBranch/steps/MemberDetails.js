import * as yup from "yup";
import { nanoid } from "nanoid";
import classnames from "classnames";
import { Controller, useForm } from "react-hook-form";
import { SlideDown } from "react-slidedown";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash } from "react-feather";
import {
  Label,
  FormGroup,
  Row,
  Col,
  Button,
  Input,
  Badge,
  FormFeedback,
} from "reactstrap";
import Select from "react-select";
import { yupResolver } from "@hookform/resolvers/yup";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import { AvRadioGroup, AvRadio } from "availity-reactstrap-validation-safe";

import "flatpickr/dist/themes/airbnb.css";
import "react-slidedown/lib/slidedown.css";
import "filepond/dist/filepond.min.css";

import DividerText from "../../../core/divider/DividerText.js";
import FileUpload from "../../../core/file-upload/FileUpload.js";
import { useFileUpload } from "../../../../hooks/useFileUpload.js";
import { AddBranchContext } from "../../../../context/AddBranchContext.js";
import { isObjEmpty, selectThemeColors } from "../../../../utility/Utils.js";
import { getBranches } from "../../../../data/branch.js";

const MemberDetails = ({ stepper, formData, updateFormData }) => {
  const [userFile] = useState({});
  const [branches, setBranches] = useState();
  const [createdOptionBranch, setCreatedOptionBranch] = useState([]);
  const [isFetchingBranch, setIsFetchingBranch] = useState(false);
  const [ids, setIds] = useState([nanoid()]);
  const [memberSchema, setMemberSchema] = useState({
    role: yup.array().of(yup.string().required()),
    name: yup.array().of(yup.string().required()),
    email: yup
      .array()
      .of(yup.string().email("Format email tidak valid").required()),
    phone_number: yup.array().of(yup.string().required()),
    nik: yup.array().of(yup.number().required()),
    address: yup.array().of(yup.string().required()),
    gender: yup.array().of(yup.string().required()),
  });
  const {
    control,
    trigger,
    register,
    setFocus,
    setError,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: useMemo(
      () => yupResolver(yup.object().shape(memberSchema)),
      [memberSchema]
    ),
  });

  const {
    files,
    setFiles,
    setErrors,
    fileErrors,
    handleError,
    registerFile,
    checkIsFileValid,
    handleSelectedFile,
  } = useFileUpload(userFile);

  const { updateErrorMemberDetailForm, setFocusErrorMemberDetailForm } =
    useContext(AddBranchContext);

  useEffect(() => {
    setMemberSchema((current) => {
      const copyIds = [...ids];
      const lastId = copyIds.pop();
      return {
        ...current,
        [`role-${lastId}`]: yup.string().required(),
        [`name-${lastId}`]: yup.string().required(),
        [`email-${lastId}`]: yup
          .string()
          .email("Format email tidak valid")
          .required('Wajib diisi'),
        [`phone_number-${lastId}`]: yup.string().required(),
        [`nik-${lastId}`]: yup.number().required(),
        [`address-${lastId}`]: yup.string().required(),
        [`gender-${lastId}`]: yup.string().required(),
      };
    });
  }, [ids]);

  const onSubmit = () => {
    trigger();
    const isInputFileValid = checkIsFileValid();
    if (isObjEmpty(errors) && isInputFileValid) {
      updateFormData({
        ids,
        ...getValues(),
        ...files,
      });
      stepper.next();
    }
  };

  const increaseCount = () => {
    const newId = nanoid();
    setIds((currentIds) => {
      return [...currentIds, newId];
    });
    setFiles((current) => ({
      ...current,
      [`profile-${newId}`]: [],
      [`npwp-${newId}`]: [],
    }));
  };

  const fetchBranches = async () => {
    try {
      setIsFetchingBranch(true);
      const data = await getBranches();
      setBranches(data);
      const createdOptionBranch = [
        {
          name: formData.name,
          code: formData.branchCode,
          isFixed: true,
        },
      ];
      const firstFormId = ids[0];
      setValue(`branch_code-${firstFormId}`, createdOptionBranch);
      setCreatedOptionBranch(createdOptionBranch);
      setIsFetchingBranch(false);
    } catch (error) {
      console.log({ error });
      setIsFetchingBranch(false);
    }
  };

  useEffect(() => {
    if (formData.branchCode) {
      fetchBranches();
    }
  }, [formData.branchCode]);

  useEffect(() => {
    setFiles({
      [`profile-${ids[0]}`]: [],
      [`ktp-${ids[0]}`]: [],
      [`npwp-${ids[0]}`]: [],
    });
    updateErrorMemberDetailForm.current = setError;
    setFocusErrorMemberDetailForm.current = setFocus;
  }, []);

  const removeFileValues = (id) => {
    const values = { ...files };
    const valueKeys = Object.keys(values);
    const errors = { ...fileErrors };
    const errorKeys = Object.keys(errors);
    valueKeys.map((key) => {
      if (key.includes(id)) {
        delete values[key];
      }
    });
    errorKeys.map((key) => {
      if (key.includes(id)) {
        delete errors[key];
      }
    });
    setFiles(values);
    setErrors(errors);
  };

  const deleteForm = (index) => {
    const updatedIds = [...ids];
    const deletedId = updatedIds.splice(index, 1);
    removeFileValues(deletedId);

    setIds(updatedIds);
    setMemberSchema((current) => {
      const updatedSchema = {
        ...current,
      };
      delete updatedSchema[`role-${deletedId}`];
      delete updatedSchema[`name-${deletedId}`];
      delete updatedSchema[`email-${deletedId}`];
      delete updatedSchema[`phone_number-${deletedId}`];
      delete updatedSchema[`nik-${deletedId}`];
      delete updatedSchema[`address-${deletedId}`];
      delete updatedSchema[`gender-${deletedId}`];

      return updatedSchema;
    });
  };

  const onBranchInputChange = (value, actionMeta, hookFormChange) => {
    switch (actionMeta.action) {
      case "remove-value":
      case "pop-value":
        if (actionMeta.removedValue.isFixed) {
          return;
        }
        break;
      case "clear":
        value = createdOptionBranch;
        break;
    }
    hookFormChange(value);
  };

  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0">Pengguna Cabang</h5>
        <small>Inputkan data kepala cabang beserta anggotanya</small>
      </div>

      <AvForm className="mt-50" onSubmit={handleSubmit(onSubmit)}>
        {ids.map((id, i) => {
          const Tag = i === 0 ? "div" : SlideDown;
          return (
            <Tag key={id}>
              {i === 0 ? (
                <>
                  <Badge color="primary mr-25 h3">Kepala Cabang</Badge>
                  <Badge color="warning h3">Wajib diisi</Badge>
                </>
              ) : (
                <>
                  <Badge color="primary mr-25 h3">Admin Cabang</Badge>
                  <Badge color="secondary h3">Opsional</Badge>
                </>
              )}
              <Row className="justify-content-between align-items-end">
                <Col md={9}>
                  <Controller
                    name={`role-${id}`}
                    defaultValue={i == 0 ? "kepala_cabang" : "admin_cabang"}
                    control={control}
                    render={({ field }) => {
                      const { ref, ...rest } = field;
                      return <Input {...rest} type="hidden" innerRef={ref} />;
                    }}
                  />
                  <Controller
                    name={`name-${id}`}
                    defaultValue=""
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup>
                          <Label for={`name-${id}`}>Nama</Label>
                          <Input
                            {...rest}
                            id={`name-${id}`}
                            innerRef={ref}
                            invalid={error && true}
                          />
                        </FormGroup>
                      );
                    }}
                  />
                  <FormGroup>
                    <Label for={`profile-${id}`}>
                      Foto Profil <small>(Opsional)</small>
                    </Label>
                    <FileUpload
                      {...registerFile(`profile-${id}`)}
                      changed={handleSelectedFile}
                      name={`profile-${id}`}
                      maxFileSize="5MB"
                      onerror={(e) => handleError(`profile-${id}`, e)}
                      className={classnames({
                        "filepond-is-invalid":
                          fileErrors[`profile-${id}`]?.length > 0,
                      })}
                    />
                  </FormGroup>
                  <Controller
                    name={`email-${id}`}
                    defaultValue=""
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup>
                          <Label for={`email-${id}`}>Email</Label>
                          <Input
                            {...rest}
                            id={`email-${id}`}
                            innerRef={ref}
                            invalid={error && true}
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />
                  <Controller
                    name={`phone_number-${id}`}
                    defaultValue=""
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup>
                          <Label for={`phone-number-${id}`}>No.HP</Label>
                          <Input
                            {...rest}
                            type="number"
                            id={`phone-number-${id}`}
                            innerRef={ref}
                            invalid={error && true}
                          />
                        </FormGroup>
                      );
                    }}
                  />
                  <AvRadioGroup
                    required
                    name={`gender-${id}`}
                    {...register(`gender-${id}`, { required: true })}
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
                    name={`nik-${id}`}
                    defaultValue=""
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup>
                          <Label for={`nik-${id}`}>NIK</Label>
                          <Input
                            {...rest}
                            type="number"
                            id={`nik-${id}`}
                            innerRef={ref}
                            invalid={error && true}
                          />
                        </FormGroup>
                      );
                    }}
                  />
                  <Controller
                    name={`address-${id}`}
                    defaultValue=""
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup>
                          <Label for={`address-${id}`}>Alamat</Label>
                          <Input
                            {...rest}
                            id={`address-${id}`}
                            placeholder=""
                            innerRef={ref}
                            invalid={error && true}
                          />
                        </FormGroup>
                      );
                    }}
                  />
                  <Controller
                    name={`branch_code-${id}`}
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">Cabang</Label>
                          <Select
                            {...field}
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                              multiValue: (base, state) => {
                                return state.data.isFixed
                                  ? { ...base, backgroundColor: "gray" }
                                  : base;
                              },
                              multiValueLabel: (base, state) => {
                                return state.data.isFixed
                                  ? {
                                      ...base,
                                      fontWeight: "bold",
                                      color: "white",
                                      paddingRight: 6,
                                    }
                                  : base;
                              },
                              multiValueRemove: (base, state) => {
                                return state.data.isFixed
                                  ? { ...base, display: "none" }
                                  : base;
                              },
                            }}
                            defaultValue={createdOptionBranch}
                            isMulti={true}
                            isSearchable={true}
                            options={branches}
                            isLoading={isFetchingBranch}
                            isDisabled={isFetchingBranch}
                            isClearable={field.value?.some((v) => !v.isFixed)}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.code}
                            onChange={(value, actionMeta) => {
                              onBranchInputChange(
                                value,
                                actionMeta,
                                field.onChange
                              );
                            }}
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
                      {...registerFile(`ktp-${id}`, true)}
                      changed={handleSelectedFile}
                      name={`ktp-${id}`}
                      maxFileSize="5MB"
                      onerror={(e) => handleError(`ktp-${id}`, e)}
                      className={classnames({
                        "filepond-is-invalid":
                          fileErrors[`ktp-${id}`]?.length > 0,
                      })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Foto NPWP (Opsional)</Label>
                    <FileUpload
                      {...registerFile(`npwp-${id}`)}
                      changed={handleSelectedFile}
                      name={`npwp-${id}`}
                      maxFileSize="5MB"
                      onerror={(e) => handleError(`npwp-${id}`, e)}
                      className={classnames({
                        "filepond-is-invalid":
                          fileErrors[`npwp-${id}`]?.length > 0,
                      })}
                    />
                  </FormGroup>
                </Col>
                {i !== 0 && (
                  <Col md={2}>
                    <Col md={12}>
                      <Button
                        color="danger"
                        className="text-nowrap px-1 mb-1"
                        onClick={() => deleteForm(i)}
                        outline
                      >
                        <Trash size={14} />
                      </Button>
                    </Col>
                  </Col>
                )}
                <Col sm={12}>
                  <DividerText text={`End Form ${i + 1}`} />
                </Col>
              </Row>
            </Tag>
          );
        })}

        <Row>
          <Col sm={12}>
            <Button
              className="btn-icon"
              color="success"
              onClick={increaseCount}
            >
              <Plus size={14} />
              <span className="align-middle ml-25">Add New</span>
            </Button>
          </Col>
        </Row>
        <div className="d-flex justify-content-between mt-2">
          <Button
            color="primary"
            className="btn-prev"
            onClick={() => stepper.previous()}
          >
            <ArrowLeft
              size={14}
              className="align-middle mr-sm-25 mr-0"
            ></ArrowLeft>
            <span className="align-middle d-sm-inline-block d-none">
              Previous
            </span>
          </Button>
          <Button type="submit" color="primary" className="btn-next">
            <span className="align-middle d-sm-inline-block d-none">Next</span>
            <ArrowRight
              size={14}
              className="align-middle ml-sm-25 ml-0"
            ></ArrowRight>
          </Button>
        </div>
      </AvForm>
    </Fragment>
  );
};

export default MemberDetails;
