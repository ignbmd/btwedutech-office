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
import { programs } from "../../../config/program-cpns";
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
    package_type: "PREMIUM_TRYOUT",
    privacy_type: "PUBLIC",
    end_date: null,
    start_date: null,
    is_duplicated: false,
    duplicated_from_index: -1,
    tags: [],
  };
};

const CreateEditTryoutPremiumForm = ({ type }) => {
  const [products, setProducts] = useState([]);
  const [modules, setModules] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [tryout, setTryout] = useState(null);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isFetchingModules, setIsFetchingModules] = useState(false);
  const [isFetchingInstructions, setIsFetchingInstructions] = useState(false);
  const [isLoading, setIsLoading] = useState(type === "edit");
  const [isSubmitting, setIsSubmiting] = useState(false);
  const isCanceled = useRef(false);
  const isLoaded = useRef(false);
  const source = axios.CancelToken.source();

  const fieldSchema = yup.object().shape({
    program: yup.object().required("Wajib diisi"),
    product: yup.mixed().notRequired().optional(),
    duration: yup
      .number()
      .moreThan(0, "Harus lebih dari 0")
      .max(240, "Maksimal 240 menit")
      .typeError("Wajib diisi")
      .required("Wajib diisi"),
    instruction: yupLazyValidation,
    sections: yup
      .array()
      .of(FormSchema)
      .required()
      .min(1, "Minimal Membuat 1 Gelombang"),
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
      program: type === "edit" ? {} : { name: "SKD", slug: "skd" },
      duration: 0,
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

  const { program, sections: watchedSections } = watch();

  const fetchProducts = async (program) => {
    try {
      setIsFetchingProducts(true);
      const response = await axios.get(
        `/api/product/tryout-premium/${
          program == "tps-2022" ? "tps" : program
        }/options/v2`,
        {
          cancelToken: source.token,
        }
      );
      const data = await response.data;
      setProducts(data?.data ?? []);
    } catch (error) {
      console.error(error);
      return;
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const fetchInstructions = async (program) => {
    try {
      setIsFetchingInstructions(true);
      const response = await axios.get(
        `/api/exam-cpns/instruction/${program == "tps-2022" ? "tps" : program}`,
        {
          cancelToken: source.token,
        }
      );
      setInstructions(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingInstructions(false);
    }
  };

  const fetchModules = async (program) => {
    try {
      setIsFetchingModules(true);
      const response = await axios.get(
        `/api/exam-cpns/module/program/${
          program == "tps-2022" ? "tps" : program
        }`,
        {
          cancelToken: source.token,
        }
      );
      setModules(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingModules(false);
    }
  };

  const createTryoutPremium = async () => {
    try {
      setIsSubmiting(true);
      const payload = getPayload();
      const response = await axios.post(
        "/api/exam-cpns/tryout-premium",
        payload
      );
      if (response.data.success) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data tryout premium berhasil ditambah",
        });
        window.location.href = "/ujian-cpns/tryout-premium";
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Terjadi kesalahan",
        message:
          error.response.status === 400 || error.response.status === 422
            ? error.response.data.message ?? error.response.message
            : "Proses gagal, silakan coba lagi nanti",
      });
      setIsSubmiting(false);
    }
  };

  const updateTryoutPremium = async (id) => {
    try {
      setIsSubmiting(true);
      const payload = getPayload();
      const response = await axios.put(
        `/api/exam-cpns/tryout-premium/${id}`,
        payload
      );
      if (response.data.success) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data tryout premium berhasil diperbarui",
        });
        window.location.href = "/ujian-cpns/tryout-premium";
      }
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Terjadi kesalahan",
        message:
          error.response.status === 400 || error.response.status === 422
            ? error.response.data.message ?? error.response.message
            : "Proses gagal, silakan coba lagi nanti",
      });
      setIsSubmiting(false);
    }
  };

  const fetchPremiumTryout = async (id) => {
    try {
      const response = await axios.get(`/api/exam-cpns/tryout-premium/${id}`, {
        cancelToken: source.token,
      });
      setTryout(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getPayload = () => {
    const values = getValues();
    if (type === "create") {
      const payload = values.sections.map((value) => {
        const payloadObj = {
          title: value.title,
          branch_code: value.branch_code,
          program: values.program.slug,
          product_code: values?.product?.product_code ?? null,
          duration: parseInt(values.duration),
          status: value.status,
          modules_id: value.modul.id,
          modules_code: value.modul.module_code,
          instructions_id: values.instruction.id,
          privacy_type: value.privacy_type,
          start_date: null,
          end_date: null,
          tags: value?.tags ?? null,
        };
        return payloadObj;
      });
      return payload;
    } else {
      const payload = values.sections.map((value) => {
        const payloadObj = {
          title: value.title,
          branch_code: value.branch_code,
          program: values.program.slug,
          legacy_task_id: tryout?.legacy_task_id,
          product_code: values?.product?.product_code ?? null,
          duration: parseInt(values.duration),
          status: value.status,
          start_date: null,
          modules_id: value.modul.id,
          modules_code: value.modul.module_code,
          instructions_id: values.instruction.id,
          end_date: null,
          privacy_type: value.privacy_type,
          tags: value?.tags ?? null,
        };
        return payloadObj;
      });
      return payload[0];
    }
  };

  const onSubmit = () => {
    trigger();
    if (type === "create") {
      createTryoutPremium();
    } else {
      updateTryoutPremium(getLastSegment());
    }
  };

  const handleAddNewForm = () => {
    append(getEmptyForm());
  };

  const loadFormValues = () => {
    setValue(
      "program",
      programs.find((program) => tryout?.program === program.slug)
    );
    setValue("duration", tryout?.duration);
    setValue("sections.0.title", tryout?.title);
    setValue("sections.0.status", tryout?.status);
    setValue("sections.0.tags", tryout?.tags);
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
    if (type === "edit") {
      fetchPremiumTryout(getLastSegment());
    }
  }, []);

  useEffect(() => {
    if (!tryout) return;
    if (type === "edit" && isLoading) {
      loadFormValues();
    }
  }, [tryout]);

  useEffect(() => {
    if (!tryout || !products.length || !instructions.length || !modules.length)
      return;
    if (!isLoaded.current && type === "edit") {
      setValue(
        "product",
        products.find((product) => product.product_code === tryout.product_code)
      );
      setValue(
        "instruction",
        instructions.find(
          (instruction) => instruction.id === tryout.instructions_id
        )
      );
      setValue(
        "sections.0.modul",
        modules.find((modul) => tryout?.modules_id === modul.id)
      );
      isLoaded.current = true;
      setIsLoading(false);
    }
  }, [products, instructions, modules]);

  useEffect(() => {
    if (!program.slug) return;
    setValue("product", "");
    setValue("instruction", "");
    sections.forEach((element, index) => {
      setValue(`sections.${index}.modul`, "");
    });
    fetchProducts(program.slug);
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
      <Card>
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
              name="product"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                  <FormGroup className="flex-fill mt-1">
                    <Label className="form-label font-weight-bolder">
                      Pilih Produk (Opsional)
                    </Label>
                    <Select
                      {...field}
                      isSearchable={true}
                      options={products}
                      isDisabled={isFetchingProducts}
                      isLoading={isFetchingProducts}
                      isClearable={true}
                      placeholder="Select product"
                      getOptionLabel={(option) =>
                        `${option.title} (${option.product_code})`
                      }
                      getOptionValue={(option) => option.product_code}
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
                      isDisabled={isFetchingInstructions}
                      isLoading={isFetchingInstructions}
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
              {/* {type === "create" && (
                <div className="content-header">
                  <h5 className="mb-0 text-primary font-weight-bolder">
                    #{index + 1}
                  </h5>
                  <small className="text-muted">
                    Buat tryout premium
                  </small>
                </div>
              )} */}
              <Col md={6} className={classnames("mt-2 pl-0")}>
                <Controller
                  name={`sections.${index}.title`}
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Nama Tryout</Label>
                        <Input
                          {...rest}
                          id="title"
                          innerRef={ref}
                          invalid={error && true}
                          placeholder="Contoh: Tryout Premium 1"
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
                          isDisabled={isFetchingModules}
                          isLoading={isFetchingModules}
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

                <Controller
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
                          type === "edit"
                            ? watchedSections[0].tags
                            : type === "create" && section.is_duplicated
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
                />

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
              {/* <div className="d-flex mt-2 justify-content-end align-items-center">
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
                {type === "create" && (
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
                )}
              </div>
              {sections.length !== index + 1 ? (
                <hr className="my-3 mx-n2 border-primary" />
              ) : null} */}
              {/* End Add & Remove Button */}
            </Fragment>
          ))}
        </CardBody>

        <div
          className={classnames(
            "text-right mt-3 p-2",
            type === "create" ? "bg-light-success" : "bg-light-primary"
          )}
        >
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
      </Card>
    </Form>
  );
};

