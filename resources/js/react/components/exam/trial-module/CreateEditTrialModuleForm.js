import * as yup from "yup";
import { nanoid } from "nanoid";
import Select from "react-select";
import PropTypes from "prop-types";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { Fragment, useState, useEffect, useRef } from "react";
import Flatpickr from "react-flatpickr";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
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
  ButtonGroup,
  DropdownItem,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
} from "reactstrap";
import { Copy, Plus, Save, Trash2 } from "react-feather";
import { programs } from "../../../config/programs";
import {
  baseNumeralOptions,
  getLastSegment,
  showToast,
} from "../../../utility/Utils";
import "flatpickr/dist/themes/airbnb.css";
import axios from "axios";
import moment from "moment-timezone";
import SpinnerCenter from "../../core/spinners/Spinner";
import MultipleInputSelect from "../../core/multiple-input-select/MultipleInputSelect";

const CreateEditTrialModuleForm = ({ type }) => {
  const [modules, setModules] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [trialModule, setTrialModule] = useState(null);
  const [isLoading, setIsLoading] = useState(type === "edit");
  const [isSubmitting, setIsSubmiting] = useState(false);
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const FormSchema = yup.object().shape({
    program:
      type === "edit"
        ? yup.object().notRequired().nullable()
        : yup.object().required("Harus diisi").typeError("Harus diisi"),
    modul: yup.object().required("Harus diisi").typeError("Harus diisi"),
    instruction: yup.object().required("Harus diisi").typeError("Harus diisi"),
    tags: yup.array().of(yup.string()),
    duration: yup
      .number()
      .min(1, "Tidak boleh 0 atau kurang")
      .max(150, "Tidak boleh lebih dari 150 menit")
      .required("Harus diisi")
      .typeError("Harus diisi"),
  });

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
      program: { name: "SKD", slug: "skd" },
      tags: [],
    },
  });
  const { program, tags } = watch();

  const fetchInstructions = async (program) => {
    try {
      const response = await axios.get(`/api/exam/instruction/${program}`, {
        cancelToken: source.token,
      });
      setInstructions(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchModules = async (program) => {
    try {
      const response = await axios.get(`/api/exam/module/program/${program}`, {
        cancelToken: source.token,
      });
      setModules(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createTrialModule = async () => {
    try {
      setIsSubmiting(true);
      const payload = getPayload();
      const response = await axios.post("/api/exam/trial-module", payload);
      if (response.data.success) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data coba modul berhasil ditambah",
        });
      }
      window.location.href = "/ujian/coba-modul";
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Terjadi kesalahan",
        message:
          error.response.status === 400
            ? error.response.data.message
            : "Proses gagal, silakan coba lagi nanti",
      });
      setIsSubmiting(false);
    }
  };

  const updateTrialModule = async (id) => {
    try {
      setIsSubmiting(true);
      const payload = getPayload();
      const response = await axios.put(`/api/exam/trial-module/${id}`, payload);
      if (response.data.success) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data coba modul berhasil diperbarui",
        });
      }
      window.location.href = "/ujian/coba-modul";
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Terjadi kesalahan",
        message:
          error.response.status === 400
            ? error.response.data.message
            : "Proses gagal, silakan coba lagi nanti",
      });
      setIsSubmiting(false);
    }
  };

  const fetchTrialModule = async (id) => {
    try {
      const response = await axios.get(`/api/exam/trial-module/${id}`, {
        cancelToken: source.token,
      });
      setTrialModule(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getPayload = () => {
    const values = getValues();
    const payload = {
      program: values?.program?.slug,
      modules_id: values.modul.id,
      instructions_id: values.instruction.id,
      duration: parseInt(values.duration),
      tags: values.tags,
      module_name: values.modul.name,
      module_code: values.modul.module_code,
    };
    if (type === "edit") {
      delete payload.program;
      delete payload.module_name;
      delete payload.module_code;
    }
    return payload;
  };

  const onSubmit = () => {
    trigger();
    if (type === "create") {
      createTrialModule();
    } else {
      updateTrialModule(getLastSegment());
    }
  };

  const loadFormValues = () => {
    setValue(
      "program",
      programs.find((program) => trialModule?.program === program.slug)
    );
    setValue(
      "modul",
      modules.find((modul) => trialModule?.modules_id === modul.id)
    );
    setValue(
      "instruction",
      instructions.find(
        (instruction) => trialModule?.instructions_id === instruction.id
      )
    );
    setValue("duration", trialModule?.duration);
    setValue("tags", trialModule?.tags);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (type === "edit") {
      fetchTrialModule(getLastSegment());
    }
  }, []);

  useEffect(() => {
    if (!trialModule || !modules.length || !instructions.length) return;
    loadFormValues();
  }, [trialModule, modules, instructions]);

  useEffect(() => {
    if (!program.slug) return;
    setValue("modul", "");
    setValue("instruction", "");
    fetchModules(program.slug);
    fetchInstructions(program.slug);
  }, [program?.slug]);

  return isLoading ? (
    <SpinnerCenter />
  ) : (
    <Form
      className={classnames(isSubmitting && "block-content")}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Card className="bg-light-success"></Card>
      <Card>
        <CardBody>
          <Col md={6} className={classnames("pl-0")}>
            {type === "create" ? (
              <Controller
                name="program"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Program</Label>
                      <Select
                        {...field}
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
            ) : null}
            <Controller
              name="modul"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill">
                    <Label className="form-label">Pilih Modul</Label>
                    <Select
                      {...field}
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isSearchable={true}
                      options={modules}
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
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isSearchable={true}
                      options={instructions}
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
              isClearable
              control={control}
              name="input_tags"
              render={({ field, fieldState: { error } }) => (
                <FormGroup className="mt-1">
                  <Label>
                    Tag <small>(Opsional)</small>
                  </Label>
                  <MultipleInputSelect
                    setValue={setValue}
                    fieldName={field.name}
                    defaultValue={tags}
                    valueName="tags"
                    currentValue={field.value}
                    changeHandler={field.onChange}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                  <small>
                    Gunakan simbol koma (,) untuk penginputan lebih dari 1
                  </small>
                </FormGroup>
              )}
            />
            <div className={classnames("text-right")}>
              {type === "create" ? (
                <Button type="submit" color="gradient-success">
                  <Save size={14} /> Simpan
                </Button>
              ) : (
                <Button type="submit" color="gradient-primary">
                  <Save size={14} /> Perbarui
                </Button>
              )}
            </div>
          </Col>
        </CardBody>
      </Card>
    </Form>
  );
};

CreateEditTrialModuleForm.propTypes = {
  type: PropTypes.oneOf(["create", "edit"]),
};

export default CreateEditTrialModuleForm;
