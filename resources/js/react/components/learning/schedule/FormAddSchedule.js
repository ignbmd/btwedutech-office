import { useState, useEffect } from "react";
import { Plus, Trash } from "react-feather";
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import classnames from "classnames";
import axios from "axios";
import "react-slidedown/lib/slidedown.css";
import "flatpickr/dist/themes/airbnb.css";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormFeedback,
  FormGroup,
  Label,
  Input,
  Button,
  Badge,
  CustomInput,
} from "reactstrap";
import MultipleInputSelect from "../../core/multiple-input-select/MultipleInputSelect";
import moment from "moment-timezone";
import {
  backPage,
  getClassroomFromBlade,
  getClassroomId,
  getQuestionCategoryOptions,
  getSubQuestionCategoryOptions,
  getScheduleSessionOptions,
} from "./utility/form-utils";

const classroom = getClassroomFromBlade();
const isBTWEdutechClass = classroom?.tags?.includes("btwedutech");
const isCPNSClass = classroom?.tags?.includes("cpns");
const isP3KClass =
  classroom?.tags?.includes("pppk") || classroom?.tags?.includes("PPPK");

const scheduleZoomMeetingOptions = [
  {
    label: "Buat zoom meeting baru untuk jadwal ini",
    value: true,
  },
  {
    label: "Gunakan zoom meeting dari jadwal yang sudah ada",
    value: false,
  },
];

const getEmptyForm = () => {
  return {
    title: "",
    start_date: "",
    end_date: "",
    teacher_id: "",
    input_topics: "",
    topics: [],
    classroom_id: getClassroomId(),
    material_id: "",
    is_pre_test: false,
    is_post_test: false,
    program: "",
    is_skd: true,
    create_new_zoom_meeting: undefined,
    is_require_passcode: false,
    zoom_host_id: "",
    zoom_passcode: "",
    parent_schedules: [],
    selected_parent_schedule: undefined,
    parent_schedule_id: "",
    parent_classroom_id: "",
    question_category: "",
    sub_question_category: "",
    session: "",
  };
};

const getZoomUserType = (zoom_user_type) => {
  switch (zoom_user_type) {
    case 1:
      return "Basic";
    case 2:
      return "Licensed";
    case 3:
      return "On-prem";
    case 99:
      return "None";
    default:
      return "Unknown";
  }
};

const getZoomUserMaxMeetingDuration = (zoom_user_type) => {
  switch (zoom_user_type) {
    case 2:
    case 3:
    case 99:
      return "30 hours";
    default:
      return "40 minutes";
  }
};

const getCsrf = () => {
  return document.querySelector('meta[name="csrf-token"]').content;
};