CreateEditTryoutPremiumForm.propTypes = {
  type: PropTypes.oneOf(["create", "edit"]),
};

export default CreateEditTryoutPremiumForm;

// import * as yup from "yup";
// import { nanoid } from "nanoid";
// import Select from "react-select";
// import PropTypes from "prop-types";
// import classnames from "classnames";
// import Cleave from "cleave.js/react";
// import React, { Fragment, useState, useEffect, useRef } from "react";
// import Flatpickr from "react-flatpickr";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { Controller, useFieldArray, useForm } from "react-hook-form";
// import {
//   Button,
//   Card,
//   CardBody,
//   CardHeader,
//   CardTitle,
//   Col,
//   CustomInput,
//   Form,
//   FormFeedback,
//   FormGroup,
//   Input,
//   InputGroup,
//   InputGroupAddon,
//   InputGroupText,
//   Badge,
//   Label,
//   ButtonGroup,
//   DropdownItem,
//   ButtonDropdown,
//   DropdownToggle,
//   DropdownMenu,
// } from "reactstrap";
// import { Copy, Plus, Save, Trash2 } from "react-feather";
// import { programs } from "../../../config/programs";
// import {
//   baseNumeralOptions,
//   getLastSegment,
//   showToast,
// } from "../../../utility/Utils";
// import "flatpickr/dist/themes/airbnb.css";
// import axios from "axios";
// import moment from "moment-timezone";
// import SpinnerCenter from "../../core/spinners/Spinner";

