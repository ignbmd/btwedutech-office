import Axios from "axios";
import * as yup from "yup";
import Select from "react-select";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Save } from "react-feather";
import Cleave from "cleave.js/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import React, { useState, useRef, useEffect, Fragment } from "react";
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
  Label,
} from "reactstrap";
import {
  normalNumber,
  getLastSegment,
  isObjEmpty,
  inputGroupType,
  isUserHasMarketingRole,
  isBranchUser,
  getUserBranchCode,
} from "../../../utility/Utils";
import axios from "../../../utility/http";
import { programs } from "../../../config/program-cpns";
import SpinnerCenter from "../../core/spinners/Spinner";
import MultipleInputSelect from "../../core/multiple-input-select/MultipleInputSelect";

const tryoutCodeTypes = [
  {
    label: "Tryout Kode dengan batas waktu",
    value: "with_time_limit",
  },
];

if (!isBranchUser()) {
  tryoutCodeTypes.push({
    label: "Tryout Kode tanpa batas waktu",
    value: "without_time_limit",
  });
}

const tryoutSessionTags = ["uka_session_1", "uka_session_2", "uka_session_3"];
const tryoutSessionEndTimes = [
  {
    session: 1,
    time: "09:50:00",
    value: "1_ptk",
  },
  {
    session: 2,
    time: "13:50:00",
    value: "2_ptk",
  },
  {
    session: 3,
    time: "17:50:00",
    value: "3_ptk",
  },
];

