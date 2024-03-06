import React, { useState, useEffect, useRef, Fragment } from "react";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
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
} from "reactstrap";
import { Plus, Save, Trash2 } from "react-feather";

import {
  // baseNumeralOptions,
  isObjEmpty,
  selectThemeColors,
} from "../../../utility/Utils";
import { nanoid } from "nanoid";
import { programs } from "../../../config/programs";
import Axios from "axios";
import axios from "../../../utility/http";

const CreateTryoutFreeForm = () => {
  const [isLoading, setIsloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingBranch, setIsFetchingBranch] = useState(false);
  const [isFetchingModules, setIsFetchingModules] = useState(false);
  const [isFetchingInstruction, setIsFetchingInstruction] = useState(false);
  const [isFetchingClassroom, setIsFetchingClassroom] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [branchs, setBranchs] = useState("");
  const [modules, setModules] = useState("");
  const [classroom, setClassroom] = useState("");
  const [participants, setParticipants] = useState([]);

  // const clusterSchema = () => {
  //   return yup.array().of(
  //     yup.object().shape({
  //       cluster_title: yup.string().required("Wajib diisi"),
  //       start_datetime: yup.string().when("isHaveRange", {
  //         is: (isr) => isr == "0",
  //         then: (schema) => schema.notRequired().nullable(),
  //         otherwise: (schema) => schema.required("Wajib diisi"),
  //       }),
  //       end_datetime: yup.string().when("isHaveRange", {
  //         is: (isr) => isr == "0",
  //         then: (schema) => schema.notRequired().nullable(),
  //         otherwise: (schema) => schema.required("Wajib diisi"),
  //       }),
  //       max_capacity: yup.string(),
  //       // .required("Wajib diisi")
  //       // .min(1, "Kapasitas Maksimal harus lebih dari 0"),
  //     })
  //   );
  // };

  const FormSchema = yup.object().shape({
    tryout_name: yup.string().required("Wajib diisi"),
    start_date: yup.string().when("isHaveRange", {
      is: () => isHaveRange == "0",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Wajib diisi"),
    }),
    modules: yup.object().required("Wajib diisi"),
    program: yup.object().required("Wajib diisi"),
    end_date: yup.string().when("isHaveRange", {
      is: () => isHaveRange == "0",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Wajib diisi"),
    }),
    duration: yup.string().required("Wajib diisi"),
    max_repeat: yup.string().required("Wajib diisi"),
    status: yup.boolean().required("Wajib diisi"),
    branch_code: yup.object().required("Wajib diisi"),
    instruction: yup.object().required("Wajib diisi").nullable(),
    clusters: yup.array().of(
      yup.object().shape({
        cluster_title: yup.string().required("Wajib diisi"),
        start_datetime: yup.string().when("isHaveRange", {
          is: () => isHaveRange == "0",
          then: (schema) => schema.notRequired().nullable(),
          otherwise: (schema) => schema.required("Wajib diisi"),
        }),
        end_datetime: yup.string().when("isHaveRange", {
          is: () => isHaveRange == "0",
          then: (schema) => schema.notRequired().nullable(),
          otherwise: (schema) => schema.required("Wajib diisi"),
        }),
        max_capacity: yup.string(),
        // .required("Wajib diisi")
        // .min(1, "Kapasitas Maksimal harus lebih dari 0"),
      })
    ),
  });

  const getEmptyClusterForm = () => {
    return {
      id: nanoid(),
      cluster_title: "",
      max_capacity: "",
      start_datetime: "",
      end_datetime: "",
      cluster_status: true,
      classes: [],
    };
  };

  const numericOnly = {
    numericOnly: true,
  };

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
      tryout_name: "",
      package_type: "WITH_CODE",
      status: true,
      cluster_status: true,
      isHaveRange: "1",
      clusters: [getEmptyClusterForm()],
    },
  });

  const isCanceled = useRef(false);
  const source = Axios.CancelToken.source();
  const { branch_code, program, isHaveRange, clusters: clusterForm } = watch();
  const {
    append,
    remove,
    fields: clusters,
  } = useFieldArray({
    control,
    name: "clusters",
  });

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

  const convertUTC = (date) => {
    return moment.utc(date).subtract(7, "hour").format();
  };

  const getPayload = () => {
    const form = getValues();
    const clusterData = form.clusters;
    let start = "";
    let end = "";
    form.start_date.length > 0
      ? (start = convertUTC(form.start_date))
      : (start = null);
    form.end_date.length > 0 ? (end = convertUTC(form.end_date)) : (end = null);

    const cluster_data = clusterData.filter(
      (classId) =>
        classId.classes !== undefined ||
        classId.classes !== null ||
        classId.classes !== "" ||
        classId.classes !== []
    )
      ? clusterData.map((cluster) => {
          return {
            title: cluster.cluster_title,
            max_capacity: cluster?.max_capacity
              ? parseInt(cluster.max_capacity)
              : 0,
            class_id: cluster.classes.map((classId) => classId?._id) ?? [],
            status: cluster.cluster_status,
            start_datetime: cluster.start_datetime
              ? convertUTC(cluster.start_datetime)
              : null,
            end_datetime: cluster.end_datetime
              ? convertUTC(cluster.end_datetime)
              : null,
          };
        })
      : clusterData.map((cluster) => {
          return {
            title: cluster.cluster_title,
            max_capacity: cluster?.max_capacity
              ? parseInt(cluster.max_capacity)
              : 0,
            status: cluster.cluster_status,
            start_datetime: cluster.start_datetime,
            end_datetime: cluster.end_datetime,
          };
        });

    const privacy_type = clusterData.filter(
      (cluster) =>
        cluster?.classes != undefined ||
        cluster?.classes != null ||
        cluster?.classes != "" ||
        cluster?.classes != []
    )
      ? "PRIVATE"
      : "PUBLIC";

    let clusterClasses = [];
    const [class_id] = clusterData.map((cluster) => {
      cluster.classes.map((classId) => clusterClasses.push(classId?._id));
      return clusterClasses;
    });

    let cluster_participants = [];
    class_id.map((id) => {
      return participants[id].map((participant) => {
        cluster_participants.push({
          smartbtw_id: participant.smartbtw_id,
          class_id: participant.classroom_id,
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
          status: true,
          joined_date: moment().utc().format(),
        });
      });
    });

    const payload = {
      title: form.tryout_name,
      program: form.program.slug,
      modules_code: form.modules.module_code,
      modules_id: form.modules.id,
      duration: form.duration,
      status: form.status,
      privacy_type: privacy_type,
      instructions_id: form.instruction.id,
      branch_code: form.branch_code.code,
      date_start: start,
      date_end: end,
      cluster_data: cluster_data,
    };
    if (cluster_participants.length > 0) {
      payload.cluster_participants = cluster_participants;
    }
    return payload;
  };

  const redirectToIndexPage = () => {
    window.location.href = "/ujian/tryout-gratis";
  };

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

  const getClassroom = async (branch_code) => {
    try {
      setIsFetchingClassroom(true);

      const response = await axios.get(
        `/learning/classroom/branch/${branch_code.code}`,
        {
          cancelToken: source.token,
        }
      );
      const data = await response.data;
      const classroomData = data?.data ?? [];
      const filteredDataClassroom = classroomData.filter(
        (classroom) =>
          classroom.count_member > 0 && classroom.status == "ONGOING"
      );

      if (!isCanceled.current) {
        setClassroom(filteredDataClassroom);
        setIsFetchingClassroom(false);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingClassroom(false);
      }
    }
  };

  const getModules = async (program) => {
    try {
      setIsFetchingModules(true);

      const response = await axios.get(`/exam/module/program/${program}`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const modulesData = data?.data ?? [];

      if (!isCanceled.current) {
        setIsFetchingModules(false);
        setModules(modulesData);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingModules(false);
      }
    }
  };

  const submitHandler = async () => {
    trigger();
    if (isObjEmpty(errors)) {
      (async () => {
        try {
          // console.log(getValues());
          const payload = getPayload();
          if (payload) {
            setIsSubmitting(true);
            await axios.post("/exam/tryout-free/create", payload);
          }
          if (!isCanceled.current) {
            redirectToIndexPage();
          }
        } catch (error) {
          console.log(error);
          if (!isCanceled.current) {
            setIsSubmitting(false);
          }
        }
      })();
    }
  };

  useEffect(() => {
    setValue("instruction", "");
    setInstructions([]);
    setModules([]);
    if (program?.slug) {
      getModules(program?.slug);
      getInstruction(program?.slug);
    }
  }, [program?.slug]);

  useEffect(() => {
    setIsloading(true);
    getBranchs();
    setIsloading(false);
  }, []);

  useEffect(() => {
    setClassroom([]);
    clearSelectedClassroom();
    getClassroom(branch_code);
  }, [branch_code]);

  useEffect(() => {
    const is_have_range = Boolean(parseInt(isHaveRange));
    if (!is_have_range) {
      setValue("max_repeat", 1);
    }
  }, [isHaveRange]);

  const clearSelectedClassroom = () => {
    const copyClusterForm = [...clusterForm];
    copyClusterForm.forEach((cluster) => {
      cluster.classes = [];
    });
    setValue("clusters", copyClusterForm);
  };

  const handleAddNewForm = () => {
    append(getEmptyClusterForm());
  };

  const getClusterParticipantsByClassId = async (class_id) => {
    try {
      const response = await axios.get(
        `/learning/classroom/class-member/${class_id}`,
        {
          cancelToken: source.token,
        }
      );
      const data = await response.data;

      if (!isCanceled.current) {
        setParticipants((current) => ({
          ...current,
          [class_id]: data ?? [],
        }));
      }
    } catch (error) {
      if (!isCanceled.current) {
      }
    }
  };

  return (
    <div className={classnames(isSubmitting && "block-content")}>
      {isLoading ? (
        <SpinnerCenter />
      ) : (
        <Form onSubmit={handleSubmit(submitHandler)}>
          <Card>
            <CardBody>
              <Col md={6} className={classnames("mt-2 pl-0")}>
                <Controller
                  name="program"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Pilih Program</Label>
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
                          isLoading={isFetchingModules}
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
                  name="tryout_name"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">Nama Tryout</Label>
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
                  name="isHaveRange"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, value: isActive, ...rest } = field;
                    return (
                      <>
                        <FormGroup className="flex-fill">
                          <Label>Apakah tryout memiliki jangka waktu?</Label>
                          <div className="mt-50">
                            <CustomInput
                              {...rest}
                              innerRef={ref}
                              type="radio"
                              id="yes"
                              value="1"
                              checked={Boolean(parseInt(isHaveRange))}
                              label="Ya"
                              inline
                            />
                            <CustomInput
                              {...rest}
                              innerRef={ref}
                              type="radio"
                              id="no"
                              label="Tidak"
                              value="0"
                              checked={!Boolean(parseInt(isHaveRange))}
                              inline
                            />
                          </div>
                        </FormGroup>
                        <FormFeedback>{error?.message}</FormFeedback>
                      </>
                    );
                  }}
                />

                <hr className="my-2" />
                {isHaveRange == "1" ? (
                  <>
                    <Controller
                      control={control}
                      name="start_date"
                      defaultValue=""
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
                      defaultValue=""
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
                  </>
                ) : null}

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
                            options={numericOnly}
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
                            options={numericOnly}
                            readOnly={isHaveRange == 0}
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
                          name="status"
                          id="status"
                          checked={isActive}
                          label={isActive ? "Aktif" : "Tidak AKtif"}
                          inline
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </>
                    );
                  }}
                />
              </Col>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesi Tryout Gratis</CardTitle>
            </CardHeader>
            <CardBody className="mt-2">
              {clusters.map((cluster, index) => (
                <Fragment key={index}>
                  <div className="d-flex">
                    <div>
                      <Badge
                        color="light-primary"
                        className={classnames(
                          "d-flex justify-content-center align-items-center",
                          "mr-1 mt-25"
                        )}
                        style={{
                          fontSize: "1rem",
                          width: "30px",
                          height: "30px",
                        }}
                      >
                        {index + 1}
                      </Badge>
                    </div>
                    <Col md={6} className={classnames("pl-0")} key={cluster.id}>
                      <Controller
                        name={`clusters.${index}.classes`}
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          return (
                            <FormGroup className="flex-fill">
                              <Label className="form-label">
                                Pilih Kelas (opsional)
                              </Label>
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
                                isMulti={true}
                                isSearchable={true}
                                options={classroom}
                                isLoading={isFetchingClassroom}
                                isDisabled={isFetchingClassroom}
                                isClearable={true}
                                getOptionLabel={(option) => option.title}
                                getOptionValue={(option) => option.class_code}
                                classNamePrefix="select"
                                theme={selectThemeColors}
                                className={classnames("react-select", {
                                  "is-invalid": error && true,
                                })}
                                onChange={(value) => {
                                  field.onChange(value);
                                  const lastValue = value.reverse()[0];
                                  getClusterParticipantsByClassId(
                                    lastValue?._id
                                  );
                                }}
                              />
                              <FormFeedback>{error?.message}</FormFeedback>
                            </FormGroup>
                          );
                        }}
                      />
                      <Controller
                        name={`clusters.${index}.cluster_title`}
                        control={control}
                        render={({ field, fieldState: { error } }) => {
                          const { ref, ...rest } = field;
                          return (
                            <FormGroup className="flex-fill">
                              <Label className="form-label">Judul Sesi</Label>
                              <Input
                                {...rest}
                                id="cluster_title"
                                innerRef={ref}
                                invalid={error && true}
                              />
                            </FormGroup>
                          );
                        }}
                      />

                      {clusterForm[index].classes.length > 0 ? null : (
                        <Controller
                          name={`clusters.${index}.max_capacity`}
                          control={control}
                          defaultValue=""
                          render={({ field, fieldState: { error } }) => {
                            return (
                              <FormGroup className="flex-fill">
                                <Label className="form-label">
                                  Kapasitas Maksimal
                                </Label>
                                <InputGroup
                                  className={classnames({
                                    "is-invalid": error && true,
                                  })}
                                >
                                  <Cleave
                                    {...field}
                                    required={true}
                                    options={numericOnly}
                                    className={classnames("form-control", {
                                      "is-invalid": error,
                                    })}
                                    onChange={(e) =>
                                      field.onChange(e.target.rawValue)
                                    }
                                    value={field.value ?? 0}
                                    placeholder="0"
                                  />

                                  <InputGroupAddon addonType="append">
                                    <InputGroupText>
                                      {field.value == 0
                                        ? "Tidak Terbatas"
                                        : "Peserta"}
                                    </InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>

                                <FormFeedback>{error?.message}</FormFeedback>
                              </FormGroup>
                            );
                          }}
                        />
                      )}

                      {isHaveRange == "1" ? (
                        <>
                          <Controller
                            control={control}
                            name={`clusters.${index}.start_datetime`}
                            defaultValue=""
                            render={({
                              field: { onChange, ref, value },
                              fieldState: { error },
                            }) => (
                              <FormGroup>
                                <Label className="form-label">
                                  Waktu Dimulai (WIB)
                                </Label>
                                <Input
                                  type="datetime-local"
                                  ref={ref}
                                  className={classnames("form-control", {
                                    "is-invalid": error,
                                  })}
                                  value={value}
                                  onChange={(date) => {
                                    date.length === 0
                                      ? onChange("")
                                      : onChange(date);
                                  }}
                                />
                                <FormFeedback>{error?.message}</FormFeedback>
                              </FormGroup>
                            )}
                          />

                          <Controller
                            control={control}
                            name={`clusters.${index}.end_datetime`}
                            defaultValue=""
                            render={({
                              field: { onChange, ref, value },
                              fieldState: { error },
                            }) => (
                              <FormGroup>
                                <Label className="form-label">
                                  Waktu Berakhir (WIB)
                                </Label>
                                <Input
                                  type="datetime-local"
                                  ref={ref}
                                  className={classnames("form-control", {
                                    "is-invalid": error,
                                  })}
                                  value={value}
                                  onChange={(date) => {
                                    date.length === 0
                                      ? onChange("")
                                      : onChange(date);
                                  }}
                                />
                                <FormFeedback>{error?.message}</FormFeedback>
                              </FormGroup>
                            )}
                          />
                        </>
                      ) : null}

                      <Controller
                        name={`clusters.${index}.cluster_status`}
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
                                id={`clusters.${index}.cluster_status`}
                                checked={isActive}
                                label={isActive ? "Aktif" : "Tidak Aktif"}
                                inline
                              />
                              <FormFeedback>{error?.message}</FormFeedback>
                            </>
                          );
                        }}
                      />

                      <div className="d-flex justify-content-end align-items-center">
                        {clusters.length > 1 ? (
                          <Button
                            size="md"
                            color="danger"
                            className="mt-2 mr-1"
                            onClick={() => remove(index)}
                          >
                            <Trash2 size={14} /> Hapus Formulir
                          </Button>
                        ) : null}
                        <Button
                          size="md"
                          color="primary"
                          className="mt-2"
                          onClick={handleAddNewForm}
                        >
                          <Plus size={14} /> Tambah Formulir Baru
                        </Button>
                      </div>
                    </Col>
                  </div>
                  {clusters.length !== index + 1 ? (
                    <hr className="my-3 mx-n2 border-primary" />
                  ) : null}
                </Fragment>
              ))}
            </CardBody>
          </Card>

          <div className="text-right mt-4">
            <Button type="submit" color="gradient-success">
              <Save size={14} /> Simpan
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default CreateTryoutFreeForm;