// const FormSchema = yup.object().shape({
//   tryout_name: yup.string().required("Wajib diisi"),
//   start_date: yup.string().required("Wajib diisi"),
//   end_date: yup.string().required("Wajib diisi"),
//   duration: yup
//     .number()
//     .max("150", "Tidak boleh melebihi 150 menit")
//     .typeError("Wajib diisi")
//     .required("Wajib diisi"),
//   // max_repeat: yup.string().required("Wajib diisi"),
//   status: yup.boolean().required("Wajib diisi"),
//   branch_code: yup.string().required("Wajib diisi"),
//   modul: yup.object().typeError("Wajib diisi").required("Wajib diisi"),
//   instruction: yup.object().typeError("Wajib diisi").required("Wajib diisi"),
//   cluster_title: yup.string().required("Wajib diisi"),
//   max_capacity: yup.string().required("Wajib diisi"),
//   start_datetime: yup.string().required("Wajib diisi"),
//   end_datetime: yup.string().required("Wajib diisi"),
//   cluster_status: yup.string().required("Wajib diisi"),
// });

// const dateObj = new Date();
// const tryoutStartDate = new Date(
//   `${dateObj.getFullYear()}-${
//     dateObj.getMonth() + 1
//   }-${dateObj.getDate()} 00:00:00`
// );
// const tryoutEndDate = new Date(
//   `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${
//     dateObj.getDate() + 1
//   } 00:00:00`
// );
// const clusterStartDate = new Date(
//   `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${
//     dateObj.getDate() + 2
//   } 00:00:00`
// );
// const clusterEndDate = new Date(
//   `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${
//     dateObj.getDate() + 3
//   } 00:00:00`
// );

// programs.push({
//   name: "TPS 2022",
//   slug: "tps-2022",
// });

// const getEmptyForm = () => {
//   return {
//     id: nanoid(),
//     tryout_name: "",
//     start_date: tryoutStartDate.toISOString(),
//     end_date: tryoutEndDate.toISOString(),
//     duration: "",
//     max_repeat: "1",
//     status: true,
//     branch_code: "PT0000",
//     instruction: "",
//     cluster_title: "",
//     package_type: "PREMIUM_TRYOUT",
//     package_type: "PUBLIC",
//     max_capacity: "0",
//     start_datetime: clusterStartDate.toISOString(),
//     end_datetime: null,
//     cluster_status: true,
//   };
// };

// const CreateEditTryoutPremiumForm = ({ type }) => {
//   const [products, setProducts] = useState([]);
//   const [modules, setModules] = useState([]);
//   const [instructions, setInstructions] = useState([]);
//   const [tryout, setTryout] = useState(null);
//   const [isLoading, setIsLoading] = useState(type === "edit");
//   const [isSubmitting, setIsSubmiting] = useState(false);
//   const isCanceled = useRef(false);
//   const source = axios.CancelToken.source();

//   const fieldSchema = yup.object().shape({
//     product: yup.object().typeError("Wajib diisi").required("Wajib diisi"),
//     program: yup.object().typeError("Wajib diisi").required("Wajib diisi"),
//     sections: yup
//       .array()
//       .of(FormSchema)
//       .required()
//       .min(1, "Minimal Membuat 1 Gelombang"),
//   });

//   const {
//     watch,
//     control,
//     trigger,
//     setValue,
//     getValues,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(fieldSchema),
//     defaultValues: {
//       program: { name: "SKD", slug: "skd" },
//       sections: [getEmptyForm()],
//     },
//   });

//   const {
//     fields: sections,
//     append,
//     update,
//     remove,
//   } = useFieldArray({
//     control,
//     name: "sections",
//   });

//   const { program, sections: watchedSections } = watch();

//   const fetchProducts = async (program) => {
//     try {
//       const response = await axios.get(
//         `/api/product/tryout-premium/${
//           program == "tps-2022" ? "tps" : program
//         }/options`
//       );
//       const data = await response.data;
//       setProducts(data?.data ?? []);
//     } catch (error) {
//       console.error(error);
//       return;
//     }
//   };

