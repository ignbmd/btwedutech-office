import React, { Fragment, useEffect, useState, useRef } from "react";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import Flatpickr from "react-flatpickr";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
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
  ToastHeader,
} from "reactstrap";
import { Copy, Plus, Save, Trash2 } from "react-feather";

import { baseNumeralOptions } from "../../../utility/Utils";
import "flatpickr/dist/themes/airbnb.css";
import { nanoid } from "nanoid";
import axios from "axios";
import { programs } from "../../../config/programs";
import MultipleInputSelect from "../../core/multiple-input-select/MultipleInputSelect";

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
  title: yup.string().required("Wajib diisi"),
  status: yup.boolean().required("Wajib diisi"),
  modul: yupLazyValidation,
});

const getEmptyForm = () => {
  return {
    id: nanoid(),
    title: "",
    status: true,
    branch_code: "PT0000",
    privacy_type: "PUBLIC",
    end_date: null,
    start_date: null,
    is_duplicated: false,
    duplicated_from_index: -1,
    tags: [],
  };
};

const CreatePostTestPackageForm = () => {
  const [instructions, setInstructions] = useState([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [modules, setModules] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const fieldSchema = yup.object().shape({
    program: yup.object().required("Wajib diisi"),
    duration: yup
      .number()
      .moreThan(0, "Harus lebih dari 0")
      .required("Wajib diisi"),
    max_repeat: yup
      .number()
      .moreThan(0, "Harus lebih dari 0")
      .required("Wajib diisi"),
    instruction: yupLazyValidation,
    sections: yup
      .array()
      .of(FormSchema)
      .required()
      .min(1, "Minimal Membuat 1 Modul Paket"),
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
    resolver: yupResolver(fieldSchema),
    defaultValues: {
      program: { name: "SKD", slug: "skd" },
      duration: 0,
      max_repeat: "5",
      instruction: "",
      sections: [getEmptyForm()],
    },
  });

  const {
    fields: sections,
    append,
    update,
    remove,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const { program } = watch();

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

  const createPostTestPackage = async (payload) => {
    try {
      const response = await axios.post(`/api/exam/post-test-package/bulk`, {
        data: payload,
        cancelToken: source.token,
      });
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);

      trigger();

      const formValues = getValues();
      const payload = [];

      formValues.sections.forEach((item) => {
        payload.push({
          title: item.title,
          program: formValues.program.slug,
          modules_id: parseInt(item.modul.id),
          duration: parseInt(formValues.duration),
          status: item.status,
          privacy_type: "PUBLIC",
          instructions_id: parseInt(formValues.instruction.id),
          product_code: null,
          max_repeat: parseInt(formValues.max_repeat),
          // tags: item.tags,
          tags: [],
        });
      });

      const response = await createPostTestPackage(payload);
      if (response.status == 201 && !isCanceled.current) showSuccessToast();
      else showErrorToast();
    } catch (error) {
      if (!isCanceled.current) {
        showErrorToast();
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewForm = () => {
    append(getEmptyForm());
  };

  const showSuccessToast = () => {
    toastr.success(`Paket post-test berhasil ditambah`, `Berhasil`, {
      timeOut: 2000,
      closeButton: true,
      tapToDismiss: true,
      preventDuplicates: true,
      onHidden() {
        window.location.href = `/ujian/paket-post-test`;
      },
    });
  };

  const showErrorToast = () => {
    toastr.error(
      `Paket soal gagal ditambah, silakan coba lagi nanti`,
      `Terjadi kesalahan`,
      {
        timeOut: 2000,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
      }
    );
  };

  const handleDuplicateForm = (duplicateIndex) => {
    const { sections } = getValues();
    const duplicateForm = { ...sections[duplicateIndex] };
    duplicateForm.id = nanoid();
    duplicateForm.form_action = false;
    duplicateForm.is_duplicated = true;
    duplicateForm.duplicated_from_index = duplicateIndex;
    append(duplicateForm);
  };

  useEffect(() => {
    if (!program?.slug) return;
    setValue("instruction", "");
    sections.forEach((element, index) => {
      setValue(`sections.${index}.modul`, "");
    });
    fetchInstructions(program.slug);
    fetchModules(program.slug);
  }, [program?.slug]);

  useEffect(() => {
    return () => {
      isCanceled.current = true;
    };
  }, []);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Card className="bg-light-success">
        <CardHeader className="py-0">
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
                        className={classnames("form-control bg-white", {
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
                        className={classnames("form-control bg-white", {
                          "is-invalid": error,
                        })}
                        onChange={(e) => field.onChange(e.target.rawValue)}
                        value={field.value ?? 0}
                        placeholder="Inputkan Batas Mengerjakan"
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
          </Col>
        </CardHeader>
      </Card>
      <Card>
        <CardBody>
          {sections.map((section, index) => (
            <Fragment key={section.id}>
              <div className="content-header">
                <h5 className="mb-0 text-primary font-weight-bolder">
                  #{index + 1}
                </h5>
                <small className="text-muted">
                  Buat modul dari paket pre-test
                </small>
              </div>
              <Col md={6} className={classnames("mt-2 pl-0")}>
                <Controller
                  name={`sections.${index}.title`}
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Nama Modul</Label>
                        <Input
                          {...rest}
                          id="title"
                          innerRef={ref}
                          invalid={error && true}
                          placeholder="Contoh: Modul 1"
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />

                <Controller
                  name={`sections.${index}.modul`}
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
                          classNamePrefix="select"
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.id}
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
                    <FormGroup className="flex-fill mt-50">
                      <Label>
                        Tag <small>(Opsional)</small>
                      </Label>
                      <MultipleInputSelect
                        setValue={setValue}
                        fieldName={field.name}
                        valueName={`sections.${index}.tags`}
                        defaultValue={
                          section.is_duplicated
                            ? sections[section.duplicated_from_index].tags
                            : []
                        }
                        // valueName="tags"
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
                  name={`sections.${index}.status`}
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
                          id={`sections.${index}.status`}
                          checked={isActive}
                          label={isActive ? "Aktif" : "Tidak Aktif"}
                          inline
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </>
                    );
                  }}
                />
              </Col>
              {/* Add & Remove Button */}
              <div className="d-flex mt-2 justify-content-end align-items-center">
                {sections.length > 1 ? (
                  <Button
                    size="md"
                    color="danger"
                    className="mr-1"
                    onClick={() => remove(index)}
                  >
                    <Trash2 size={14} /> Hapus Formulir
                  </Button>
                ) : null}
                <Controller
                  name={`sections.${index}.form_action`}
                  control={control}
                  defaultValue={false}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, value: isActive, ...rest } = field;
                    return (
                      <ButtonDropdown
                        isOpen={isActive}
                        toggle={() => field.onChange(!isActive)}
                      >
                        <DropdownToggle color="primary" caret>
                          <Plus size={14} /> Tambah Formulir
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem
                            onClick={handleAddNewForm}
                            className="w-100"
                          >
                            Buat Formulir Baru
                          </DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem
                            onClick={() => handleDuplicateForm(index)}
                            className="w-100"
                          >
                            <Copy size={14} /> Duplikat Formulir
                          </DropdownItem>
                        </DropdownMenu>
                      </ButtonDropdown>
                    );
                  }}
                />
              </div>
              {sections.length !== index + 1 ? (
                <hr className="my-3 mx-n2 border-primary" />
              ) : null}
              {/* End Add & Remove Button */}
            </Fragment>
          ))}
        </CardBody>

        <div className={classnames("bg-light-success text-right mt-3 p-2")}>
          <Button
            type="submit"
            color="gradient-success"
            disabled={isSubmitting}
          >
            <Save size={14} /> {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </Card>
    </Form>
  );
};

export default CreatePostTestPackageForm;