const FormAddSchedule = () => {
  const [teachers, setTeachers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [zoomUsers, setZoomUsers] = useState([]);
  const [isLoadingZoomUsers, setIsLoadingZoomUsers] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedZoomUser, setSelectedZoomUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(
    classroom?.is_online
  );
  const [classrooms, setClassrooms] = useState([]);
  const [questionCategories, setQuestionCategories] = useState([]);
  const [subQuestionCategories, setSubQuestionCategories] = useState([]);

  const formSchema = yup.object().shape({
    title: yup.string().required("Judul harus diisi"),
    start_date: yup.string().required("Waktu mulai harus diisi"),
    end_date: yup.string().required("Waktu selesai harus diisi"),
    teacher_id: yup.string().required("Pengajar harus dipilih"),
    is_skd: yup.bool().optional(),
    is_require_passcode: yup.bool().optional(),
    zoom_host_id: yup.string().when(["create_new_zoom_meeting"], {
      is: (createNewZoomMeeting) => createNewZoomMeeting,
      then: (schema) => schema.required("Zoom host harus dipilih"),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),
    zoom_passcode: yup.string().when(["is_require_passcode"], {
      is: (isRequirePasscode) => isRequirePasscode,
      then: (schema) => schema.required("Passcode harus diisi"),
    }),
    program: yup.string().when(["is_skd"], {
      is: (isSkd) => !!isSkd,
      then: yup.string().required("Program harus dipilih"),
    }),
    material_id: yup.string().when(["is_skd"], {
      is: (isSkd) => !!isSkd,
      then: yup.string().required("Materi harus dipilih"),
    }),
  });

  const fieldsSchema = yup.object().shape({
    schedules: yup
      .array()
      .of(formSchema)
      .required("Harus ada jadwal")
      .min(1, "Minimal 1"),
  });

  const { control, handleSubmit, setError, watch, setValue, reset } = useForm({
    defaultValues: { schedules: [getEmptyForm()] },
    resolver: yupResolver(fieldsSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  });
  const watchedForm = watch();

  const getTeachers = async () => {
    try {
      const response = await axios.get("/api/learning/teacher");
      const data = await response.data;
      return data?.data ?? [];
    } catch {
      return [];
    }
  };

  const getPrograms = async () => {
    try {
      // const response = await axios.get("/api/internal/programs");
      // const data = await response.data;
      // return data ?? [];
      return isCPNSClass
        ? [
            { id: "cpns", text: "SKD-CPNS" },
            { id: "cpns-skb", text: "SKB-CPNS" },
          ]
        : [
            { id: "skd", text: "SKD" },
            { id: "tps", text: "TPS" },
            { id: "pppk", text: "PPPK" },
            { id: "utbk", text: "UTBK" },
          ];
    } catch (error) {
      return [];
    }
  };

  const getMaterials = async () => {
    try {
      let url = `/api/exam/study-material`;
      if (isP3KClass) url = `/api/study-material/material`;
      if (isCPNSClass) url = `/api/exam-cpns/study-material`;
      const response = await axios.get(url);
      const data = await response.data;
      return (
        data.filter(
          (value) => !value.hasOwnProperty("deleted_at") || !value.deleted_at
        ) ?? []
      );
    } catch (error) {
      return [];
    }
  };

  const getZoomUsers = async () => {
    try {
      setIsLoadingZoomUsers(true);
      const response = await axios.get("/api/zoom/users");
      const data = await response.data;
      const filteredData = data?.users?.length
        ? data?.users.filter((value) => value.type !== 1 && value.type !== 99)
        : [];
      return filteredData;
    } catch (error) {
      return [];
    } finally {
      setIsLoadingZoomUsers(false);
    }
  };

  const getSelectedZoomUserData = async (zoom_user_id) => {
    try {
      const response = await axios.get(`/api/zoom/users/${zoom_user_id}`);
      const data = await response.data;
      return data ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getSelectedZoomUserSettings = async (zoom_user_id) => {
    try {
      const response = await axios.get(
        `/api/zoom/users/${zoom_user_id}/settings`
      );
      const data = await response.data;
      return data ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getClassrooms = async () => {
    try {
      const response = await axios.get("/api/learning/classroom", {
        params: {
          is_online: "1",
          status: "ONGOING",
        },
      });
      const data = await response.data;
      return data?.data?.length
        ? data?.data?.filter((value) => value._id !== getClassroomId())
        : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getParentClassSchedules = async (classroom_id) => {
    try {
      const response = await axios.get(
        `/api/learning/classroom/${classroom_id}/available-online-schedules`,
        {
          params: {
            child_classroom_id: getClassroomId(),
          },
        }
      );
      const data = await response.data;
      return data?.data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      setTeachers(await getTeachers());
      setMaterials(await getMaterials());
      setPrograms(await getPrograms());

      if (!classroom || !classroom?.is_online) return;
      setClassrooms(await getClassrooms());
      setZoomUsers(await getZoomUsers());
    })();
  }, []);

  const getMaterialByProgram = (program = null) => {
    if (!program) return materials;
    if (program === "cpns") program = "skd";
    if (program === "cpns-skb") program = "skb";
    const filtered = materials.filter((m) => m.program == program);
    return [...filtered];
  };

  const handleIsSkdChanged = (index, value) => {
    setValue(`schedules.${index}.is_skd`, value);
    setValue(`schedules.${index}.material_id`, "");
    setValue(`schedules.${index}.program`, "");
    setValue(`schedules.${index}.is_pre_test`, false);
    setValue(`schedules.${index}.is_post_test`, false);
  };

  const handleIsRequirePasscodeChanged = (index, value) => {
    setValue(`schedules.${index}.is_require_passcode`, value);
  };

  const handleZoomHostIdChanged = async (index, value) => {
    try {
      setIsSubmitButtonDisabled(true);
      setSelectedZoomUser(null);
      if (!value) return;
      setValue(`schedules.${index}.zoom_host_id`, value);
      const account = await getSelectedZoomUserData(value);
      const settings = await getSelectedZoomUserSettings(value);
      setSelectedZoomUser({
        account,
        settings,
      });
      setIsSubmitButtonDisabled(account?.type !== 2);
    } catch (error) {
      console.error(error);
      setIsSubmitButtonDisabled(true);
    }
  };

  const handleZoomMeetingSettingsChanged = async (index, value) => {
    if (!value) {
      setSelectedZoomUser(null);
      setValue(`schedules.${index}.is_require_passcode`, false);
      setValue(`schedules.${index}.zoom_passcode`, "");
      setValue(`schedules.${index}.parent_classroom_id`, "");
      setValue(`schedules.${index}.parent_schedule_id`, "");
      setValue(`schedules.${index}.parent_schedules`, []);
      setValue(`schedules.${index}.selected_parent_schedule`, undefined);
    }
    setValue(`schedules.${index}.create_new_zoom_meeting`, value);
  };

  const handleGetParentClassSchedules = async (index, value) => {
    if (!value) return;
    setIsSubmitButtonDisabled(true);
    setValue(`schedules.${index}.parent_classroom_id`, "");
    setValue(`schedules.${index}.parent_schedule_id`, "");
    setValue(`schedules.${index}.parent_schedules`, []);
    setValue(`schedules.${index}.selected_parent_schedule`, undefined);

    const schedules = await getParentClassSchedules(value);
    setValue(`schedules.${index}.parent_classroom_id`, value);
    setValue(`schedules.${index}.parent_schedules`, schedules);
  };

  const handleSelectParentClassSchedule = async (index, value) => {
    if (!value) return;
    setValue(`schedules.${index}.parent_schedule_id`, value);
    setValue(
      `schedules.${index}.selected_parent_schedule`,
      watchedForm?.schedules[index]?.parent_schedules?.filter(
        (val) => val._id == value
      )[0] ?? undefined
    );
    setIsSubmitButtonDisabled(false);
  };

  const handleProgramChanged = (index, value) => {
    setQuestionCategories([]);
    setValue(`schedules.${index}.question_category`, "");
    setValue(`schedules.${index}.sub_question_category`, "");
    setValue(`schedules.${index}.program`, value?.id);
    setQuestionCategories(getQuestionCategoryOptions(value?.id));
  };

  const handleQuestionCategoryChanged = (index, value) => {
    setSubQuestionCategories([]);
    setValue(
      `schedules.${index}.question_category`,
      value?.value?.toLowerCase() ?? ""
    );
    setValue(`schedules.${index}.sub_question_category`, "");
    setSubQuestionCategories(
      getSubQuestionCategoryOptions(value?.value?.toLowerCase())
    );
  };

  const onSubmit = async ({ schedules }) => {
    try {
      schedules = schedules.map((data) => {
        let scheduleTags = [];
        let topicTags = [...data.topics].filter((item) => {
          return !/^(KATEGORI:|SUB_KATEGORI:|PERTEMUAN_SUB_KATEGORI:)/i.test(
            item
          );
        });
        if (data?.question_category?.value) {
          scheduleTags.push(`KATEGORI:${data?.question_category?.value}`);
        }
        if (data?.sub_question_category?.value) {
          scheduleTags.push(
            `SUB_KATEGORI:${data?.sub_question_category?.value}`
          );
        }
        if (data?.session?.value) {
          scheduleTags.push(`PERTEMUAN_SUB_KATEGORI:${data?.session?.value}`);
        }

        if (isCPNSClass) {
          topicTags.push("cpns");
        }

        const payload = {
          ...data,
          start_date: moment(data.start_date).tz("Asia/Jakarta", true),
          end_date: moment(data.end_date).tz("Asia/Jakarta", true),
          topics: [...scheduleTags, ...topicTags],
        };
        if (classroom?.is_online && data.create_new_zoom_meeting) {
          const selectedZoomHost = zoomUsers?.find(
            (value) => value.id === data.zoom_host_id
          );
          payload.zoom_host_name = `${selectedZoomHost.first_name} ${selectedZoomHost.last_name}`;
          payload.zoom_host_email = selectedZoomHost.email;
        }
        return payload;
      });
      setIsSubmitting(true);
      const response = await axios.post(
        "/api/learning/schedule/many",
        { schedules },
        { headers: { "X-CSRF-TOKEN": getCsrf() } }
      );
      await response.data;
      backPage();
    } catch (error) {
      const isValidationError = error?.response?.status === 422;
      if (isValidationError) {
        const errors = error?.response?.data?.errors;
        Object.entries(errors).forEach(([key, value]) =>
          setError(key, {
            type: "manual",
            message: value[0] ?? "",
          })
        );
        return;
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <Row
              key={field.id}
              className="justify-content-between align-items-end"
            >
              {!classroom?.is_online && (
                <Col md={1} className="align-self-start">
                  <Badge
                    color="primary"
                    className="mb-2 mt-1 d-flex justify-content-center align-items-center"
                    style={{
                      fontSize: "1.5rem",
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    {index + 1}
                  </Badge>
                </Col>
              )}

              <Col md={9}>
                <Controller
                  control={control}
                  name={`schedules.${index}.title`}
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <Label>Judul</Label>
                      <Input
                        {...field}
                        invalid={Boolean(error)}
                        placeholder="Pelajaran SKD"
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />

                <Controller
                  control={control}
                  name={`schedules.${index}.start_date`}
                  render={({
                    field: { onChange, ref, value },
                    fieldState: { error },
                  }) => (
                    <FormGroup>
                      <Label>Waktu Mulai (WIB)</Label>
                      <Flatpickr
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        data-enable-time
                        ref={ref}
                        value={value}
                        readOnly={false}
                        onChange={(date) => onChange(date[0].toISOString())}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />

                <Controller
                  control={control}
                  name={`schedules.${index}.end_date`}
                  render={({
                    field: { onChange, ref, value },
                    fieldState: { error },
                  }) => (
                    <FormGroup>
                      <Label>Waktu Selesai (WIB)</Label>
                      <Flatpickr
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        data-enable-time
                        ref={ref}
                        value={value}
                        readOnly={false}
                        onChange={(date) => onChange(date[0].toISOString())}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />

                <Controller
                  control={control}
                  name={`schedules.${index}.teacher_id`}
                  render={({ field: { onChange }, fieldState: { error } }) => (
                    <FormGroup>
                      <Label>Pilih Pengajar</Label>
                      <Select
                        className={classnames("react-select", {
                          "is-invalid": error,
                        })}
                        classNamePrefix="select"
                        options={teachers}
                        isClearable={false}
                        getOptionValue={(option) => option.sso_id}
                        getOptionLabel={(option) => option.name}
                        onChange={(val) => onChange(val.sso_id)}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />

                <Controller
                  control={control}
                  name={`schedules.${index}.is_skd`}
                  render={({ field: { onChange, value } }) => (
                    <FormGroup>
                      <CustomInput
                        checked={value}
                        onChange={(e) =>
                          handleIsSkdChanged(index, e.target.checked)
                        }
                        inline
                        type="checkbox"
                        label="Pilih Materi Pembelajaran"
                        id={`is_skd_${index}`}
                      />
                    </FormGroup>
                  )}
                />

                {watchedForm?.schedules[index]?.is_skd && (
                  <>
                    <Controller
                      control={control}
                      name={`schedules.${index}.program`}
                      render={({
                        field: { onChange },
                        fieldState: { error },
                      }) => (
                        <FormGroup>
                          <Label>Pilih Program Materi Belajar</Label>
                          <Select
                            className={classnames("react-select", {
                              "is-invalid": error,
                            })}
                            classNamePrefix="select"
                            options={programs}
                            isClearable={false}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.text}
                            onChange={(option) => {
                              onChange(option.id);
                              if (option.id !== "skd") {
                                setValue(
                                  `schedules.${index}.question_category`,
                                  null
                                );
                                setValue(
                                  `schedules.${index}.sub_question_category`,
                                  null
                                );
                              }
                            }}
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      )}
                    />

                    {["skd", "cpns"].some(
                      (program) =>
                        watchedForm?.schedules[index]?.program === program
                    ) && (
                      <>
                        <Controller
                          control={control}
                          name={`schedules.${index}.question_category`}
                          render={({ field, fieldState: { error } }) => (
                            <FormGroup>
                              <Label>
                                Pilih Kategori Materi Belajar (Opsional)
                              </Label>
                              <Select
                                {...field}
                                className={classnames("react-select", {
                                  "is-invalid": error,
                                })}
                                classNamePrefix="select"
                                options={getQuestionCategoryOptions("skd")}
                                isClearable={true}
                                onChange={(option) => {
                                  field.onChange(option);
                                  setValue(
                                    `schedules.${index}.sub_question_category`,
                                    null
                                  );
                                }}
                                menuPortalTarget={document.body}
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                              />
                              <FormFeedback>{error?.message}</FormFeedback>
                            </FormGroup>
                          )}
                        />

                        <Controller
                          control={control}
                          name={`schedules.${index}.sub_question_category`}
                          render={({ field, fieldState: { error } }) => (
                            <FormGroup>
                              <Label>
                                Pilih Sub Kategori Materi Belajar (Opsional)
                              </Label>
                              <Select
                                {...field}
                                className={classnames("react-select", {
                                  "is-invalid": error,
                                })}
                                isClearable={true}
                                classNamePrefix="select"
                                options={getSubQuestionCategoryOptions(
                                  watchedForm?.schedules[
                                    index
                                  ]?.question_category?.value?.toLowerCase() ??
                                    ""
                                )}
                                menuPortalTarget={document.body}
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                              />
                              <FormFeedback>{error?.message}</FormFeedback>
                            </FormGroup>
                          )}
                        />
                      </>
                    )}

                    <Controller
                      control={control}
                      name={`schedules.${index}.material_id`}
                      render={({
                        field: { onChange, value },
                        fieldState: { error },
                      }) => (
                        <FormGroup>
                          <Label>Pilih Materi Belajar</Label>
                          <Select
                            className={classnames("react-select", {
                              "is-invalid": error,
                            })}
                            classNamePrefix="select"
                            options={getMaterialByProgram(
                              watchedForm?.schedules[index]?.program
                            )}
                            isClearable={false}
                            getOptionValue={(option) =>
                              option?._id ?? option?.id
                            }
                            getOptionLabel={(option) => option.title}
                            onChange={(val) => onChange(val._id ?? val.id)}
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`schedules.${index}.is_pre_test`}
                      render={({ field: { onChange, value } }) => (
                        <FormGroup className="mt-1">
                          <CustomInput
                            value={value}
                            onChange={(e) => onChange(e.target.checked)}
                            inline
                            type="checkbox"
                            label="Pre Test"
                            id={`is_pre_test_${index}`}
                          />
                        </FormGroup>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`schedules.${index}.is_post_test`}
                      render={({ field: { onChange, value } }) => (
                        <FormGroup className="mt-1">
                          <CustomInput
                            value={value}
                            onChange={(e) => onChange(e.target.checked)}
                            inline
                            type="checkbox"
                            label="Post Test"
                            id={`is_post_test_${index}`}
                          />
                        </FormGroup>
                      )}
                    />
                  </>
                )}

                <Controller
                  control={control}
                  name={`schedules.${index}.session`}
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup>
                      <Label>Pilih Pertemuan (Opsional)</Label>
                      <Select
                        {...field}
                        className={classnames("react-select", {
                          "is-invalid": error,
                        })}
                        classNamePrefix="select"
                        options={getScheduleSessionOptions()}
                        isClearable={true}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />

                <Controller
                  isClearable
                  control={control}
                  name={`schedules.${index}.input_topics`}
                  render={({ field, fieldState: { error } }) => (
                    <FormGroup className="mt-1">
                      <Label>
                        Topik <small>(Opsional)</small>
                      </Label>
                      <MultipleInputSelect
                        setValue={setValue}
                        fieldName={field.name}
                        valueName={`schedules.${index}.topics`}
                        currentValue={field.value}
                        changeHandler={field.onChange}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />

                {classroom && classroom?.is_online && (
                  <>
                    <hr className="my-2" />
                    <Controller
                      control={control}
                      name={`schedules.${index}.create_new_zoom_meeting`}
                      render={({
                        field: { onChange },
                        fieldState: { error },
                      }) => (
                        <FormGroup>
                          <Label>Pengaturan Zoom Meeting</Label>
                          <Select
                            className={classnames("react-select", {
                              "is-invalid": error,
                            })}
                            classNamePrefix="select"
                            options={scheduleZoomMeetingOptions}
                            menuPortalTarget={document.body}
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                            onChange={(val) =>
                              handleZoomMeetingSettingsChanged(index, val.value)
                            }
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      )}
                    />

                    {watchedForm?.schedules[index]?.create_new_zoom_meeting ===
                      true && (
                      <>
                        <Controller
                          control={control}
                          name={`schedules.${index}.zoom_host_id`}
                          render={({
                            field: { onChange },
                            fieldState: { error },
                          }) => (
                            <FormGroup>
                              <Label>Akun Host Zoom</Label>
                              <Select
                                className={classnames("react-select", {
                                  "is-invalid": error,
                                })}
                                classNamePrefix="select"
                                options={zoomUsers}
                                isLoading={isLoadingZoomUsers}
                                disabled={isLoadingZoomUsers}
                                isClearable={false}
                                getOptionLabel={(option) =>
                                  `${option.first_name} ${
                                    option?.last_name ?? ""
                                  } (${option.email})`
                                }
                                getOptionValue={(option) => option.id}
                                onChange={(val) =>
                                  handleZoomHostIdChanged(index, val.id)
                                }
                                menuPortalTarget={document.body}
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                              />
                              <FormFeedback>{error?.message}</FormFeedback>
                              {!isSubmitButtonDisabled && selectedZoomUser ? (
                                <p className="text-info">
                                  User type:{" "}
                                  {getZoomUserType(
                                    selectedZoomUser.account.type
                                  )}
                                  , meeting participant quota:
                                  {
                                    selectedZoomUser.settings.feature
                                      .meeting_capacity
                                  }
                                  , max meeting duration:
                                  {getZoomUserMaxMeetingDuration(
                                    selectedZoomUser.account.type
                                  )}
                                </p>
                              ) : null}
                              <hr className="my-1" />
                            </FormGroup>
                          )}
                        />

                        <div className="d-flex mt-1">
                          <Controller
                            control={control}
                            name={`schedules.${index}.is_require_passcode`}
                            render={({ field: { onChange, value } }) => (
                              <FormGroup className="mt-50">
                                <CustomInput
                                  checked={value}
                                  inline
                                  type="checkbox"
                                  label="Passcode"
                                  id={`is_require_passcode_${index}`}
                                  onChange={(e) =>
                                    handleIsRequirePasscodeChanged(
                                      index,
                                      e.target.checked
                                    )
                                  }
                                />
                              </FormGroup>
                            )}
                          />

                          {watchedForm?.schedules[index]
                            ?.is_require_passcode && (
                            <Controller
                              control={control}
                              name={`schedules.${index}.zoom_passcode`}
                              defaultValue=""
                              render={({ field, fieldState: { error } }) => (
                                <FormGroup className="mb-0">
                                  <Input
                                    {...field}
                                    invalid={Boolean(error)}
                                    placeholder=""
                                    maxLength={10}
                                  />
                                  <FormFeedback>{error?.message}</FormFeedback>
                                </FormGroup>
                              )}
                            />
                          )}
                        </div>
                      </>
                    )}

                    {watchedForm?.schedules[index]?.create_new_zoom_meeting ===
                      false && (
                      <>
                        <Controller
                          control={control}
                          name={`schedules.${index}.parent_classroom_id`}
                          render={({
                            field: { onChange },
                            fieldState: { error },
                          }) => (
                            <FormGroup>
                              <Label>Pilih Kelas</Label>
                              <Select
                                className={classnames("react-select", {
                                  "is-invalid": error,
                                })}
                                classNamePrefix="select"
                                options={classrooms}
                                isClearable={false}
                                getOptionLabel={(option) =>
                                  `${option.title} (${option.branch_code})`
                                }
                                getOptionValue={(option) => option._id}
                                onChange={(val) => {
                                  handleGetParentClassSchedules(index, val._id);
                                }}
                                menuPortalTarget={document.body}
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                              />
                              <FormFeedback>{error?.message}</FormFeedback>
                            </FormGroup>
                          )}
                        />

                        {watchedForm?.schedules[index]?.parent_schedules
                          ?.length > 0 && (
                          <Controller
                            control={control}
                            name={`schedules.${index}.parent_schedule_id`}
                            render={({
                              field: { onChange },
                              fieldState: { error },
                            }) => (
                              <FormGroup>
                                <Label>Pilih Jadwal</Label>
                                <Select
                                  className={classnames("react-select", {
                                    "is-invalid": error,
                                  })}
                                  classNamePrefix="select"
                                  options={
                                    watchedForm?.schedules[index]
                                      ?.parent_schedules ?? []
                                  }
                                  getOptionLabel={(option) => `${option.title}`}
                                  getOptionValue={(option) => option._id}
                                  isClearable={false}
                                  onChange={(val) => {
                                    handleSelectParentClassSchedule(
                                      index,
                                      val._id
                                    );
                                  }}
                                  menuPortalTarget={document.body}
                                  styles={{
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  }}
                                />
                                <FormFeedback>{error?.message}</FormFeedback>
                              </FormGroup>
                            )}
                          />
                        )}

                        {watchedForm?.schedules[index]
                          ?.selected_parent_schedule && (
                          <>
                            <FormGroup>
                              <Label>Zoom Meeting ID</Label>
                              <Input
                                disabled={true}
                                value={
                                  watchedForm?.schedules[index]
                                    ?.selected_parent_schedule
                                    ?.online_class_meeting?.zoom_meeting_id ??
                                  "-"
                                }
                              />
                            </FormGroup>
                            <FormGroup>
                              <Label>Zoom Meeting Password</Label>
                              <Input
                                disabled={true}
                                value={
                                  watchedForm?.schedules[index]
                                    ?.selected_parent_schedule
                                    ?.online_class_meeting
                                    ?.zoom_meeting_password ?? "-"
                                }
                              />
                            </FormGroup>
                            <FormGroup>
                              <Label>Zoom Meeting Host Email</Label>
                              <Input
                                disabled={true}
                                value={
                                  watchedForm?.schedules[index]
                                    ?.selected_parent_schedule
                                    ?.online_class_meeting?.zoom_host_email ??
                                  "-"
                                }
                              />
                            </FormGroup>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </Col>

              <Col md={2}>
                <Col md={12}>
                  {fields.length > 1 && (
                    <Button
                      color="danger"
                      className="text-nowrap px-1 mb-1"
                      onClick={() => remove(index)}
                      outline
                    >
                      <Trash size={14} />
                    </Button>
                  )}
                </Col>
              </Col>
              <Col sm={12}>
                <hr />
              </Col>
            </Row>
          ))}

          {/* Add New Button */}
          {!classroom?.is_online && (
            <Button
              className="btn-icon"
              color="primary"
              onClick={() => append(getEmptyForm())}
            >
              <Plus size={14} />
              <span className="align-middle ml-25">Tambah Baru</span>
            </Button>
          )}

          {/* Submit button */}
          {fields.length && (
            <Button
              disabled={isSubmitting || isSubmitButtonDisabled}
              style={{ marginLeft: "1rem" }}
              className="btn-icon ml-24"
              color="success"
              type="submit"
            >
              <span className="align-middle ml-24">
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </span>
            </Button>
          )}
        </Form>
      </CardBody>
    </Card>
  );
};

export default FormAddSchedule;