//   const fetchInstructions = async (program) => {
//     try {
//       const response = await axios.get(
//         `/api/exam/instruction/${program == "tps-2022" ? "tps" : program}`,
//         {
//           cancelToken: source.token,
//         }
//       );
//       setInstructions(response.data.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const fetchModules = async (program) => {
//     try {
//       const response = await axios.get(
//         `/api/exam/module/program/${program == "tps-2022" ? "tps" : program}`,
//         {
//           cancelToken: source.token,
//         }
//       );
//       setModules(response.data.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const createTryoutPremium = async () => {
//     try {
//       setIsSubmiting(true);
//       const payload = getPayload();
//       const response = await axios.post("/api/exam/tryout-premium", payload);
//       if (response.data.success) {
//         showToast({
//           type: "success",
//           title: "Berhasil",
//           message: "Data tryout premium berhasil ditambah",
//         });
//         window.location.href = "/ujian/tryout-premium";
//       }
//     } catch (error) {
//       showToast({
//         type: "error",
//         title: "Terjadi kesalahan",
//         message:
//           error.response.status === 400 || error.response.status === 422
//             ? error.response.data.message ?? error.response.message
//             : "Proses gagal, silakan coba lagi nanti",
//       });
//       setIsSubmiting(false);
//     }
//   };

//   const updateTryoutPremium = async (id) => {
//     try {
//       setIsSubmiting(true);
//       const payload = getPayload();
//       const response = await axios.put(
//         `/api/exam/tryout-premium/${id}`,
//         payload
//       );
//       if (response.data.success) {
//         showToast({
//           type: "success",
//           title: "Berhasil",
//           message: "Data tryout premium berhasil diperbarui",
//         });
//         window.location.href = "/ujian/tryout-premium";
//       }
//     } catch (error) {
//       console.error(error);
//       showToast({
//         type: "error",
//         title: "Terjadi kesalahan",
//         message:
//           error.response.status === 400 || error.response.status === 422
//             ? error.response.data.message ?? error.response.message
//             : "Proses gagal, silakan coba lagi nanti",
//       });
//       setIsSubmiting(false);
//     }
//   };

//   const fetchPremiumTryout = async (id) => {
//     try {
//       const response = await axios.get(`/api/exam/tryout-premium/${id}`, {
//         cancelToken: source.token,
//       });
//       setTryout(response.data.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const getPayload = () => {
//     const values = getValues();
//     if (type === "create") {
//       const payload = values.sections.map((value) => {
//         const payloadObj = {
//           title: value.tryout_name,
//           branch_code: value.branch_code,
//           program: values.program.slug,
//           product_code: values.product.product_code,
//           duration: parseInt(value.duration),
//           status: value.status,
//           start_date: value.start_date,
//           modules_id: value.modul.id,
//           modules_code: value.modul.module_code,
//           instructions_id: value.instruction.id,
//           privacy_type: value.package_type,
//           end_date: value.end_date,
//           cluster_data: [
//             {
//               title: value.cluster_title,
//               max_capacity: parseInt(value.max_capacity),
//               status: value.cluster_status,
//               start_datetime: value.start_datetime,
//               end_datetime: value.end_datetime,
//             },
//           ],
//         };
//         return payloadObj;
//       });
//       return payload;
//     } else {
//       const payload = values.sections.map((value) => {
//         const payloadObj = {
//           title: value.tryout_name,
//           branch_code: value.branch_code,
//           program: values.program.slug,
//           legacy_task_id: tryout?.legacy_task_id,
//           product_code: values.product.product_code,
//           duration: parseInt(value.duration),
//           status: value.status,
//           start_date: value.start_date,
//           modules_id: value.modul.id,
//           modules_code: value.modul.module_code,
//           instructions_id: value.instruction.id,
//           privacy_type: value.package_type,
//           end_date: value.end_date,
//           cluster_data: [
//             {
//               id: tryout?.tryout_clusters[0].id,
//               title: value.cluster_title,
//               max_capacity: parseInt(value.max_capacity),
//               status: value.cluster_status,
//               start_datetime: value.start_datetime,
//               end_datetime: value.end_datetime,
//             },
//           ],
//         };
//         return payloadObj;
//       });
//       return payload[0];
//     }
//   };

//   const onSubmit = () => {
//     trigger();
//     if (type === "create") {
//       createTryoutPremium();
//     } else {
//       updateTryoutPremium(getLastSegment());
//     }
//   };

//   const handleAddNewForm = () => {
//     append(getEmptyForm());
//   };