const CreateEditTryoutCodeForm = ({ type }) => {
  const [branchs, setBranchs] = useState();
  const [selectedBranchEdit, setSelectedBranchEdit] = useState();
  const [modules, setModules] = useState();
  const [instructions, setInstructions] = useState();
  const [tcCategory, setTcCategory] = useState([]);
  const [currentTryoutCode, setCurrentTryoutCode] = useState(null);
  const [isLoading, setIsLoading] = useState(type === "edit");
  const [isMarketingUserLoggedIn] = useState(isUserHasMarketingRole());
  const [isBranchUserLoggedIn] = useState(isBranchUser());
  const [userBranchCode] = useState(getUserBranchCode());
  const [isFetchingBranch, setIsFetchingBranch] = useState(false);
  const [isFetchingModule, setIsFetchingModule] = useState(false);
  const [isFetchingInstruction, setIsFetchingInstruction] = useState(false);
  const [isFetchingTcCategory, setIsFetchingTcCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSunday, setIsSunday] = useState(false);
  const [canSelectTryoutSession, setCanSelectTryoutSession] = useState(false);
  const [isTryoutHasSession, setIsTryoutHasSession] = useState(false);
  const [tryoutSessions, setTryoutSessions] = useState([]);
  const [tryoutSessionStartDate, setTryoutSessionStartDate] = useState("");
  const [isFetchingTryoutSessions, setIsFetchingTryoutSessions] =
    useState(false);

  const FormSchema = yup.object().shape({
    tryout_code: yup.string().required("Wajib diisi"),
    tryout_name: yup.string().required("Wajib diisi"),
    program: yup.object().typeError("Wajib diisi").required("Wajib diisi"),
    input_tags: yup.string(),
    tags: yup.array().of(yup.string()),
    start_date: yup
      .string()
      .test("start_date_is_required", "Wajib diisi", function (value, context) {
        const program = context?.parent?.program?.slug;
        const isTryoutCodeWithTimeLimit =
          context?.parent?.tryout_code_type?.value === "with_time_limit";
        if (program && isTryoutCodeWithTimeLimit && !value) return false;
        return true;
      }),
    start_exam_date: yup
      .string()
      .test(
        "start_exam_date_is_required",
        "Wajib diisi",
        function (value, context) {
          const program = context?.parent?.program?.slug;
          const isTryoutCodeWithTimeLimit =
            context?.parent?.tryout_code_type?.value === "with_time_limit";
          if (program && isTryoutCodeWithTimeLimit && !value) return false;
          return true;
        }
      ),
    duration: yup.string().required("Wajib diisi"),
    end_date: yup
      .string()
      .test("end_date_is_required", "Wajib diisi", function (value, context) {
        const program = context?.parent?.program?.slug;
        const isTryoutCodeWithTimeLimit =
          context?.parent?.tryout_code_type?.value === "with_time_limit";
        if (program && isTryoutCodeWithTimeLimit && !value) return false;
        return true;
      }),
    tryout_session: yup
      .mixed()
      .test(
        "tryout_session_is_required",
        "Harus diisi",
        function (value, context) {
          if (context.parent.has_session && !value?.session) return false;
          return true;
        }
      )
      .test(
        "tryout_session_should_be_match_with_the_program",
        "Sesi yang dipilih harus sesuai dengan program",
        function (value, context) {
          const program =
            context?.parent?.program?.slug === "skd"
              ? "ptk"
              : context?.parent?.program?.slug;
          if (!isTryoutHasSession) return true;
          if (tryout_session && program !== tryout_session?.program)
            return false;
          return true;
        }
      ),
    status: yup.boolean().required("Wajib diisi"),
    branch_code: yup.object().required("Wajib diisi"),
    module: yup.object().typeError("Wajib diisi").required("Wajib diisi"),
    instruction: yup.object().typeError("Wajib diisi").required("Wajib diisi"),
    is_live: yup.boolean().required("Wajib diisi"),
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
      tryout_code: "",
      tryout_name: "",
      duration: "",
      tryout_code_type: tryoutCodeTypes.find(
        (type) => type.value === "with_time_limit"
      ),
      status: true,
      is_live: false,
      waiting_time: 0,
      start_exam_date: "",
      allow_discussion: false,
      tags: [],
      has_session: false,
      tryout_session: "",
      enable_uka_challenge_session: false,
    },
  });
  const isCanceled = useRef(false);
  const source = Axios.CancelToken.source();

  const {
    program,
    start_exam_date,
    start_date,
    end_date,
    duration,
    is_live,
    tags,
    tryout_session,
    tryout_code_type,
  } = watch();

  const generateDefaultTryoutCode = (length = 8) => {
    let result = "";
    const characters = "ABCDEF0123456789";
    const charactersLength = characters.length;
    Array(length)
      .fill(null)
      .forEach((_) => {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      });
    return result;
  };

  const generateSundayTryoutSessions = (dateObject = new Date()) => {
    try {
      setIsFetchingTryoutSessions(true);
      const dateObjectDay = dateObject.getDay();
      if (dateObjectDay !== 0)
        throw new Error("hari yang dipilih bukan hari minggu");

      const dateObjectDate = dateObject.getDate();
      const dateObjectMonth = dateObject.getMonth();
      const dateObjectYear = dateObject.getFullYear();

      const sessions = [
        {
          session: 1,
          program: "ptk",
          start: {
            hour: 8,
            minute: 0,
            second: 0,
          },
          start_exam: {
            hour: 8,
            minute: 10,
            second: 0,
          },
          end: {
            hour: 9,
            minute: 50,
            second: 0,
          },
          duration_in_minutes: 100,
          label: `PTK Sesi 1 (8:00 - 9:50) WIB`,
          value: "1_ptk",
        },
        {
          session: 2,
          program: "ptk",
          start: {
            hour: 12,
            minute: 0,
            second: 0,
          },
          start_exam: {
            hour: 12,
            minute: 10,
            second: 0,
          },
          end: {
            hour: 13,
            minute: 50,
            second: 0,
          },
          duration_in_minutes: 100,
          label: `PTK Sesi 2 (12:00 - 13:50) WIB`,
          value: "2_ptk",
        },
        {
          session: 3,
          program: "ptk",
          start: {
            hour: 16,
            minute: 0,
            second: 0,
          },
          start_exam: {
            hour: 16,
            minute: 10,
            second: 0,
          },
          end: {
            hour: 17,
            minute: 50,
            second: 0,
          },
          duration_in_minutes: 100,
          label: `PTK Sesi 3 (16:00 - 17:50) WIB`,
          value: "3_ptk",
        },
      ];

      const mappedSessions = sessions.map((value, index) => {
        value.start_date = moment
          .utc([
            dateObjectYear,
            dateObjectMonth,
            dateObjectDate,
            value.start.hour,
            value.start.minute,
            value.start.second,
            0,
          ])
          .format();
        value.start_exam_date = moment
          .utc([
            dateObjectYear,
            dateObjectMonth,
            dateObjectDate,
            value.start_exam.hour,
            value.start_exam.minute,
            value.start_exam.second,
            0,
          ])
          .format();
        value.end_date = moment
          .utc([
            dateObjectYear,
            dateObjectMonth,
            dateObjectDate,
            value.end.hour,
            value.end.minute,
            value.end.second,
            0,
          ])
          .format();
        return value;
      });
      return mappedSessions;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setIsFetchingTryoutSessions(false);
    }
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
        if (isBranchUserLoggedIn)
          setBranchs([
            branchData.find(
              (branch) => branch.code === JSON.parse(userBranchCode)
            ),
          ]);
        else setBranchs(branchData);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingBranch(false);
      }
    }
  };

  const getInstruction = async (program) => {
    try {
      setIsFetchingInstruction(true);
      const response = await axios.get(`/exam-cpns/instruction/${program}`, {
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

  const getModule = async (program) => {
    try {
      setIsFetchingModule(true);
      const url = "/exam-cpns/module";
      const queryParams = { program, limit: 1000, pages: 1 };
      if (isMarketingUserLoggedIn) queryParams.tags = ["marketing"];
      if (isBranchUserLoggedIn)
        queryParams.branch_code = JSON.parse(userBranchCode);
      // const url = isMarketingUserLoggedIn
      //   ? `/exam/module/program/${program}/tag/marketing`
      //   : `/exam/module/program/${program}`;
      const response = await axios.get(url, {
        cancelToken: source.token,
        params: queryParams,
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

  const loadEdit = async () => {
    const data = await getCurrentTryoutCode();
    const currentTryoutCodeStartDate = data.packages?.start_date
      ? moment(data.packages?.start_date).utcOffset("+0700")
      : "";
    const currentTryoutCodeStartExamDate = data?.start_exam_date
      ? moment(data?.start_exam_date).utcOffset("+0700")
      : "";
    const currentTryoutCodeEndDate = data.packages?.end_date
      ? moment(data.packages?.end_date).utcOffset("+0700")
      : "";
    const currentTryoutCodeDuration = data.packages?.duration;
    setValue("tryout_code", data.tryout_code);
    setValue("tryout_name", data.packages?.title);
    setValue(
      "program",
      programs.find((program) => program?.slug == data.program)
    );
    // Determine tryout code type
    const calculatedTryoutCodeDuration = currentTryoutCodeEndDate
      ? moment
          .duration(
            currentTryoutCodeEndDate.diff(currentTryoutCodeStartExamDate)
          )
          .asMinutes()
      : null;
    if (currentTryoutCodeDuration !== calculatedTryoutCodeDuration) {
      setValue(
        "tryout_code_type",
        tryoutCodeTypes.find((type) => type.value === "without_time_limit")
      );
    } else {
      setValue(
        "tryout_code_type",
        tryoutCodeTypes.find((type) => type.value === "with_time_limit")
      );
    }
    setValue("tags", data?.packages?.tags ?? []);
    setValue(
      "start_date",
      currentTryoutCodeStartDate
        ? currentTryoutCodeStartDate?.format("YYYY-MM-DDTHH:mm")
        : ""
    );
    setValue(
      "end_date",
      currentTryoutCodeEndDate
        ? currentTryoutCodeEndDate.format("YYYY-MM-DDTHH:mm")
        : ""
    );
    setValue(
      "start_exam_date",
      currentTryoutCodeStartExamDate
        ? currentTryoutCodeStartExamDate?.format("YYYY-MM-DDTHH:mm")
        : ""
    );
    setValue("duration", currentTryoutCodeDuration);
    setValue("status", data.packages?.status);
    setValue("module", data.packages?.modules);
    setValue("instruction", data.packages?.instructions);
    setValue("is_live", data.is_live);
    setValue("allow_discussion", data.packages?.allow_discussion);
    setValue("legacy_task_id", data.packages?.legacy_task_id);
    setSelectedBranchEdit(data.packages?.branch_code);
    setValue("session", data?.session ?? "");
    setValue("description", data?.description ?? "");

    const packageTags = [...data?.packages?.tags];
    const tryoutCodeSession = packageTags.filter((tag) =>
      tryoutSessionTags.includes(tag)
    );
    const tryoutCodeEndDate = tryoutSessionEndTimes.find((tryout) => {
      return data?.packages?.end_date?.includes(tryout.time);
    });
    const hasSessionTags = tryoutCodeSession.length > 0;
    const hasSessionStartTime = !!tryoutCodeEndDate;
    const currentTryoutCodeStartDateObject = new Date(
      data?.packages?.start_date
    );
    const currentTryoutCodeDay = currentTryoutCodeStartDateObject.getDay();
    const currentTryoutDayIsSunday = currentTryoutCodeDay === 0;
    if (currentTryoutDayIsSunday) {
      setIsSunday(true);
      setCanSelectTryoutSession(true);
    }
    if (hasSessionTags && data?.is_live) {
      setValue("enable_uka_challenge_session", true);
    }
    if (hasSessionTags || (hasSessionStartTime && currentTryoutDayIsSunday)) {
      setIsTryoutHasSession(true);
      setTryoutSessionStartDate(
        new Date(
          moment(data.packages?.start_date)
            .utcOffset("+0700")
            .format("YYYY-MM-DDTHH:mm")
        )
      );
    }
    setIsLoading(false);
  };

  const getCurrentTryoutCode = async () => {
    try {
      const id = getLastSegment();
      const response = await axios.get(`/exam-cpns/tryout-code/detail/${id}`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const tryout = data?.data ?? [];
      setCurrentTryoutCode(tryout);
      return tryout;
    } catch (error) {
      return null;
    }
  };

  const convertUTC = (date) => {
    return moment.utc(date).subtract(7, "hour").format();
  };

  const getPayload = () => {
    const form = getValues();
    let session = form.session ? form?.session : "";
    let description = form.description ? form?.description : "";
    if (form.is_live == false) {
      session = "";
      description = "";
    }
    const tc_category_id = form.tc_category_id?.id
      ? form.tc_category_id?.id ?? null
      : null;
    let start = "";
    let end = null;
    let exam_start = "";
    let duration = form.duration;
    form.start_date.length > 0
      ? (start = convertUTC(form.start_date))
      : (start = null);
    form.end_date.length > 0 ? (end = convertUTC(form.end_date)) : (end = null);
    form.start_exam_date && form.start_exam_date.length > 0
      ? (exam_start = convertUTC(form.start_exam_date))
      : (exam_start = null);

    const payload = {
      tryout_code: form.tryout_code,
      title: form.tryout_name,
      start_date: start,
      start_exam_date: exam_start,
      end_date: end,
      branch_code: form.branch_code?.code,
      is_live: form.is_live,
      allow_discussion: form.allow_discussion,
      modules_id: form.module?.id,
      modules_code: form.module?.module_code,
      legacy_task_id: form.legacy_task_id,
      duration: duration,
      status: form.status,
      privacy_type: "PUBLIC",
      instructions_id: form.instruction?.id,
      program: form.program?.slug,
      cancelToken: source.token,
      tc_category_id: tc_category_id,
      session: session,
      intervals: form.intervals,
      description: description,
      tags: form?.tags ?? [],
      tryout_session: form?.tryout_session,
      enable_uka_challenge_session: form?.enable_uka_challenge_session,
    };
    return payload;
  };

  const redirectToIndex = () => {
    window.location.href = "/ujian-cpns/tryout-kode";
  };

  const processFormCreate = async () => {
    setIsSubmitting(true);
    const payload = getPayload();
    try {
      const response = await axios.post(
        "/exam-cpns/tryout-code/create",
        payload
      );
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const processFormUpdate = async () => {
    setIsSubmitting(true);
    const payload = getPayload();
    payload.id = parseInt(getLastSegment());
    try {
      const response = await axios.put(
        "/exam-cpns/tryout-code/update",
        payload
      );
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const onChangeTryoutCode = (event, changeForm) => {
    const value = event.target.value;
    const allowedValue = /^[a-zA-Z0-9_]*$/;
    if (!allowedValue.test(value)) return null;
    changeForm(value);
  };

  const submitHandler = () => {
    trigger();
    if (isObjEmpty(errors)) {
      if (type === "edit") {
        processFormUpdate();
      } else {
        processFormCreate();
      }
    }
  };

  useEffect(() => {
    if (branchs && type === "edit") {
      setValue(
        "branch_code",
        branchs.find((branch) => branch.code === selectedBranchEdit)
      );
    }
  }, [branchs, selectedBranchEdit]);

  useEffect(() => {
    setValue("start_date", "");
    setValue("start_exam_date", "");
    setValue("end_date", "");
    setValue("duration", "");
    setValue("module", "");
    setValue("instruction", "");
    setModules([]);
    setInstructions([]);
    if (program?.slug) {
      getModule(program?.slug);
      getInstruction(program?.slug);
      if (program?.slug !== "skd") {
        setValue(
          "tryout_code_type",
          tryoutCodeTypes.find((tryout) => tryout.value === "with_time_limit")
        );
      }
      setCanSelectTryoutSession(
        ["skd"].some((value) => value === program?.slug && isSunday)
      );
      setIsTryoutHasSession(false);
      setValue("tryout_session", "");
    }
  }, [program?.slug]);

  useEffect(() => {
    if (type === "edit") {
      loadEdit();
    }
  }, []);

  useEffect(() => {
    if (isTryoutHasSession || isLoading) return;
    if (start_exam_date && duration) {
      const form = getValues();
      const endDate = moment(form.start_exam_date)
        .add(form.duration, "minute")
        .format("YYYY-MM-DDTHH:mm");
      setValue("end_date", endDate);
    }
  }, [start_exam_date, duration]);

  useEffect(() => {
    if (tryout_code_type.value === "with_time_limit" || isLoading) return;
    if (start_date && duration) {
      const form = getValues();
      const endDate = moment(form.start_date)
        .add(form.duration, "minute")
        .format("YYYY-MM-DDTHH:mm");
      setValue("end_date", endDate);
    }
  }, [start_date, duration]);

  useEffect(() => {
    let code = generateDefaultTryoutCode();
    getBranchs();
    while (!isNaN(code)) {
      code = generateDefaultTryoutCode();
    }
    setValue("tryout_code", code);
  }, []);

  useEffect(() => {
    if (!canSelectTryoutSession) {
      setValue("tryout_session", "");
      setTryoutSessionStartDate("");
      setTryoutSessions([]);
      return;
    }

    if (isTryoutHasSession) {
      // Reset previous values
      setValue("start_exam_date", "");
      setValue("end_date", "");
      setValue("duration", "");
    }

    const startDateObject = new Date(start_date);
    setTryoutSessionStartDate(startDateObject);
  }, [canSelectTryoutSession]);

  useEffect(() => {
    if (!tryoutSessionStartDate) return;
    if (["skd"].some((value) => value === program?.slug))
      setTryoutSessions(generateSundayTryoutSessions(tryoutSessionStartDate));
    return;
  }, [tryoutSessionStartDate]);

  useEffect(() => {
    if (type !== "edit" || !tryoutSessions.length) return;
    const packageTags = tags ?? [];
    const tryoutCodeSession = packageTags.filter((tag) =>
      tryoutSessionTags.includes(tag)
    );
    const tryoutCodeEndDate = tryoutSessionEndTimes.find((tryout) => {
      return moment(end_date).format().includes(tryout.time);
    });
    if (tryoutCodeSession.length > 0) {
      const selectedSession = tryoutCodeSession[tryoutCodeSession.length - 1];
      const sessionNumber = +selectedSession.split("_")[2] ?? 1;
      const selectedProgram = program?.slug === "skd" ? "ptk" : program?.slug;
      setValue(
        "tryout_session",
        tryoutSessions.find(
          (value) =>
            value.session === sessionNumber && value.program === selectedProgram
        )
      );
      return;
    }
    if (!!tryoutCodeEndDate) {
      const selectedSession = tryoutSessionEndTimes.find((tryout) => {
        return tryoutCodeEndDate.time.includes(tryout.time);
      });
      const selectedProgram = program?.slug === "skd" ? "ptk" : program?.slug;
      setValue(
        "tryout_session",
        tryoutSessions.find(
          (session) =>
            session.value === selectedSession.value &&
            session.program === selectedProgram
        )
      );
    }
    return;
  }, [tryoutSessions]);

  useEffect(() => {
    if (!tryout_session) {
      setValue("is_live", false);
      setValue("enable_uka_challenge_session", false);
      setIsTryoutHasSession(false);
      return;
    }
    const formattedStartDate = moment(tryout_session.start_date)
      .subtract("8", "hour")
      .format("YYYY-MM-DDTHH:mm");
    const formattedStartExamDate = moment(tryout_session.start_exam_date)
      .subtract("8", "hour")
      .format("YYYY-MM-DDTHH:mm");
    const formattedEndDate = moment(tryout_session.end_date)
      .subtract("8", "hour")
      .format("YYYY-MM-DDTHH:mm");
    setValue("start_date", formattedStartDate);
    setValue("start_exam_date", formattedStartExamDate);
    setValue("end_date", formattedEndDate);
    setValue("duration", tryout_session.duration_in_minutes);
    setIsTryoutHasSession(true);
    setValue(
      "tryout_code_type",
      tryoutCodeTypes.find((type) => type.value === "with_time_limit")
    );
  }, [tryout_session]);

  useEffect(() => {
    // Reset value every tryout code type changes
    setValue("start_exam_date", "");
    setValue("end_date", "");
    setValue("duration", "");
    setValue("is_live", false);
  }, [tryout_code_type?.value]);

  useEffect(() => {
    if (tryout_session && !is_live)
      setValue("enable_uka_challenge_session", false);
  }, [is_live]);

  return (
    <Card>
      <CardBody className={classnames(isSubmitting && "block-content")}>
        {isLoading ? (
          <SpinnerCenter />
        ) : (
          <Form onSubmit={handleSubmit(submitHandler)}>
            <Col md={6} className={classnames("mt-2 pl-0")}>
              <Controller
                name="tryout_code"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, onChange, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Kode Tryout</Label>
                      <Input
                        {...rest}
                        id="tryout_code"
                        disabled={type === "edit"}
                        onChange={(event) =>
                          onChangeTryoutCode(event, onChange)
                        }
                        innerRef={ref}
                        invalid={error && true}
                      />
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

              {/* <Controller
                name="tc_category_id"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">
                        Pilih Kategori (Opsional)
                      </Label>
                      <Select
                        {...field}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                        isSearchable={false}
                        isLoading={isFetchingTcCategory}
                        options={tcCategory}
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
                name="group"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">
                        Nama Group (Opsional)
                      </Label>
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">
                          TO-CODE-
                        </InputGroupAddon>
                        <Cleave
                          {...rest}
                          options={inputGroupType}
                          id="group"
                          innerRef={ref}
                          onKeyPress={(event) => {
                            var regex = new RegExp("^[a-zA-Z0-9-]+$");
                            var key = String.fromCharCode(
                              !event.charCode ? event.which : event.charCode
                            );
                            if (!regex.test(key)) {
                              event.preventDefault();
                              return false;
                            }
                          }}
                          className={classnames("form-control", {
                            "is-invalid": error,
                          })}
                          onChange={(e) => field.onChange(e.target.rawValue)}
                          placeholder="Inputkan Nama Group"
                        />
                      </InputGroup>
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              /> */}

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
                        isDisabled={type === "edit"}
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
                name="module"
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
                name="tryout_code_type"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Tipe Tryout Kode</Label>
                      <Select
                        {...field}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9999,
                          }),
                        }}
                        isSearchable={false}
                        isDisabled={
                          isTryoutHasSession ||
                          (program?.slug && program?.slug !== "skd")
                        }
                        options={tryoutCodeTypes}
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
                name="start_date"
                control={control}
                defaultValue=""
                render={({
                  field: { onChange, ref, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <Label className="form-label" id="start-date-label">
                      Tanggal Mulai (WIB)
                      {tryout_code_type.value === "without_time_limit"
                        ? "(Opsional)"
                        : ""}
                    </Label>
                    <Input
                      type="datetime-local"
                      ref={ref}
                      disabled={tryout_session}
                      className={classnames("form-control", {
                        "is-invalid": error,
                      })}
                      value={value}
                      onChange={(event) => {
                        const selectedDate = new Date(event.target.value);
                        const day = selectedDate.getDay();
                        const is_sunday = day === 0;
                        const is_tryout_session_selected = !!tryout_session;
                        if (event.length === 0) onChange("");
                        else onChange(event);
                        setIsSunday(is_sunday);
                        setCanSelectTryoutSession(
                          ["skd"].some(
                            (value) => value === program?.slug && is_sunday
                          )
                        );
                        setValue(
                          "has_session",
                          ["skd"].some((value) => value === program?.slug) &&
                            is_sunday &&
                            is_tryout_session_selected
                        );
                      }}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                )}
              />

              {canSelectTryoutSession &&
              tryout_code_type.value === "with_time_limit" ? (
                <Controller
                  name="tryout_session"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup className="flex-fill">
                        <Label className="form-label">
                          Sesi Tryout (WIB) (Opsional)
                        </Label>
                        <Select
                          {...field}
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              zIndex: 9999,
                            }),
                          }}
                          isSearchable
                          isClearable
                          options={tryoutSessions}
                          isLoading={isFetchingTryoutSessions}
                          isDisabled={isFetchingTryoutSessions}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": error && true,
                          })}
                          onChange={(event) => {
                            field.onChange(event);
                            if (!event) {
                              setValue("start_date", "");
                              setValue("start_exam_date", "");
                              setValue("duration", "");
                              setValue("end_date", "");
                              setValue("has_session", false);
                              setIsSunday(false);
                              setIsTryoutHasSession(false);
                              setCanSelectTryoutSession(false);
                            }
                          }}
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
              ) : null}

              {tryout_code_type.value === "with_time_limit" &&
              !isTryoutHasSession ? (
                <Controller
                  name="start_exam_date"
                  control={control}
                  defaultValue=""
                  render={({
                    field: { onChange, ref, value },
                    fieldState: { error },
                  }) => (
                    <FormGroup>
                      <Label className="form-label">
                        Tanggal Mengerjakan (WIB)
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
              ) : null}

              {!isTryoutHasSession ? (
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
                            options={normalNumber}
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
              ) : null}

              {!isTryoutHasSession ? (
                <Controller
                  name="end_date"
                  control={control}
                  defaultValue=""
                  render={({
                    field: { onChange, ref, value },
                    fieldState: { error },
                  }) => (
                    <FormGroup>
                      <Label className="form-label">
                        Tanggal Selesai (WIB)
                        {tryout_code_type.value === "without_time_limit"
                          ? "(Opsional)"
                          : ""}
                      </Label>
                      <Input
                        type="datetime-local"
                        ref={ref}
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        disabled={tryout_code_type?.value === "with_time_limit"}
                        value={value}
                        onChange={(date) => {
                          date.length === 0 ? onChange("") : onChange(date);
                        }}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  )}
                />
              ) : null}

              <Controller
                name="branch_code"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill mt-1">
                      <Label className="form-label">Cabang</Label>
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

              <Controller
                name="status"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, value: isActive, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <CustomInput
                        {...rest}
                        className="mt-50"
                        innerRef={ref}
                        type="switch"
                        name="status"
                        id="status"
                        checked={isActive}
                        label={isActive ? "Aktif" : "Tidak Aktif"}
                        inline
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              <Controller
                name="allow_discussion"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, value: isActive, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <CustomInput
                        {...rest}
                        className="mt-50"
                        innerRef={ref}
                        type="switch"
                        name="allow_discussion"
                        id="allow_discussion"
                        checked={isActive}
                        label="Akses Pembahasan"
                        inline
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              <Controller
                name="is_live"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, value: isActive, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <CustomInput
                        {...rest}
                        className="mt-50"
                        innerRef={ref}
                        type="switch"
                        name="is_live"
                        id="is_live"
                        checked={
                          tryout_code_type?.value === "without_time_limit"
                            ? false
                            : program?.slug == "tps" ||
                              program?.slug == "tps-2022"
                            ? true
                            : isActive
                        }
                        disabled={
                          tryout_code_type?.value === "without_time_limit"
                        }
                        label="Live Ranking"
                        inline
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              {!is_live ? null : (
                <>
                  <Controller
                    name="session"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">Sesi</Label>
                          <Input
                            {...rest}
                            id="session"
                            innerRef={ref}
                            invalid={error && true}
                            placeholder="Inputkan Nama Sesi"
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />

                  <Controller
                    name="description"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, onChange, ...rest } = field;
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">Deskripsi</Label>
                          <textarea
                            {...rest}
                            id="description"
                            onChange={(event) => onChange(event.target.value)}
                            innerRef={ref}
                            className={classnames("form-control", {
                              "is-invalid": error,
                            })}
                            value={field.value}
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />
                </>
              )}

              {tryout_session ? (
                <Controller
                  name="enable_uka_challenge_session"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, value: isActive, ...rest } = field;
                    return (
                      <FormGroup className="flex-fill">
                        <CustomInput
                          {...rest}
                          className="mt-50"
                          innerRef={ref}
                          type="switch"
                          disabled={!is_live}
                          checked={isActive}
                          name="enable_uka_challenge_session"
                          id="enable_uka_challenge_session"
                          label="Gabung Sesi Live Ranking dengan UKA Challenge"
                          inline
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
              ) : null}

              <div className="text-right mt-4">
                <Button type="submit" color="gradient-success">
                  {isSubmitting ? (
                    "Sedang Menyimpan..."
                  ) : (
                    <>
                      <Save size={14} /> Simpan
                    </>
                  )}
                </Button>
              </div>
            </Col>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

CreateEditTryoutCodeForm.propTypes = {
  type: PropTypes.oneOf(["create", "edit"]),
};

export default CreateEditTryoutCodeForm;
