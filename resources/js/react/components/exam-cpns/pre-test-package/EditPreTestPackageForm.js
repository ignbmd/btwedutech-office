import * as yup from "yup";
import { nanoid } from "nanoid";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { Fragment, useState, useEffect, useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { getLastSegment } from "../../../utility/Utils";
import {
  Col,
  Card,
  Form,
  Input,
  Label,
  Button,
  CardBody,
  FormGroup,
  InputGroup,
  CustomInput,
  FormFeedback,
  InputGroupText,
  InputGroupAddon,
} from "reactstrap";
import { Save } from "react-feather";
import MultipleInputSelect from "../../core/multiple-input-select/MultipleInputSelect";

import { baseNumeralOptions } from "../../../utility/Utils";
import "flatpickr/dist/themes/airbnb.css";
import { programs } from "../../../config/program-cpns";
import SpinnerCenter from "../../core/spinners/Spinner";
import axios from "axios";

const id = getLastSegment();
const yupLazyValidation = yup.lazy((value) => {
  switch (typeof value) {
    case "string":
      return yup.string().required("Wajib diisi");
    case "object":
      return yup.object().required("Wajib diisi");
    default:
      return yup.object().required("Wajib diisi");
  }
});

const FormSchema = yup.object().shape({
  program: yup.object().required("Wajib diisi"),
  title: yup.string().required("Wajib diisi"),
  status: yup.boolean().required("Wajib diisi"),
  input_tags: yup.string(),
  tags: yup.array().of(yup.string()),
  duration: yup
    .number()
    .moreThan(0, "Harus lebih dari 0")
    // .test('test_min', 'Tidak boleh kurang dari 0', function (value) {
    //   if (+(value) < 0) return false

    //   return true
    // })
    // .test('test_max', 'Tidak boleh lebih dari 45', function (value) {
    //   if (+(value) > 45) return false

    //   return true
    // })
    .max(45, "Tidak boleh lebih dari 45")
    .typeError("Wajib diisi")
    .required("Wajib diisi"),
  max_repeat: yup
    .number()
    .moreThan(0, "Harus lebih dari 0")
    .required("Wajib diisi")
    .typeError("Wajib diisi"),
  modul: yupLazyValidation,
  instruction: yupLazyValidation,
});

const EditPreTestPackageForm = () => {
  const [preTestPackage, setPreTestPackage] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [modules, setModules] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isCanceled = useRef(false);
  const isAlreadyLoadinstructions = useRef(false);
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
      program: { name: "SKD", slug: "skd" },
      tags: [],
    },
  });

  const { program, tags, } = watch();

  const fetchPackage = async (id) => {
    try {
      const response = await axios.get(`/api/exam-cpns/pre-test-package/${id}`);
      const data = response.data.data;
      return data ?? [];
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInstructions = async (program) => {
    try {
      const response = await axios.get(
        `/api/exam-cpns/instruction?program=${program}`,
        { cancelToken: source.token }
      );
      setInstructions(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchModules = async (program) => {
    try {
      const response = await axios.get(`/api/exam-cpns/module/program/${program}`, {
        cancelToken: source.token,
      });
      setModules(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      trigger();

      const formValues = getValues();
      const payload = {
        title: formValues.title,
        program: formValues.program.slug,
        modules_id: parseInt(formValues.modul.id),
        legacy_task_id: preTestPackage.legacy_task_id,
        duration: parseInt(formValues.duration),
        status: formValues.status,
        privacy_type: "PUBLIC",
        instructions_id: parseInt(formValues.instruction.id),
        product_code: null,
        max_repeat: parseInt(formValues.max_repeat),
        // tags: formValues.tags,
        tags: [],
      };

      const response = await axios.post(`/api/exam-cpns/pre-test-package/${id}`, {
        data: payload,
        cancelToken: source.token,
      });
      if (response.status == 200 && !isCanceled.current) showSuccessToast();
      else showErrorToast();
    } catch (error) {
      if (!isCanceled.current) console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccessToast = () => {
    toastr.success(`Paket pre-test berhasil diperbarui`, `Berhasil`, {
      timeOut: 2000,
      closeButton: true,
      tapToDismiss: true,
      preventDuplicates: true,
      onHidden() {
        window.location.href = `/ujian-cpns/paket-pre-test`;
      },
    });
  };

  const showErrorToast = () => {
    toastr.error(
      `Paket soal berhasil gagal diperbarui, silakan coba lagi nanti`,
      `Terjadi kesalahan`,
      {
        timeOut: 2000,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
      }
    );
  };

  const loadEdit = async () => {
    try {
      const data = await fetchPackage(getLastSegment());
      setPreTestPackage(data);

      setValue("title", data.title);
      setValue("status", data.status);
      setValue("max_repeat", data.max_repeat);
      setValue("duration", data.duration);
      setValue("modul", data.modules);
      setValue(
        "program",
        programs.find((program) => program.slug === data.program)
      );
      if (data?.tags?.length) setValue("tags", data?.tags);
    } catch (error) {
      console.error(error);
      setIsDataLoaded(false);
    }
  };

  useEffect(() => {
    loadEdit();
    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    if (!preTestPackage || !instructions) return;
    if (isAlreadyLoadinstructions.current === false) {
      setValue(
        "instruction",
        instructions?.find(
          (instruction) => instruction.id === preTestPackage.instructions_id
        )
      );
    }
    if(instructions.length > 0 && preTestPackage.instructions !== null){
      isAlreadyLoadinstructions.current = true;
    }
    setValue("tags", preTestPackage.tags);
    setIsDataLoaded(true);
  }, [preTestPackage, instructions]);

  useEffect(() => {
    if (isDataLoaded) setIsFetching(false);
    else setIsFetching(true);
  }, [isDataLoaded]);

  useEffect(() => {
    if (!program?.slug) return;
    setValue("instruction", "");

    fetchModules(program.slug);
    fetchInstructions(program.slug);
  }, [program?.slug]);

  return (
    <>
      {isFetching ? (
        <SpinnerCenter />
      ) : (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardBody className="pt-0">
              <Col md={6} className={classnames("pl-0")}>
                <Controller
                  name="program"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup className="flex-fill mt-1">
                        <Label className="form-label">Program</Label>
                        <Select
                          {...field}
                          onChange={(data) => {
                            field.onChange(data)
                                setValue("modul", "");
                                setValue("instruction", "");
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
                  name="title"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, value, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Judul</Label>
                        <Input
                          {...rest}
                          id="title"
                          innerRef={ref}
                          invalid={error && true}
                          placeholder="Contoh: Modul 1"
                          value={value ?? ""}
                          // onChange={(e) => field.onChange(e.target.rawValue)}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

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
                          isSearchable={false}
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
                  name="duration"
                  control={control}
                  defaultValue=""
                  render={({ field, fieldState: { error } }) => {
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
                          isSearchable={false}
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
                {/* <Controller
                  isClearable
                  control={control}
                  name="input_tags"
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup className="flex-fill">
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
                /> */}

                <Controller
                  name="status"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, value, ...rest } = field;
                    return (
                      <>
                        <CustomInput
                          {...rest}
                          className="mt-50"
                          innerRef={ref}
                          type="switch"
                          name="status"
                          id="status"
                          checked={value ?? false}
                          label={value ? "Aktif" : "Tidak Aktif"}
                          inline
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </>
                    );
                  }}
                />

                <div className="text-right mt-3">
                  <Button
                    type="submit"
                    color="gradient-primary"
                    disabled={isSubmitting}
                  >
                    <Save size={14} />{" "}
                    {isSubmitting ? "Memperbarui..." : "Perbarui"}
                  </Button>
                </div>
              </Col>
            </CardBody>
          </Card>
        </Form>
      )}
    </>
  );
};

export default EditPreTestPackageForm;