//   const loadFormValues = () => {
//     setValue(
//       "program",
//       programs.find((program) => tryout?.program === program.slug)
//     );
//     setValue(
//       "product",
//       products.find((value) => tryout?.product_code === value.product_code)
//     );
//     setValue(
//       "sections.0.start_date",
//       moment.utc(tryout?.start_date).subtract(1, "hour").toISOString()
//     );
//     setValue(
//       "sections.0.end_date",
//       moment.utc(tryout?.end_date).subtract(1, "hour").toISOString()
//     );
//     setValue("sections.0.tryout_name", tryout?.title);
//     setValue("sections.0.duration", tryout?.duration);
//     setValue(
//       "sections.0.modul",
//       modules.find((modul) => tryout?.modules_id === modul.id)
//     );
//     setValue(
//       "sections.0.instruction",
//       instructions.find(
//         (instruction) => tryout?.instructions_id === instruction.id
//       )
//     );
//     setValue("sections.0.cluster_title", tryout?.tryout_clusters[0]?.title);
//     setValue("sections.0.status", tryout?.status);
//     setValue("sections.0.cluster_status", tryout?.tryout_clusters[0]?.status);
//     setValue(
//       "sections.0.start_datetime",
//       moment
//         .utc(tryout?.tryout_clusters[0]?.start_datetime)
//         .subtract(1, "hour")
//         .toISOString()
//     );
//     setValue(
//       "sections.0.end_datetime",
//       moment
//         .utc(tryout?.tryout_clusters[0]?.end_datetime)
//         .subtract(1, "hour")
//         .toISOString()
//     );
//     setValue(
//       "sections.0.max_capacity",
//       tryout?.tryout_clusters[0]?.max_capacity
//     );
//     setIsLoading(false);
//   };

//   const handleDuplicateForm = (duplicateIndex) => {
//     const { sections } = getValues();
//     const duplicateForm = { ...sections[duplicateIndex] };
//     duplicateForm.id = nanoid();
//     append(duplicateForm);
//   };

//   useEffect(() => {
//     if (type === "edit") {
//       fetchPremiumTryout(getLastSegment());
//     }
//   }, []);

//   useEffect(() => {
//     if (!tryout || !products.length || !modules.length || !instructions.length)
//       return;
//     loadFormValues();
//   }, [tryout, products, modules, instructions]);

//   useEffect(() => {
//     if (!program.slug) return;
//     setValue("product", "");
//     sections.forEach((element, index) => {
//       setValue(`sections.${index}.modul`, "");
//       setValue(`sections.${index}.instruction`, "");
//     });
//     fetchProducts(program.slug);
//     fetchModules(program.slug);
//     fetchInstructions(program.slug);
//   }, [program?.slug]);

//   useEffect(() => {
//     if (!parseInt(watchedSections[0].duration)) {
//       setValue("sections.0.end_datetime", null);
//       return;
//     }
//     setValue(
//       "sections.0.end_datetime",
//       moment
//         .utc(watchedSections[0].start_datetime)
//         .add(watchedSections[0].duration, "minute")
//         .toISOString()
//     );
//   }, [watchedSections[0].start_datetime, watchedSections[0].duration]);

//   return isLoading ? (
//     <SpinnerCenter />
//   ) : (
//     <Form
//       className={classnames(isSubmitting && "block-content")}
//       onSubmit={handleSubmit(onSubmit)}
//     >
//       <Card className="bg-light-success">
//         <CardHeader className="py-0">
//           <Col md={6} className={classnames("pl-0")}>
//             <Controller
//               name="program"
//               control={control}
//               render={({ field, fieldState: { error } }) => {
//                 return (
//                   <FormGroup className="flex-fill mt-1">
//                     <Label className="form-label">Program</Label>
//                     <Select
//                       {...field}
//                       isSearchable={false}
//                       options={programs}
//                       getOptionLabel={(option) => option.name}
//                       getOptionValue={(option) => option.slug}
//                       classNamePrefix="select"
//                       className={classnames("react-select", {
//                         "is-invalid": error && true,
//                       })}
//                     />
//                     <FormFeedback>{error?.message}</FormFeedback>
//                   </FormGroup>
//                 );
//               }}
//             />

