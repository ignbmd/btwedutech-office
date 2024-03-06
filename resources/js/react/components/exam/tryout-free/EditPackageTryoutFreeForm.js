import React, { useEffect, useRef, useState } from "react";
import Axios from "axios";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import moment from "moment-timezone";
import {
  Button,
  Card,
  CardBody,
  Col,
  CustomInput,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Badge,
  Label,
} from "reactstrap";
import { Save } from "react-feather";

import {
  baseNumeralOptions,
  getLastSegment,
  isObjEmpty,
} from "../../../utility/Utils";
import "flatpickr/dist/themes/airbnb.css";
import { programs } from "../../../config/programs";
import SpinnerCenter from "../../core/spinners/Spinner";
import axios from "../../../utility/http";

const FormSchema = yup.object().shape({
  tryout_name: yup.string().required("Wajib diisi"),
  start_date: yup.string().nullable(),
  modules: yup.object().required("Wajib diisi"),
  program: yup.object().required("Wajib diisi"),
  end_date: yup.string().nullable(),
  duration: yup
    .number()
    .required("Wajib diisi")
    .min(1, "Waktu mengerjakan tidak boleh 0!"),
  max_repeat: yup
    .number()
    .required("Wajib diisi")
    .min(1, "Batas mengerjakan tidak boleh 0!"),
  status: yup.boolean().required("Wajib diisi"),
  branch_code: yup.object().required("Wajib diisi"),
  instruction: yup.object().required("Wajib diisi").nullable(),
});

