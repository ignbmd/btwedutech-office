import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import React, { useState, useEffect, useRef } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
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

import { getLastSegment, baseNumeralOptions } from "../../../utility/Utils";
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
    .max(240, "Tidak boleh lebih dari 240")
    .required("Wajib diisi")
    .typeError("Wajib diisi"),
  max_repeat: yup
    .number()
    .moreThan(0, "Harus lebih dari 0")
    .required("Wajib diisi")
    .typeError("Wajib diisi"),
  modul: yupLazyValidation,
  product: yup.mixed().notRequired().optional(),
  instruction: yupLazyValidation,
});

const EditPackageForm = () => {
  const [premiumPackage, setPremiumPackage] = useState(null);
  const [products, setProducts] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [modules, setModules] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [isFetchingModules, setIsFetchingModules] = useState(false);
  const [isFetchingInstructions, setIsFetchingInstructions] = useState(false);
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const { watch, control, trigger, setValue, getValues, handleSubmit } =
    useForm({
      resolver: yupResolver(FormSchema),
      defaultValues: {
        program: { name: "SKD", slug: "skd" },
        tags: [],
      },
    });

  const { program, tags } = watch();

  const fetchPackage = async (id) => {
    try {
      const response = await axios.get(`/api/exam-cpns/package/${id}`);
      const data = response.data.data;
      return data ?? [];
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async (program) => {
    try {
      setIsFetchingProducts(true);
      const response = await axios.get(
        `/api/product/online-package/${program}/options/v2`,
        { cancelToken: source.token }
      );
      setProducts(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const fetchInstructions = async (program) => {
    try {
      setIsFetchingInstructions(true);
      const response = await axios.get(
        `/api/exam-cpns/instruction/${program}`,
        { cancelToken: source.token }
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
        `/api/exam-cpns/module/program/${program}`,
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

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      trigger();

      const formValues = getValues();
      const payload = {
        title: formValues.title,
        program: formValues.program.slug,
        modules_id: parseInt(formValues.modul.id),
        legacy_task_id: premiumPackage.legacy_task_id,
        duration: parseInt(formValues.duration),
        status: formValues.status,
        privacy_type: "PUBLIC",
        instructions_id: parseInt(formValues.instruction.id),
        product_code: formValues?.product?.product_code ?? null,
        max_repeat: parseInt(formValues.max_repeat),
        tags: formValues.tags,
      };

      const response = await axios.post(`/api/exam-cpns/package/${id}`, {
        data: payload,
        cancelToken: source.token,
      });
      if (response.status == 201 && !isCanceled.current) showSuccessToast();
      else showErrorToast();
    } catch (error) {
      if (!isCanceled.current) console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSuccessToast = () => {
    toastr.success(`Paket soal berhasil diperbarui`, `Berhasil`, {
      timeOut: 2000,
      closeButton: true,
      tapToDismiss: true,
      preventDuplicates: true,
      onHidden() {
        window.location.href = `/ujian-cpns/paket-soal`;
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
      setPremiumPackage(data);

      setValue("title", data.title);
      setValue("status", data.status);
      setValue("max_repeat", data.max_repeat);
      setValue("duration", data.duration);
      setValue(
        "program",
        programs.find((program) => program.slug === data.program)
      );
      if (data?.tags?.length) setValue("tags", data?.tags);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadEdit();
    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    if (!products.length) return;
    if (!modules.length) return;
    if (!instructions.length) return;
    if (isFetching) {
      setValue(
        "product",
        products?.find(
          (product) => product.product_code === premiumPackage?.product_code
        )
      );
      setValue("modul", {
        id: premiumPackage?.modules?.id,
        name: premiumPackage?.modules?.name,
      });
      setValue("instruction", {
        id: premiumPackage?.instructions?.id,
        title: premiumPackage?.instructions?.title,
      });
    }
    setIsFetching(false);
  }, [products, modules, instructions]);

  useEffect(() => {
    if (!program?.slug) return;
    setValue("product", "");
    setValue("instruction", "");

    fetchProducts(program.slug);
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
                            field.onChange(data);
                            setValue("modul", "");
                          }}
                          isSearchable={false}
                          options={programs}
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.slug}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": Boolean(error?.message),
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
                        <Label className="form-label">
                          Pilih Produk (Opsional)
                        </Label>
                        <Select
                          {...field}
                          options={products}
                          isDisabled={isFetchingProducts}
                          isLoading={isFetchingProducts}
                          isClearable={true}
                          getOptionLabel={(option) =>
                            `${option.title} (${option.product_code})`
                          }
                          getOptionValue={(option) => option.product_code}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": Boolean(error?.message),
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
                          invalid={Boolean(error?.message)}
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
                          isSearchable={true}
                          isLoading={isFetchingModules}
                          options={modules}
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.id}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": Boolean(error?.message),
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
                            "is-invalid": Boolean(error?.message),
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
                            "is-invalid": Boolean(error?.message),
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
                          isLoading={isFetchingInstructions}
                          options={instructions}
                          getOptionLabel={(option) => option.title}
                          getOptionValue={(option) => option.id}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": Boolean(error?.message),
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
                />

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

export default EditPackageForm;