//             <Controller
//               name="product"
//               control={control}
//               render={({ field, fieldState: { error } }) => {
//                 return (
//                   <FormGroup className="flex-fill mt-1">
//                     <Label className="form-label font-weight-bolder">
//                       Pilih Produk
//                     </Label>
//                     <Select
//                       {...field}
//                       isSearchable={true}
//                       options={products}
//                       placeholder="Select product"
//                       getOptionLabel={(option) => option.title}
//                       getOptionValue={(option) => option.product_code}
//                       classNamePrefix="select"
//                       className={classnames("react-select", {
//                         "is-invalid": error && true,
//                       })}
//                     />
//                     <FormFeedback>{error?.message}</FormFeedback>
//                   </FormGroup>
//                 );
//               }}
//             />
//           </Col>
//         </CardHeader>
//       </Card>
//       <Card>
//         <CardBody>
//           {sections.map((section, index) => (
//             <Fragment key={section.id}>
//               <div className="content-header">
//                 <h5 className="mb-0 text-primary font-weight-bolder">
//                   {/* Gelombang {type === "create" && `#${index + 1}`} */}
//                   Gelombang
//                 </h5>
//                 <small className="text-muted">
//                   {/* {type === "create"
//                     ? `Buat gelombang ${index + 1} dari tryout premium`
//                     : "Edit gelombang tryout premium"} */}
//                   {type === "create"
//                     ? `Buat gelombang tryout premium`
//                     : "Edit gelombang tryout premium"}
//                 </small>
//               </div>
//               <Col md={6} className={classnames("mt-2 pl-0")}>
//                 <Controller
//                   name={`sections.${index}.tryout_name`}
//                   control={control}
//                   render={({ field, fieldState: { error } }) => {
//                     const { ref, ...rest } = field;
//                     return (
//                       <FormGroup className="flex-fill">
//                         <Label className="form-label">Nama Gelombang</Label>
//                         <Input
//                           {...rest}
//                           id="tryout_name"
//                           innerRef={ref}
//                           invalid={error && true}
//                           placeholder="Inputkan Nama Tryout"
//                         />
//                         <FormFeedback>{error?.message}</FormFeedback>
//                       </FormGroup>
//                     );
//                   }}
//                 />

//                 <Controller
//                   control={control}
//                   name={`sections.${index}.start_date`}
//                   defaultValue={tryoutStartDate.toISOString()}
//                   render={({
//                     field: { onChange, ref, value },
//                     fieldState: { error },
//                   }) => (
//                     <FormGroup>
//                       <Label className="form-label">
//                         Tanggal Pendaftaran Dibuka (WIB)
//                       </Label>
//                       <Flatpickr
//                         className={classnames("form-control", {
//                           "is-invalid": error,
//                         })}
//                         ref={ref}
//                         value={value}
//                         data-enable-time
//                         options={{
//                           time_24hr: true,
//                           altInput: true,
//                           altFormat: "d-m-Y   H:i",
//                           dateFormat: "Y-m-d",
//                         }}
//                         onChange={(date) => {
//                           onChange(moment.utc(date[0]).toISOString());
//                         }}
//                       />
//                       <FormFeedback>{error?.message}</FormFeedback>
//                     </FormGroup>
//                   )}
//                 />

//                 <Controller
//                   control={control}
//                   name={`sections.${index}.end_date`}
//                   defaultValue={tryoutEndDate.toISOString()}
//                   render={({
//                     field: { onChange, ref, value },
//                     fieldState: { error },
//                   }) => (
//                     <FormGroup>
//                       <Label className="form-label">
//                         Tanggal Pendaftaran Ditutup (WIB)
//                       </Label>
//                       <Flatpickr
//                         className={classnames("form-control", {
//                           "is-invalid": error,
//                         })}
//                         ref={ref}
//                         value={value}
//                         data-enable-time
//                         options={{
//                           time_24hr: true,
//                           altInput: true,
//                           altFormat: "d-m-Y   H:i",
//                           dateFormat: "Y-m-d",
//                         }}
//                         onChange={(date) => {
//                           onChange(moment.utc(date[0]).toISOString());
//                         }}
//                       />
//                       <FormFeedback>{error?.message}</FormFeedback>
//                     </FormGroup>
//                   )}
//                 />

//                 <Controller
//                   name={`sections.${index}.modul`}
//                   control={control}
//                   render={({ field, fieldState: { error } }) => {
//                     return (
//                       <FormGroup className="flex-fill">
//                         <Label className="form-label">Pilih Modul</Label>
//                         <Select
//                           {...field}
//                           styles={{
//                             menu: (provided) => ({ ...provided, zIndex: 9999 }),
//                           }}
//                           isSearchable={true}
//                           options={modules}
//                           getOptionLabel={(option) =>
//                             `${option.name} (${option.module_code})`
//                           }
//                           getOptionValue={(option) => option.id}
//                           classNamePrefix="select"
//                           className={classnames("react-select", {
//                             "is-invalid": error && true,
//                           })}
//                         />
//                         <FormFeedback>{error?.message}</FormFeedback>
//                       </FormGroup>
//                     );
//                   }}
//                 />