const EditPackageTryoutFreeForm = () => {
  const [branchs, setBranchs] = useState();
  const [modules, setModules] = useState();
  const [instructions, setInstructions] = useState();
  const [isFetchingBranch, setIsFetchingBranch] = useState(false);
  const [isFetchingModule, setIsFetchingModule] = useState(false);
  const [isFetchingInstruction, setIsFetchingInstruction] = useState(false);
  const [selectedBranchEdit, setSelectedBranchEdit] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      package_type: "WITH_CODE",
    },
  });
  const isCanceled = useRef(false);
  const source = Axios.CancelToken.source();
  const { program, start_date, end_date } = watch();

  const getBranchs = async () => {
    try {
      setIsFetchingBranch(true);

      const response = await axios.get(`/branch/all`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const branchData = data?.data ?? [];

      if (!isCanceled.current) {
        setIsFetchingBranch(false);
        setBranchs(branchData);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingBranch(false);
      }
    }
  };

  const getModule = async (program) => {
    try {
      setIsFetchingModule(true);

      const response = await axios.get(`/exam/module/program/${program}`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const moduleData = data?.data ?? [];

      if (!isCanceled.current) {
        setIsFetchingModule(false);
        setModules(moduleData);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingModule(false);
      }
    }
  };

  const getInstruction = async (program) => {
    try {
      setIsFetchingInstruction(true);

      const response = await axios.get(`/exam/instruction/${program}`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const instructionData = data?.data ?? [];

      if (!isCanceled.current) {
        setIsFetchingInstruction(false);
        setInstructions(instructionData);
      }
    } catch (error) {
      console.log({ error });
      if (!isCanceled.current) {
        setIsFetchingInstruction(false);
      }
    }
  };

  const getTryoutFreePackage = async () => {
    try {
      const id = getLastSegment();
      const response = await axios.get(`/exam/tryout-free/detail/${id}`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const TryoutFreeDetail = data?.data ?? [];
      return TryoutFreeDetail;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  const loadEdit = async () => {
    setIsLoading(true);
    const data = await getTryoutFreePackage();
    setValue("legacy_task_id", data?.legacy_task_id ?? "");
    setValue("privacy_type", data?.privacy_type ?? "");
    setValue("tryout_name", data?.title ?? "");
    setValue("modules", data?.modules ?? "");
    setValue(
      "start_date",
      data?.start_date
        ? moment(data?.start_date).utcOffset("+0700").format("YYYY-MM-DDTHH:mm")
        : ""
    );
    setValue(
      "end_date",
      data?.end_date
        ? moment(data?.end_date).utcOffset("+0700").format("YYYY-MM-DDTHH:mm")
        : ""
    );
    setValue("duration", data?.duration ?? "");
    setValue(
      "program",
      programs.find((program) => program.slug == data.program)
    );
    setSelectedBranchEdit(data?.branch_code ?? "");
    setValue("instruction", data?.instructions ?? "");
    setValue("status", data?.status ?? "");
    setIsLoading(false);
  };

  const convertUTC = (date) => {
    return moment.utc(date).format();
  };

  const getPayload = () => {
    const form = getValues();
    let start = "";
    let end = "";
    form.start_date.length > 0
      ? (start = convertUTC(form.start_date))
      : (start = null);
    form.end_date.length > 0 ? (end = convertUTC(form.end_date)) : (end = null);

    const payload = {
      title: form.tryout_name,
      program: form.program.slug,
      modules_id: form.modules.id,
      legacy_task_id: form.legacy_task_id,
      duration: form?.duration,
      status: form.status,
      privacy_type: form.privacy_type,
      instructions_id: form.instruction.id,
      branch_code: form.branch_code.code,
      max_repeat: form?.max_repeat,
      start_date: start,
      end_date: end,
    };
    return payload;
  };

  const redirectToIndex = () => {
    window.location.href = "/ujian/tryout-gratis/detail/" + getLastSegment();
  };

  useEffect(() => {
    if (branchs) {
      setValue(
        "branch_code",
        branchs.find((branch) => branch.code === selectedBranchEdit)
      );
    }
  }, [branchs, selectedBranchEdit]);

  const processFormUpdate = async () => {
    setIsSubmitting(true);
    const payload = getPayload();
    payload.id = parseInt(getLastSegment());
    try {
      const response = await axios.put("/exam/tryout-free/update", payload);
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const onSubmit = () => {
    trigger();
    if (isObjEmpty(errors)) {
      processFormUpdate();
    }
  };

  useEffect(() => {
    if (program?.slug) {
      getModule(program?.slug);
      getInstruction(program?.slug);
    }
  }, [program?.slug]);

  useEffect(() => {
    getBranchs();
    loadEdit();
  }, []);

  useEffect(() => {
    if (!start_date || !end_date) setValue("max_repeat", 1);
  }, [start_date, end_date]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardBody>
          {isLoading ? (
            <SpinnerCenter />
          ) : (
            <Col md={6} className={classnames("mt-2 pl-0")}>
              <Controller
                name="program"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Program</Label>
                      <Select
                        {...field}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                        isSearchable={false}
                        options={programs}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.slug}
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
                name="modules"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Pilih Modul</Label>
                      <Select
                        {...field}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                        isSearchable
                        options={modules}
                        isLoading={isFetchingModule}
                        getOptionLabel={(option) =>
                          `${option.name} (${option.module_code})`
                        }
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

              <Controller
                name="tryout_name"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Nama Gelombang</Label>
                      <Input
                        {...rest}
                        id="tryout_name"
                        innerRef={ref}
                        invalid={error && true}
                        placeholder="Inputkan Nama Tryout"
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              <Controller
                control={control}
                name="start_date"
                defaultValue={new Date().toISOString()}
                render={({
                  field: { onChange, ref, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <Label className="form-label">
                      Waktu Pendaftaran Dibuka (WIB)
                    </Label>
                    <Input
                      type="datetime-local"
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
                control={control}
                name="end_date"
                defaultValue={new Date().toISOString()}
                render={({
                  field: { onChange, ref, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <Label className="form-label">
                      Waktu Pendaftaran Ditutup (WIB)
                    </Label>
                    <Input
                      type="datetime-local"
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
                name="duration"
                control={control}
                defaultValue=""
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Waktu Mengerjakan</Label>
                      <InputGroup
                        className={classnames({
                          "is-invalid": error && true,
                        })}
                      >
                        <Cleave
                          {...field}
                          options={baseNumeralOptions}
                          className={classnames("form-control", {
                            "is-invalid": error,
                          })}
                          onChange={(e) => field.onChange(e.target.rawValue)}
                          value={field.value ?? 0}
                          placeholder="Inputkan Waktu Mengerjakan"
                        />

                        <InputGroupAddon addonType="append">
                          <InputGroupText>Menit</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>

                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              <Controller
                name="max_repeat"
                control={control}
                defaultValue="1"
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Batas Mengerjakan</Label>
                      <InputGroup
                        className={classnames({
                          "is-invalid": error && true,
                        })}
                      >
                        <Cleave
                          {...field}
                          options={baseNumeralOptions}
                          className={classnames("form-control", {
                            "is-invalid": error,
                          })}
                          onChange={(e) => field.onChange(e.target.rawValue)}
                          readOnly={!start_date || !end_date}
                          value={field.value ?? 0}
                        />

                        <InputGroupAddon addonType="append">
                          <InputGroupText>Kali</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>

                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              <Controller
                name="branch_code"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill mt-1">
                      <Label className="form-label">Kode Cabang</Label>
                      <Select
                        {...field}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                        isSearchable
                        options={branchs}
                        isLoading={isFetchingBranch}
                        getOptionLabel={(option) =>
                          `${option.name} (${option.code})`
                        }
                        getOptionValue={(option) => option.code}
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
                name="instruction"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Instruksi</Label>
                      <Select
                        {...field}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                        isSearchable
                        options={instructions}
                        isLoading={isFetchingInstruction}
                        getOptionLabel={(option) => option.title}
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

              <Controller
                name="status"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, value: isActive, ...rest } = field;
                  return (
                    <>
                      <CustomInput
                        {...rest}
                        className="mt-50"
                        innerRef={ref}
                        type="switch"
                        id="status"
                        checked={isActive}
                        label={isActive ? "Aktif" : "Tidak Aktif"}
                        inline
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </>
                  );
                }}
              />
              <div className="text-right mt-4">
                <Button type="submit" color="gradient-primary">
                  <Save size={14} /> Perbarui
                </Button>
              </div>
            </Col>
          )}
        </CardBody>
      </Card>
    </Form>
  );
};

export default EditPackageTryoutFreeForm;