//                 <Controller
//                   name={`sections.${index}.instruction`}
//                   control={control}
//                   render={({ field, fieldState: { error } }) => {
//                     return (
//                       <FormGroup className="flex-fill">
//                         <Label className="form-label">Instruksi</Label>
//                         <Select
//                           {...field}
//                           styles={{
//                             menu: (provided) => ({ ...provided, zIndex: 9999 }),
//                           }}
//                           isSearchable={true}
//                           options={instructions}
//                           getOptionLabel={(option) => option.title}
//                           getOptionValue={(option) => option.id}
//                           classNamePrefix="select"
//                           className={classnames("react-select", {
//                             "is-invalid": error && true,
//                           })}
//                         />
//                         <FormFeedback>{error?.message}</FormFeedback>
//                       </FormGroup>
//                     );
//                   }}
//                 />

//                 <Controller
//                   name={`sections.${index}.status`}
//                   control={control}
//                   render={({ field, fieldState: { error } }) => {
//                     const { ref, value: isActive, ...rest } = field;
//                     return (
//                       <>
//                         <CustomInput
//                           {...rest}
//                           className="mt-50"
//                           innerRef={ref}
//                           type="switch"
//                           id={`sections.${index}.status`}
//                           checked={isActive}
//                           label={isActive ? "Aktif" : "Tidak Aktif"}
//                           inline
//                         />
//                         <FormFeedback>{error?.message}</FormFeedback>
//                       </>
//                     );
//                   }}
//                 />
//               </Col>

//               <div className="content-header mt-3">
//                 <h5 className="mb-0 text-primary font-weight-bolder">
//                   {/* Sesi {type === "create" && `#${index + 1}`} */}
//                   Sesi
//                 </h5>
//                 <small className="text-muted">
//                   {/* {type === "create"
//                     ? `Buat sesi dari gelombang ${index + 1}`
//                     : `Edit sesi tryout premium`} */}
//                   {type === "create"
//                     ? `Buat sesi tryout premium`
//                     : `Edit sesi tryout premium`}
//                 </small>
//               </div>

//               <Col md={6} className={classnames("pl-0 mt-2")}>
//                 <Controller
//                   name={`sections.${index}.cluster_title`}
//                   control={control}
//                   render={({ field, fieldState: { error } }) => {
//                     const { ref, ...rest } = field;
//                     return (
//                       <FormGroup className="flex-fill">
//                         <Label className="form-label">Judul Sesi</Label>
//                         <Input
//                           {...rest}
//                           id="cluster_title"
//                           innerRef={ref}
//                           invalid={error && true}
//                         />
//                         <FormFeedback>{error?.message}</FormFeedback>
//                       </FormGroup>
//                     );
//                   }}
//                 />

//                 <Controller
//                   name={`sections.${index}.max_capacity`}
//                   control={control}
//                   defaultValue=""
//                   render={({ field, fieldState: { error } }) => {
//                     return (
//                       <FormGroup className="flex-fill">
//                         <Label className="form-label">Kapasitas Maksimal</Label>
//                         <InputGroup
//                           className={classnames({
//                             "is-invalid": error && true,
//                           })}
//                         >
//                           <Cleave
//                             {...field}
//                             options={baseNumeralOptions}
//                             className={classnames("form-control", {
//                               "is-invalid": error,
//                             })}
//                             onChange={(e) => field.onChange(e.target.rawValue)}
//                             placeholder="0"
//                           />

//                           <InputGroupAddon addonType="append">
//                             <InputGroupText>
//                               {field.value == 0 ? "Tidak Terbatas" : "Peserta"}
//                             </InputGroupText>
//                           </InputGroupAddon>
//                         </InputGroup>

//                         <FormFeedback>{error?.message}</FormFeedback>
//                       </FormGroup>
//                     );
//                   }}
//                 />

//                 <Controller
//                   control={control}
//                   name={`sections.${index}.start_datetime`}
//                   defaultValue={new Date().toISOString()}
//                   render={({
//                     field: { onChange, ref, value },
//                     fieldState: { error },
//                   }) => (
//                     <FormGroup>
//                       <Label className="form-label">Waktu Dimulai (WIB)</Label>
//                       <Flatpickr
//                         className={classnames("form-control", {
//                           "is-invalid": error,
//                         })}
//                         ref={ref}
//                         value={value}
//                         data-enable-time
//                         options={{
//                           time_24hr: true,
//                           altInput: true,
//                           altFormat: "d-m-Y   H:i",
//                           dateFormat: "Y-m-d",
//                         }}
//                         onChange={(date) => {
//                           onChange(moment.utc(date[0]).toISOString());
//                         }}
//                       />
//                       <FormFeedback>{error?.message}</FormFeedback>
//                     </FormGroup>
//                   )}
//                 />

//                 <Controller
//                   name={`sections.${index}.duration`}
//                   control={control}
//                   defaultValue=""
//                   render={({ field, fieldState: { error } }) => {
//                     const { ref, ...rest } = field;
//                     return (
//                       <FormGroup className="flex-fill">
//                         <Label className="form-label">Waktu Mengerjakan</Label>
//                         <InputGroup
//                           className={classnames({
//                             "is-invalid": error && true,
//                           })}
//                         >
//                           <Cleave
//                             {...field}
//                             options={baseNumeralOptions}
//                             className={classnames("form-control", {
//                               "is-invalid": error,
//                             })}
//                             onChange={(e) => field.onChange(e.target.rawValue)}
//                             value={field.value ?? 0}
//                             placeholder="Inputkan Waktu Mengerjakan"
//                           />

//                           <InputGroupAddon addonType="append">
//                             <InputGroupText>Menit</InputGroupText>
//                           </InputGroupAddon>
//                         </InputGroup>

//                         <FormFeedback>{error?.message}</FormFeedback>
//                       </FormGroup>
//                     );
//                   }}
//                 />

//                 <Controller
//                   control={control}
//                   name={`sections.${index}.end_datetime`}
//                   // defaultValue={new Date().toISOString()}
//                   render={({
//                     field: { onChange, ref, value },
//                     fieldState: { error },
//                   }) => (
//                     <FormGroup>
//                       <Label className="form-label">Waktu Berakhir (WIB)</Label>
//                       <Flatpickr
//                         className={classnames("form-control", {
//                           "is-invalid": error,
//                         })}
//                         ref={ref}
//                         value={value}
//                         data-enable-time
//                         options={{
//                           time_24hr: true,
//                           altInput: true,
//                           altFormat: "d-m-Y   H:i",
//                           dateFormat: "Y-m-d",
//                         }}
//                         onChange={(date) => {
//                           onChange(moment.utc(date[0]).toISOString());
//                         }}
//                         disabled={true}
//                       />
//                       <FormFeedback>{error?.message}</FormFeedback>
//                     </FormGroup>
//                   )}
//                 />

//                 <Controller
//                   name={`sections.${index}.cluster_status`}
//                   control={control}
//                   render={({ field, fieldState: { error } }) => {
//                     const { ref, value: isActive, ...rest } = field;
//                     return (
//                       <>
//                         <CustomInput
//                           {...rest}
//                           className="mt-50"
//                           innerRef={ref}
//                           type="switch"
//                           id={`sections.${index}.cluster_status`}
//                           checked={isActive}
//                           label={isActive ? "Aktif" : "Tidak Aktif"}
//                           inline
//                         />
//                         <FormFeedback>{error?.message}</FormFeedback>
//                       </>
//                     );
//                   }}
//                 />
//               </Col>
//               {/* Add & Remove Button */}
//               <div className="d-flex mt-2 justify-content-end align-items-center">
//                 {sections.length > 1 ? (
//                   <Button
//                     size="md"
//                     color="danger"
//                     className="mr-1"
//                     onClick={() => remove(index)}
//                   >
//                     <Trash2 size={14} /> Hapus Formulir
//                   </Button>
//                 ) : null}

//                 {/* {type === "create" && (
//                   <Controller
//                     name={`sections.${index}.form_action`}
//                     control={control}
//                     defaultValue={false}
//                     render={({ field, fieldState: { error } }) => {
//                       const { ref, value: isActive, ...rest } = field;
//                       return (
//                         <ButtonDropdown
//                           isOpen={isActive}
//                           toggle={() => field.onChange(!isActive)}
//                         >
//                           <DropdownToggle color="primary" caret>
//                             <Plus size={14} /> Tambah Formulir
//                           </DropdownToggle>
//                           <DropdownMenu>
//                             <DropdownItem onClick={handleAddNewForm}>
//                               Buat Formulir Baru
//                             </DropdownItem>
//                             <DropdownItem divider />
//                             <DropdownItem
//                               onClick={() => handleDuplicateForm(index)}
//                               className="w-100"
//                             >
//                               <Copy size={14} /> Duplikat Formulir
//                             </DropdownItem>
//                           </DropdownMenu>
//                         </ButtonDropdown>
//                       );
//                     }}
//                   />
//                 )} */}
//               </div>
//               {sections.length !== index + 1 ? (
//                 <hr className="my-3 mx-n2 border-primary" />
//               ) : null}
//               {/* End Add & Remove Button */}
//             </Fragment>
//           ))}
//         </CardBody>

//         <div
//           className={classnames(
//             "text-right mt-3 p-2",
//             type === "create" ? "bg-light-success" : "bg-light-primary"
//           )}
//         >
//           {type === "create" ? (
//             <Button type="submit" color="gradient-success">
//               <Save size={14} /> Simpan
//             </Button>
//           ) : (
//             <Button type="submit" color="gradient-primary">
//               <Save size={14} /> Perbarui
//             </Button>
//           )}
//         </div>
//       </Card>
//     </Form>
//   );
// };

// CreateEditTryoutPremiumForm.propTypes = {
//   type: PropTypes.oneOf(["create", "edit"]),
// };

// export default CreateEditTryoutPremiumForm;
