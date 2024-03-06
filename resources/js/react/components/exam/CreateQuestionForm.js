import Axios from "axios";
import * as yup from "yup";
import { nanoid } from "nanoid";
import { Fragment, useCallback, useRef } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import classnames from "classnames";
import React, { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import withReactContent from "sweetalert2-react-content";
import { Minus, Plus, Save, Trash2 } from "react-feather";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Form,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormGroup,
  CustomInput,
  Input,
  Label,
  Badge,
  Row,
  Col,
  Button,
  FormFeedback,
} from "reactstrap";

import { normalNumber, decimalNumber, isObjEmpty } from "../../utility/Utils";
import MultipleInputSelect from "../core/multiple-input-select/MultipleInputSelect";
import { programs } from "../../config/programs";
import {
  getCategoryByProgram,
  getSubCategoryByCategoryId,
  saveQuestions,
} from "../../services/exam/question";
import { question_type } from "../../config/question_type";
import CustomCKEditor from "../core/ckeditor/CustomCKEditor";
import "./QuestionForm.css";
import Cleave from "cleave.js/react";
import clsx from "clsx";

const initialModuleTypeOptions = [
  {
    label: "Pilihan Ganda",
    value: "MULTIPLE_CHOICES",
  },
  {
    label: "Esai",
    value: "ESSAYS",
  },
];

const checkboxModuleTypeOption = { label: "Checkbox", value: "CHECKBOX" };
const statementModuleTypeOption = {
  label: "Benar-Salah",
  value: "PERNYATAAN",
};
const isianModuleTypeOption = {
  label: "Isian",
  value: "NUMBER",
};

const moduleTypeAnswerLabels = {
  MULTIPLE_CHOICES: "Jawaban Pilihan Ganda",
  ESSAYS: "Jawaban Esai",
  CHECKBOX: "Jawaban Checkbox",
  PERNYATAAN: "Pernyataan",
  NUMBER: "Jawaban Isian",
  DEFAULT: "Jawaban",
};

const radioOptionClassNames = {
  checkedTableCell: "chosen-cell",
  uncheckedTableCell: null,
  checkedKeyAnswerIcon: "chosen-key",
  uncheckedKeyAnswerIcon: "unchosen-key",
};

const questionOptionSchema = () => {
  return yup.array().of(
    yup.object().shape({
      option: yup.string().required(),
      option_choice: yup.string().required(),
      value: yup
        .string()
        .test("value_is_required", "", function (value, context) {
          const options = context?.from[1]?.value?.question_options;
          const checkType = context?.from[1]?.value?.answer_type.value;
          if (checkType === "MULTIPLE_CHOICES" || checkType === "ESSAYS") {
            return value;
          }
          return true;
        })
        .test("value_checkbox_is_required", "", function (value, context) {
          const options = context?.from[1]?.value?.question_options;
          const checkType = context?.from[1]?.value?.answer_type.value;
          if (checkType !== "CHECKBOX") {
            return true;
          }
          const isAllOptionsNotChecked = options.every(function (option) {
            return !!option.value == false;
          });
          return !isAllOptionsNotChecked;
        })
        .test("value_statement_is_required", "", function (value, context) {
          const options = context?.from[1]?.value?.question_options;
          const checkType = context?.from[1]?.value?.answer_type.value;
          if (checkType !== "PERNYATAAN") {
            return true;
          }
          const isAllOptionSelected = options.every(function (option) {
            return option.value !== "";
          });
          return isAllOptionSelected;
        })
        .test(
          "value_number_is_required",
          "Harus diisi/Tidak boleh 0",
          function (value, context) {
            const checkType = context?.from[1]?.value?.answer_type.value;
            if (checkType === "NUMBER" && !+value) {
              return false;
            }
            return true;
          }
        ),
    })
  );
};

const FormSchema = yup.object().shape({
  question_type: yup.object().required(),
  answer_type: yup.object().required(),
  question_category: yup.object().required(),
  sub_category: yup.object().required(),
  question: yup.string().required(),
  question_options: questionOptionSchema(),
  explanation: yup.string().required(),
  answer_header_true: yup
    .string()
    .test("check_answer_header_true", "", function (value, context) {
      const checkType = context?.from[0]?.value?.answer_type?.value;
      if (checkType !== "PERNYATAAN") {
        return true;
      }
      if (!value) {
        return false;
      }
      return true;
    }),
  answer_header_false: yup
    .string()
    .test("check_answer_header_false", "", function (value, context) {
      const checkType = context?.from[0]?.value?.answer_type?.value;
      if (checkType !== "PERNYATAAN") {
        return true;
      }
      if (!value) {
        return false;
      }
      return true;
    }),
});

const MySwal = withReactContent(Swal);

const CreateQuestionForm = () => {
  const [questionDraft] = useState(() =>
    localStorage.getItem("questions-draft")
  );
  const [moduleTypeOptions, setModuleTypeOptions] = useState(
    initialModuleTypeOptions
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCategory, setIsFetchingCategory] = useState(false);
  const [categories, setCategories] = useState();
  const [isFetchingSubCategories, setIsFetchingSubCategories] = useState({});
  const [subCategories, setSubCategories] = useState({});
  const fieldSchema = yup.object().shape({
    program: yup.object().required(),
    questions: yup
      .array()
      .of(FormSchema)
      .required("Pertanyaan Tidak Boleh Kosong")
      .min(1, "Minimal Membuat 1 Pertanyaan"),
  });

  const getEmptyOptions = (option = "A") => {
    return {
      uid: nanoid(),
      option: option,
      option_choice: "",
      value: "",
    };
  };

  const getEmptyForm = () => {
    return {
      id: nanoid(),
      answer_type: moduleTypeOptions[0],
      question_options: [
        getEmptyOptions("A"),
        getEmptyOptions("B"),
        getEmptyOptions("C"),
        getEmptyOptions("D"),
        getEmptyOptions("E"),
      ],
      explanation: "",
      explanation_media: "",
      answer_header_true: "",
      answer_header_false: "",
    };
  };

  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    mode: "all",
    resolver: yupResolver(fieldSchema),
    defaultValues: questionDraft
      ? JSON.parse(questionDraft)
      : {
          program: { name: "SKD", slug: "skd" },
          questions: [getEmptyForm()],
        },
  });
  const isCanceled = useRef(false);
  const isDefaultSet = useRef(false);

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const { program, questions } = watch();
  const source = Axios.CancelToken.source();

  window.openFileManager = (e, key) => {
    e.preventDefault();
    window.open(
      `/file-manager?bucket=video&key=${key}`,
      "Manajer File",
      "height=600;weight=800"
    );
  };

  window.setFileAttachment = (key, url) => {
    let path = new URL(url).pathname;
    path = path.substr(path.indexOf("/") + 1);
    setValue(key, path);
  };

  const getModuleTypeAnswerLabel = (index) => {
    const currentAnswerType = getValues(`questions.${index}.answer_type`);
    return moduleTypeAnswerLabels[currentAnswerType.value]
      ? moduleTypeAnswerLabels[currentAnswerType.value]
      : moduleTypeAnswerLabels["DEFAULT"];
  };

  const fetchQuestionOptionsComponent = useCallback(
    (questionIndex, questionOptions) => {
      const currentAnswerType = getValues(
        `questions.${questionIndex}.answer_type`
      );

      switch (currentAnswerType.value) {
        case "CHECKBOX":
          return (
            <CheckboxQuestion
              questionIndex={questionIndex}
              questionOptions={questionOptions}
            />
          );
        case "PERNYATAAN":
          return (
            <StatementQuestion
              questionIndex={questionIndex}
              questionOptions={questionOptions}
            />
          );
        case "NUMBER":
          return (
            <IsianOptionsQuestion
              questionIndex={questionIndex}
              questionOptions={questionOptions}
            />
          );
        default:
          return (
            <MultipleOptionsQuestion
              questionIndex={questionIndex}
              questionOptions={questionOptions}
            />
          );
      }
    },
    [questions, program.slug]
  );

  const initStatementOptions = (questionIndex, optionIndex) => {
    const firstRadioOption = document.getElementById(
      `questions.${questionIndex}.question_options.${optionIndex}.value_0`
    );

    const isFirstRadioOptionChecked = firstRadioOption
      ? firstRadioOption.checked
      : false;

    const secondRadioOption = document.getElementById(
      `questions.${questionIndex}.question_options.${optionIndex}.value_1`
    );
    const isSecondRadioOptionChecked = secondRadioOption
      ? secondRadioOption.checked
      : false;

    return {
      firstRadioOption,
      isFirstRadioOptionChecked,
      secondRadioOption,
      isSecondRadioOptionChecked,
    };
  };

  const MultipleOptionsQuestion = ({ questionIndex, questionOptions }) => {
    return (
      <>
        <Label className="form-label">
          {getModuleTypeAnswerLabel(questionIndex)}
        </Label>
        {questionOptions.map((fieldOption, optionIndex) => (
          <Fragment key={fieldOption.uid}>
            <div className="d-flex mt-1">
              <Controller
                name={`questions.${questionIndex}.question_options.${optionIndex}.option`}
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup
                      style={{
                        width: "50px",
                        minWidth: "50px",
                      }}
                      className="mr-1 mb-0"
                    >
                      <Input
                        {...rest}
                        readOnly
                        ref={ref}
                        invalid={error && true}
                        className="text-center h-100"
                      />
                    </FormGroup>
                  );
                }}
              />
              <div className="flex-fill mr-1 answer-question-create">
                <Controller
                  name={`questions.${questionIndex}.question_options.${optionIndex}.option_choice`}
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <div
                      className={classnames(
                        error && "custom-is-invalid rounded"
                      )}
                    >
                      <CustomCKEditor
                        type="inline"
                        initData={value}
                        data={value}
                        onChange={onChange}
                        style={{
                          padding: "5px",
                          height: "100%",
                          border: "1px solid #d8d6de",
                          borderRadius: "0.357rem",
                        }}
                        config={{
                          title: "Inputkan Opsi Jawaban",
                          placeholder: "Inputkan Opsi Jawaban",
                          editorplaceholder: "Inputkan Opsi Jawaban",
                          extraPlugins: "sourcedialog",
                        }}
                      />
                    </div>
                  )}
                />
              </div>
              <Controller
                name={`questions.${questionIndex}.question_options.${optionIndex}.value`}
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup
                      className="mb-0 mr-1"
                      style={{
                        minWidth: "50px",
                      }}
                    >
                      <Cleave
                        {...field}
                        options={
                          program?.slug == "tni-polri"
                            ? decimalNumber
                            : normalNumber
                        }
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        onChange={(e) => field.onChange(e.target.rawValue)}
                        value={field.value}
                        placeholder="Bobot Nilai"
                        style={{ border: error ? "1px solid red" : undefined }}
                      />
                      {/* <FormFeedback>{error?.message}</FormFeedback> */}
                    </FormGroup>
                  );
                }}
              />
              {questionOptions.length > 1 && (
                <Button
                  color="transparent"
                  className="p-1 bg-light-danger border-0"
                  onClick={() =>
                    handleRemoveOptionPerNumber(questionIndex, optionIndex)
                  }
                >
                  <Minus size={14} />
                </Button>
              )}
            </div>
          </Fragment>
        ))}
        <Button
          size="sm"
          color="primary"
          className="mt-2 ml-auto d-block"
          onClick={() => handleAddOptionPerNumber(questionIndex)}
        >
          <Plus size={14} /> Tambah Opsi
        </Button>
      </>
    );
  };

  const CheckboxQuestion = ({ questionIndex, questionOptions }) => {
    return (
      <>
        <div className="d-flex mt-1" style={{ gap: "6rem" }}>
          <Label className="form-label" style={{ width: "67%" }}>
            {getModuleTypeAnswerLabel(questionIndex)}
          </Label>
          <Label className="form-label">Kunci Jawaban</Label>
          <Label className="form-label"></Label>
        </div>
        {questionOptions.map((fieldOption, optionIndex) => (
          <Fragment key={fieldOption.uid}>
            <div
              className="d-flex align-items-center mt-1"
              style={{ gap: "5rem" }}
            >
              {/* <Controller
                name={`questions.${questionIndex}.question_options.${optionIndex}.option`}
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup
                      style={{
                        width: "50px",
                        minWidth: "50px",
                      }}
                      className="mr-1 d-none mb-0"
                    >
                      <Input
                        {...rest}
                        readOnly
                        ref={ref}
                        invalid={error && true}
                        className="text-center h-100"
                      />
                    </FormGroup>
                  );
                }}
              /> */}
              <div className="flex-fill answer-question-create">
                <Controller
                  name={`questions.${questionIndex}.question_options.${optionIndex}.option_choice`}
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <div
                      className={classnames(
                        error && "custom-is-invalid rounded"
                      )}
                    >
                      <CustomCKEditor
                        initData={value}
                        data={value}
                        onChange={onChange}
                        style={{
                          padding: "5px",
                          height: "100%",
                          border: "1px solid #d8d6de",
                          borderRadius: "0.357rem",
                        }}
                        config={{
                          title: "Inputkan Opsi Jawaban",
                          placeholder: "Inputkan Opsi Jawaban",
                          editorplaceholder: "Inputkan Opsi Jawaban",
                        }}
                      />
                    </div>
                  )}
                />
              </div>
              <Controller
                name={`questions.${questionIndex}.question_options.${optionIndex}.value`}
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  const isChecked = getValues(
                    `questions.${questionIndex}.question_options.${optionIndex}.value`
                  );
                  const isCheckedClassName = isChecked ? "checked" : "";
                  return (
                    <FormGroup className="mb-0">
                      <div
                        className={`form-check custom-option custom-option-basic ${isCheckedClassName}`}
                      >
                        <label
                          className="form-check-label custom-option-content"
                          htmlFor={`questions.${questionIndex}.question_options.${optionIndex}.value`}
                          style={{
                            border: error ? "1px solid red" : undefined,
                          }}
                        ></label>
                        <input
                          {...rest}
                          ref={ref}
                          className="form-check-input"
                          type="checkbox"
                          id={`questions.${questionIndex}.question_options.${optionIndex}.value`}
                          name={`questions.${questionIndex}.question_options.${optionIndex}.value`}
                          onChange={(event) => {
                            setValue(
                              `questions.${questionIndex}.question_options.${optionIndex}.value`,
                              event.target.checked
                            );
                            const parentNode = event.target.parentNode;
                            parentNode.classList.remove("checked");
                            if (event.target.checked)
                              parentNode.classList.add("checked");
                          }}
                          checked={isChecked}
                        />
                      </div>
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />
              {questionOptions.length > 1 && (
                <Button
                  color="transparent"
                  className="p-1 bg-light-danger border-0"
                  onClick={() =>
                    handleRemoveOptionPerNumber(questionIndex, optionIndex)
                  }
                >
                  <Minus size={14} />
                </Button>
              )}
            </div>
          </Fragment>
        ))}
        <Button
          size="sm"
          color="primary"
          className="mt-2 ml-auto d-block"
          onClick={() => handleAddOptionPerNumber(questionIndex)}
        >
          <Plus size={14} /> Tambah Opsi
        </Button>
      </>
    );
  };

  const StatementQuestion = ({ questionIndex, questionOptions }) => {
    return (
      <>
        <div
          className="d-flex align-items-center mt-1"
          style={{ gap: "3.5rem" }}
        >
          <Label
            className="form-label"
            style={{ width: "67%", maxWidth: "67%" }}
          >
            {getModuleTypeAnswerLabel(questionIndex)}
          </Label>
          <div className="mb-0 form-group">
            <table className="w-100">
              <thead></thead>
              <tbody>
                <tr>
                  <td style={{ width: "150px" }}>
                    <Controller
                      name={`questions.${questionIndex}.answer_header_true`}
                      defaultValue=""
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <Input
                            {...rest}
                            ref={ref}
                            invalid={error && true}
                            placeholder="Opsi 1"
                          />
                        );
                      }}
                    />
                  </td>
                  <td style={{ width: "150px" }}>
                    <Controller
                      name={`questions.${questionIndex}.answer_header_false`}
                      defaultValue=""
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        const { ref, ...rest } = field;
                        return (
                          <Input
                            {...rest}
                            ref={ref}
                            invalid={error && true}
                            placeholder="Opsi 2"
                          />
                        );
                      }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <Label className="form-label"></Label>
          </div>
        </div>
        {questionOptions.map((fieldOption, optionIndex) => (
          <Fragment key={fieldOption.uid}>
            <div
              className="d-flex align-items-center mt-1"
              style={{ gap: "50px" }}
            >
              {/* <Controller
                name={`questions.${questionIndex}.question_options.${optionIndex}.option`}
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup
                      style={{
                        width: "50px",
                        minWidth: "50px",
                      }}
                      className="mr-1 d-none mb-0"
                    >
                      <Input
                        {...rest}
                        readOnly
                        ref={ref}
                        invalid={error && true}
                        className="text-center h-100"
                      />
                    </FormGroup>
                  );
                }}
              /> */}
              <div className="flex-fill answer-question-create">
                <Controller
                  name={`questions.${questionIndex}.question_options.${optionIndex}.option_choice`}
                  control={control}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <div
                      className={classnames(
                        error && "custom-is-invalid rounded"
                      )}
                    >
                      <CustomCKEditor
                        initData={value}
                        data={value}
                        onChange={onChange}
                        style={{
                          padding: "5px",
                          height: "100%",
                          border: "1px solid #d8d6de",
                          borderRadius: "0.357rem",
                        }}
                        config={{
                          title: "Inputkan Opsi Jawaban",
                          placeholder: "Inputkan Opsi Jawaban",
                          editorplaceholder: "Inputkan Opsi Jawaban",
                        }}
                      />
                    </div>
                  )}
                />
              </div>
              <Controller
                name={`questions.${questionIndex}.question_options.${optionIndex}.value`}
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  const {
                    isFirstRadioOptionChecked,
                    isSecondRadioOptionChecked,
                  } = initStatementOptions(questionIndex, optionIndex);
                  return (
                    <FormGroup className="mb-0">
                      <table className="w-100 statement-question-table">
                        <thead></thead>
                        <tbody>
                          {optionIndex === 0 ? (
                            <tr>
                              <td
                                colSpan={2}
                                className="text-center p-50"
                                style={{
                                  border: error ? "1px solid red" : undefined,
                                }}
                              >
                                Kunci Jawaban
                              </td>
                            </tr>
                          ) : null}
                          <tr>
                            <td
                              id={`questions.${questionIndex}.question_options.${optionIndex}.cell_0`}
                              className={clsx(
                                field.value === "true" && "chosen-cell",
                                isFirstRadioOptionChecked
                                  ? radioOptionClassNames["checkedTableCell"]
                                  : radioOptionClassNames["uncheckedTableCell"]
                              )}
                              style={{
                                border: error ? "1px solid red" : undefined,
                              }}
                            >
                              <div className="custom-statement-option-basic position-relative">
                                <label
                                  className="form-check-label custom-statement-option-content"
                                  htmlFor={`questions.${questionIndex}.question_options.${optionIndex}.value_0`}
                                >
                                  <input
                                    {...rest}
                                    ref={ref}
                                    className="form-check-input position-absolute invisible"
                                    style={{ top: "35%", left: "50%" }}
                                    type="radio"
                                    id={`questions.${questionIndex}.question_options.${optionIndex}.value_0`}
                                    name={`questions.${questionIndex}.question_options.${optionIndex}.value`}
                                    onChange={(event) => {
                                      toggleChosenStatementOptionKey(
                                        questionIndex,
                                        optionIndex,
                                        0
                                      );
                                      field.onChange(event.target.value);
                                    }}
                                    value="true"
                                    checked={isFirstRadioOptionChecked}
                                  />
                                  <div
                                    className={clsx(
                                      field.value === "true" && "chosen-key",
                                      `position-absolute ${
                                        isFirstRadioOptionChecked
                                          ? radioOptionClassNames[
                                              "checkedKeyAnswerIcon"
                                            ]
                                          : radioOptionClassNames[
                                              "uncheckedKeyAnswerIcon"
                                            ]
                                      }`
                                    )}
                                    id={`questions.${questionIndex}.question_options.${optionIndex}.key_0`}
                                    style={{
                                      top: "35%",
                                      left: "25%",
                                    }}
                                  ></div>
                                </label>
                              </div>
                            </td>
                            <td
                              id={`questions.${questionIndex}.question_options.${optionIndex}.cell_1`}
                              className={clsx(
                                field.value === "false" && "chosen-cell",
                                isSecondRadioOptionChecked
                                  ? radioOptionClassNames["checkedTableCell"]
                                  : radioOptionClassNames["uncheckedTableCell"]
                              )}
                              style={{
                                border: error ? "1px solid red" : undefined,
                              }}
                            >
                              <div className="custom-statement-option-basic position-relative">
                                <label
                                  className="form-check-label custom-statement-option-content"
                                  htmlFor={`questions.${questionIndex}.question_options.${optionIndex}.value_1`}
                                >
                                  <input
                                    {...rest}
                                    ref={ref}
                                    className="form-check-input invisible"
                                    style={{ top: "35%", left: "50%" }}
                                    type="radio"
                                    id={`questions.${questionIndex}.question_options.${optionIndex}.value_1`}
                                    name={`questions.${questionIndex}.question_options.${optionIndex}.value`}
                                    onChange={(event) => {
                                      toggleChosenStatementOptionKey(
                                        questionIndex,
                                        optionIndex,
                                        1
                                      );
                                      field.onChange(event.target.value);
                                    }}
                                    value="false"
                                    checked={isSecondRadioOptionChecked}
                                  />
                                  <div
                                    className={clsx(
                                      field.value === "false" && "chosen-key",

                                      `position-absolute ${
                                        isSecondRadioOptionChecked
                                          ? radioOptionClassNames[
                                              "checkedKeyAnswerIcon"
                                            ]
                                          : radioOptionClassNames[
                                              "uncheckedKeyAnswerIcon"
                                            ]
                                      }`
                                    )}
                                    id={`questions.${questionIndex}.question_options.${optionIndex}.key_1`}
                                    style={{ top: "35%", left: "25%" }}
                                  ></div>
                                </label>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot></tfoot>
                      </table>
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />
              {questionOptions.length > 1 && (
                <Button
                  color="transparent"
                  className="p-1 bg-light-danger border-0"
                  onClick={() =>
                    handleRemoveOptionPerNumber(questionIndex, optionIndex)
                  }
                >
                  <Minus size={14} />
                </Button>
              )}
            </div>
          </Fragment>
        ))}
        <Button
          size="sm"
          color="primary"
          className="mt-2 ml-auto d-block"
          onClick={() => handleAddOptionPerNumber(questionIndex)}
        >
          <Plus size={14} /> Tambah Opsi
        </Button>
      </>
    );
  };

  const IsianOptionsQuestion = ({ questionIndex, questionOptions }) => {
    return (
      <>
        <Label className="form-label">
          {getModuleTypeAnswerLabel(questionIndex)}
        </Label>
        {questionOptions.map((fieldOption, optionIndex) => (
          <Fragment key={fieldOption.uid}>
            <div className="d-flex my-1">
              {/* <Controller
                name={`questions.${questionIndex}.question_options.${optionIndex}.option`}
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup
                      style={{
                        width: "50px",
                        minWidth: "50px",
                      }}
                      className="mr-1 mb-0"
                    >
                      <Input
                        {...rest}
                        readOnly
                        ref={ref}
                        invalid={error && true}
                        className="text-center h-100"
                      />
                    </FormGroup>
                  );
                }}
              /> */}
              <div className="flex-fill mr-1">
                <Controller
                  name={`questions.${questionIndex}.question_options.${optionIndex}.option_choice`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div
                      className={classnames(
                        error && "custom-is-invalid rounded"
                      )}
                      style={{ minWidth: "75%" }}
                    >
                      <Cleave
                        {...field}
                        options={normalNumber}
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        onChange={(e) => field.onChange(e.target.rawValue)}
                        value={field.value}
                        ref={(ref) => ref}
                        placeholder="Input Jawaban"
                      />
                    </div>
                  )}
                />
              </div>
              <Controller
                name={`questions.${questionIndex}.question_options.${optionIndex}.value`}
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup
                      className="mb-0 mr-1"
                      style={{
                        minWidth: "50px",
                      }}
                    >
                      <Cleave
                        {...field}
                        options={normalNumber}
                        className={classnames("form-control", {
                          "is-invalid": error,
                        })}
                        onChange={(e) => field.onChange(e.target.rawValue)}
                        value={field.value}
                        ref={(ref) => ref}
                        placeholder="Bobot Nilai"
                        style={{
                          border: error ? "1px solid red" : undefined,
                        }}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />
            </div>
          </Fragment>
        ))}
      </>
    );
  };

  const toggleChosenStatementOptionKey = (
    questionIndex,
    optionIndex,
    optionItemIndex
  ) => {
    const currentOptionItemIndex = optionItemIndex;
    const siblingOptionItemIndex =
      optionItemIndex == 0 ? optionItemIndex + 1 : optionItemIndex - 1;

    const currentQuestionOptionTableCell = document.getElementById(
      `questions.${questionIndex}.question_options.${optionIndex}.cell_${currentOptionItemIndex}`
    );
    const currentQuestionOptionKeyIconElement = document.getElementById(
      `questions.${questionIndex}.question_options.${optionIndex}.key_${currentOptionItemIndex}`
    );
    const currentQuestionOptionRadioElement = document.getElementById(
      `questions.${questionIndex}.question_options.${optionIndex}.value_${currentOptionItemIndex}`
    );

    const siblingQuestionOptionTableCell = document.getElementById(
      `questions.${questionIndex}.question_options.${optionIndex}.cell_${siblingOptionItemIndex}`
    );
    const siblingQuestionOptionKeyIconElement = document.getElementById(
      `questions.${questionIndex}.question_options.${optionIndex}.key_${siblingOptionItemIndex}`
    );
    const siblingQuestionOptionRadioElement = document.getElementById(
      `questions.${questionIndex}.question_options.${optionIndex}.value_${siblingOptionItemIndex}`
    );

    // siblingQuestionOptionTableCell.classList.remove("chosen-cell");
    // siblingQuestionOptionKeyIconElement.classList.remove("chosen-key");

    // currentQuestionOptionTableCell.classList.toggle("chosen-cell");
    // currentQuestionOptionKeyIconElement.classList.toggle("chosen-key");
  };

  const handleAddNewForm = () => {
    append(getEmptyForm());
  };

  const handleAddOptionPerNumber = (index) => {
    const currentForm = { ...questions[index] };
    const lastQuestionOption = currentForm.question_options?.reverse()[0];
    const nextOptionChar = String.fromCharCode(
      lastQuestionOption.option.charCodeAt(0) + 1
    );
    const newOption = {
      uid: nanoid(),
      option: nextOptionChar,
      option_choice: "",
      value: "",
    };
    const updatedForm = {
      ...currentForm,
      question_options: [...currentForm.question_options, newOption],
    };
    updatedForm.question_options.sort((a, b) => {
      if (a.option < b.option) return -1;
      return 1;
    });

    const form = [...questions];
    form[index] = updatedForm;
    setValue("questions", form);
  };

  const loadQuestionChoicesOptions = (index, selectedAnswerType) => {
    setValue(`questions.${index}.answer_header_true`, "");
    setValue(`questions.${index}.answer_header_false`, "");

    let currentForm = fields[index];
    let currentQuestionOptions = [...currentForm.question_options];
    let updatedForm = { ...currentForm };

    currentQuestionOptions?.forEach((_, optionIndex) => {
      setValue(`questions.${index}.question_options.${optionIndex}.value`, "");
    });

    if (selectedAnswerType?.value == "NUMBER") {
      updatedForm = {
        ...currentForm,
        answer_type: selectedAnswerType,
        question_options: [getEmptyOptions()],
      };
    } else {
      updatedForm = {
        ...currentForm,
        answer_type: selectedAnswerType,
        question_options: [
          getEmptyOptions("A"),
          getEmptyOptions("B"),
          getEmptyOptions("C"),
          getEmptyOptions("D"),
          getEmptyOptions("E"),
        ],
      };
    }
    update(index, updatedForm);
  };

  const handleRemoveOptionPerNumber = (questionIndex, optionIndex) => {
    const currentForm = {
      ...questions[questionIndex],
    };
    currentForm.question_options.splice(optionIndex, 1);
    const startOpt = "A";
    const options = [...currentForm.question_options];
    const updatedOptForm = options.map((item, index) => {
      const updatedOptChar = String.fromCharCode(
        startOpt.charCodeAt(0) + index
      );
      return {
        uid: nanoid(),
        value: item.value,
        option: updatedOptChar,
        option_choice: item.option_choice,
      };
    });

    currentForm.question_options = updatedOptForm;
    const form = [...questions];
    form[questionIndex] = currentForm;
    setValue("questions", form);
  };

  const getPayload = (questions = []) => {
    const { program } = getValues();

    return questions.map((question) => {
      let true_answer_header = null;
      let false_answer_header = null;
      if (question.answer_type.value === "PERNYATAAN") {
        true_answer_header = question.answer_header_true;
        false_answer_header = question.answer_header_false;
      }
      const payload = {
        question: question.question,
        program: program.slug.toLowerCase(),
        sub_category: question.sub_category.id,
        explanation: question.explanation,
        explanation_media: question.explanation_media,
        answer_type: question.answer_type.value,
        question_categories_id: question.question_category.id,
        question_type: question.question_type.value,
        tags: question.tags,
        question_keyword: question.question_keyword,
        answer_header_true: true_answer_header,
        answer_header_false: false_answer_header,
        answers: generateAnswersPayload({
          answer_type: question.answer_type.value,
          question_options: question.question_options,
        }),
      };
      return payload;
    });
  };

  const generateAnswersPayload = ({ answer_type, question_options }) => {
    switch (answer_type) {
      case "PERNYATAAN":
        return generatePernyataanAnswersPayload(question_options);
      case "CHECKBOX":
        return generateCheckboxAnswersPayload(question_options);
      case "NUMBER":
        return generateIsianAnswerPayload(question_options);
      default:
        return generateMultipleOptionsAnswerPayload(question_options);
    }
  };

  const generatePernyataanAnswersPayload = (question_options) => {
    return question_options.map((option) => ({
      answer: option.option_choice,
      score: [1, "true"].includes(option.value) ? 1 : 0,
      is_true: [1, "true"].includes(option.value),
    }));
  };

  const generateCheckboxAnswersPayload = (question_options) => {
    return question_options.map((option) => ({
      answer: option.option_choice,
      score: [1, true].includes(option.value) ? 1 : 0,
      is_true: [1, true].includes(option.value),
    }));
  };

  const generateIsianAnswerPayload = (question_options) => {
    return question_options.map((option) => ({
      option: "",
      answer: option.option_choice,
      score: +option.value,
      is_true: true,
    }));
  };

  const generateMultipleOptionsAnswerPayload = (question_options) => {
    const copyOptions = [...question_options];
    const optionsDescByValue = copyOptions.sort((a, b) => +b.value - +a.value);
    const highestOption = optionsDescByValue[0];

    return question_options.map((option) => ({
      option: option.option,
      answer: option.option_choice,
      score: +option.value,
      is_true: option.option === highestOption.option,
    }));
  };

  const redirectToIndexPage = () => {
    window.location.href = "/ujian/bank-soal";
  };

  const onSubmit = async () => {
    trigger();
    if (isObjEmpty(errors)) {
      const { questions } = getValues();
      const payload = getPayload(questions);
      payload.cancelToken = source.token;
      try {
        setIsSubmitting(true);
        await saveQuestions({ data: payload });
        if (!isCanceled.current) {
          localStorage.removeItem("questions-draft");
          redirectToIndexPage();
        }
      } catch (error) {
        setIsSubmitting(false);
      }
    }
  };

  const fetchSubCategories = async (index, categoryId) => {
    try {
      setIsFetchingSubCategories((current) => ({
        ...current,
        [index]: true,
      }));
      const data = await getSubCategoryByCategoryId(categoryId, {
        cancelToken: source.token,
      });
      setSubCategories((current) => ({
        ...current,
        [categoryId]: data ?? [],
      }));
      setIsFetchingSubCategories((current) => ({
        ...current,
        [index]: false,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const onCategoryChange = (value, index) => {
    const currentForm = {
      ...questions[index],
    };
    currentForm.sub_category = "";
    update(index, currentForm);

    const categoryId = value.id;
    if (subCategories[categoryId]) return;

    fetchSubCategories(index, categoryId);
  };

  const handleDeleteDraft = async () => {
    const state = await MySwal.fire({
      title: "Apakah anda yakin ingin menghapus draft soal?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-outline-secondary ml-1",
      },
      buttonsStyling: false,
    });
    if (state.isDismissed) return;
    localStorage.removeItem("questions-draft");
    window.location.reload();
  };

  useEffect(() => {
    if (!isCanceled.current && isDirty) {
      const form = getValues();
      localStorage.setItem("questions-draft", JSON.stringify(form));

      {
        isSubmitting ? localStorage.removeItem("questions-draft") : null;
      }
    }
  });

  useEffect(() => {
    (async () => {
      try {
        setIsFetchingCategory(true);
        const categories = await getCategoryByProgram(program.slug, {
          cancelToken: source.token,
        });
        setCategories(categories);
        setIsFetchingCategory(false);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [program?.slug]);

  useEffect(() => {
    questions.map((question, index) => {
      if (question.answer_type !== "" && isDefaultSet.current) {
        setValue(`questions.${index}.answer_type`, "");
      }
      if (question.question_category !== "" && isDefaultSet.current) {
        setValue(`questions.${index}.question_category`, "");
      }
      if (question.sub_category !== "" && isDefaultSet.current) {
        setValue(`questions.${index}.sub_category`, "");
      }
    });
    if (program.slug === "utbk") {
      let finalModuleTypeOptions = [...initialModuleTypeOptions];

      finalModuleTypeOptions = [
        ...moduleTypeOptions,
        checkboxModuleTypeOption,
        statementModuleTypeOption,
        isianModuleTypeOption,
      ];

      setModuleTypeOptions(finalModuleTypeOptions);
    } else {
      setModuleTypeOptions(initialModuleTypeOptions);
    }
  }, [program?.slug]);

  useEffect(() => {
    isDefaultSet.current = true;
  }, []);

  useEffect(() => {
    // check if the window document is rendered
    questions.forEach((question, questionIndex) => {
      question.question_options.forEach((option, optionIndex) => {
        initStatementOptions(questionIndex, optionIndex);
      });
    });
  }, [questions?.length]);

  useEffect(() => {
    return () => {
      const form = getValues();
      localStorage.setItem("questions-draft", JSON.stringify(form));

      source.cancel();
      isCanceled.current = true;
    };
  }, []);

  return (
    <Card className={classnames(isSubmitting && "block-content")}>
      <CardHeader>
        <CardTitle>
          Tambah Soal{" "}
          {questionDraft ? (
            <>
              <Badge color="light-warning ml-50 mr-50">Draft</Badge>
              <Button
                color="outline-danger"
                size="sm"
                onClick={handleDeleteDraft}
              >
                Hapus Draft
              </Button>
            </>
          ) : null}
        </CardTitle>
      </CardHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <CardBody className={classnames("bg-light-success py-0")}>
          <Row>
            <Col md={6}>
              <Controller
                name="program"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill mt-1">
                      <Label className="form-label font-weight-bolder">
                        Pilih Program
                      </Label>
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
            </Col>
          </Row>
        </CardBody>
        <CardBody>
          {fields.map((field, index) => (
            <Fragment key={field.id}>
              <Row>
                <Col md={6}>
                  <div className={classnames("d-flex")}>
                    <Badge
                      color="primary"
                      className={classnames(
                        "d-flex justify-content-center align-items-center",
                        "mr-1"
                      )}
                      style={{
                        fontSize: "1.5rem",
                        width: "40px",
                        height: "40px",
                      }}
                    >
                      {index + 1}
                    </Badge>
                    <Controller
                      name={`questions.${index}.answer_type`}
                      control={control}
                      render={({ field, fieldState: { error } }) => {
                        return (
                          <FormGroup className="flex-fill">
                            <Select
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 9999,
                                }),
                              }}
                              {...field}
                              options={moduleTypeOptions}
                              classNamePrefix="select"
                              className={classnames("react-select", {
                                "is-invalid": error && true,
                              })}
                              id={`questions-${index}-answer_type`}
                              autoFocus={fields.length === index + 1}
                              onChange={(value) => {
                                field.onChange(value);
                                loadQuestionChoicesOptions(index, value);
                                // setFocus(`questions.${index}.answer_type`);
                              }}
                            />
                          </FormGroup>
                        );
                      }}
                    />
                  </div>

                  <Controller
                    name={`questions.${index}.question_type`}
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">Pilih Tipe Soal</Label>
                          <Select
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                            {...field}
                            options={question_type}
                            classNamePrefix="select"
                            className={classnames("react-select", {
                              "is-invalid": error && true,
                            })}
                          />
                        </FormGroup>
                      );
                    }}
                  />

                  <Controller
                    name={`questions.${index}.question_category`}
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">
                            Pilih Kategori Soal
                          </Label>
                          <Select
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                            {...field}
                            options={categories}
                            onChange={(value) => {
                              field.onChange(value);
                              onCategoryChange(value, index);
                            }}
                            isLoading={isFetchingCategory}
                            isDisabled={isFetchingCategory}
                            getOptionLabel={(option) => option.category}
                            getOptionValue={(option) => option.id}
                            classNamePrefix="select"
                            className={classnames("react-select", {
                              "is-invalid": error && true,
                            })}
                          />
                        </FormGroup>
                      );
                    }}
                  />

                  <Controller
                    name={`questions.${index}.sub_category`}
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">
                            Pilih Sub Kategori Soal
                          </Label>
                          <Select
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                            {...field}
                            options={
                              subCategories[
                                questions[index].question_category?.id
                              ] ?? []
                            }
                            isLoading={isFetchingSubCategories[index]}
                            isDisabled={
                              isFetchingSubCategories[index] ||
                              !questions[index].question_category
                            }
                            getOptionLabel={(option) => option.title}
                            getOptionValue={(option) => option.id}
                            classNamePrefix="select"
                            className={classnames("react-select", {
                              "is-invalid": error && true,
                            })}
                          />
                        </FormGroup>
                      );
                    }}
                  />
                </Col>
                <Col md={12}>
                  <Controller
                    name={`questions.${index}.question`}
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => {
                      return (
                        <>
                          <Label className="form-label">Pertanyaan</Label>
                          <FormGroup>
                            <div
                              className={classnames(
                                error && "custom-is-invalid"
                              )}
                            >
                              <CustomCKEditor
                                initData={value}
                                data={value}
                                onChange={onChange}
                              />
                            </div>
                          </FormGroup>
                        </>
                      );
                    }}
                  />
                  {fetchQuestionOptionsComponent(index, field.question_options)}

                  {/* <Label className="form-label">
                    {getModuleTypeAnswerLabel(index)}
                  </Label>
                  {field.question_options.map((fieldOption, optionIndex) => (
                    <Fragment key={fieldOption.uid}>
                      <div className="d-flex mt-1">
                        <Controller
                          name={`questions.${index}.question_options.${optionIndex}.option`}
                          defaultValue=""
                          control={control}
                          render={({ field, fieldState: { error } }) => {
                            const { ref, ...rest } = field;
                            return (
                              <FormGroup
                                style={{
                                  width: "50px",
                                  minWidth: "50px",
                                }}
                                className="mr-1 mb-0"
                              >
                                <Input
                                  {...rest}
                                  readOnly
                                  ref={ref}
                                  invalid={error && true}
                                  className="text-center h-100"
                                />
                              </FormGroup>
                            );
                          }}
                        />
                        <div className="flex-fill mr-1 answer-question-create">
                          <Controller
                            name={`questions.${index}.question_options.${optionIndex}.option_choice`}
                            control={control}
                            render={({
                              field: { onChange, value },
                              fieldState: { error },
                            }) => (
                              <div
                                className={classnames(
                                  error && "custom-is-invalid rounded"
                                )}
                              >
                                <CustomCKEditor
                                  type="inline"
                                  initData={value}
                                  data={value}
                                  onChange={onChange}
                                  style={{
                                    padding: "5px",
                                    height: "100%",
                                    border: "1px solid #d8d6de",
                                    borderRadius: "0.357rem",
                                  }}
                                  config={{
                                    title: "Inputkan Opsi Jawaban",
                                    placeholder: "Inputkan Opsi Jawaban",
                                    editorplaceholder: "Inputkan Opsi Jawaban",
                                    extraPlugins: "sourcedialog",
                                  }}
                                />
                              </div>
                            )}
                          />
                        </div>
                        <Controller
                          name={`questions.${index}.question_options.${optionIndex}.value`}
                          defaultValue=""
                          control={control}
                          render={({ field, fieldState: { error } }) => {
                            const { ref, ...rest } = field;
                            return (
                              <FormGroup
                                className="mb-0 mr-1"
                                style={{
                                  minWidth: "50px",
                                }}
                              >
                                <Cleave
                                  {...field}
                                  options={normalNumber}
                                  className={classnames("form-control", {
                                    "is-invalid": error,
                                  })}
                                  onChange={(e) =>
                                    field.onChange(e.target.rawValue)
                                  }
                                  value={field.value}
                                  placeholder="Bobot Nilai"
                                />
                                <FormFeedback>{error?.message}</FormFeedback>
                              </FormGroup>
                            );
                          }}
                        />
                        {field.question_options.length > 1 && (
                          <Button
                            color="transparent"
                            className="p-1 bg-light-danger border-0"
                            onClick={() =>
                              handleRemoveOptionPerNumber(index, optionIndex)
                            }
                          >
                            <Minus size={14} />
                          </Button>
                        )}
                      </div>
                    </Fragment>
                  ))}
                  <Button
                    size="sm"
                    color="primary"
                    className="mt-2 ml-auto d-block"
                    onClick={() => handleAddOptionPerNumber(index)}
                  >
                    <Plus size={14} /> Tambah Opsi
                  </Button> */}

                  <Controller
                    name={`questions.${index}.explanation`}
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <>
                        <Label className="form-label">Penjelasan Soal</Label>
                        <div
                          className={classnames(error && "custom-is-invalid")}
                        >
                          <CustomCKEditor
                            initData={value}
                            data={value}
                            onChange={onChange}
                          />
                        </div>
                      </>
                    )}
                  />

                  <Controller
                    name={`questions.${index}.explanation_media`}
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      const { ref, ...rest } = field;
                      return (
                        <FormGroup className="flex-fill mt-2">
                          <Label className="form-label">
                            File Penjelasan Soal
                          </Label>
                          <Input
                            {...rest}
                            id={`questions.${index}.explanation_media`}
                            ref={ref}
                            invalid={error && true}
                            placeholder="Pilih file pembahasan soal"
                            onClick={(e) =>
                              openFileManager(
                                e,
                                `questions.${index}.explanation_media`
                              )
                            }
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />

                  <Controller
                    isClearable
                    control={control}
                    name={`questions.${index}.input_tags`}
                    render={({ field, fieldState: { error } }) => (
                      <FormGroup className="mt-1">
                        <Label>
                          Tag <small>(Opsional)</small>
                        </Label>
                        <MultipleInputSelect
                          setValue={setValue}
                          defaultValue={questions[index].tags}
                          fieldName={field.name}
                          valueName={`questions.${index}.tags`}
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
                    isClearable
                    control={control}
                    name={`questions.${index}.input_question_keyword`}
                    render={({ field, fieldState: { error } }) => (
                      <FormGroup className="mt-1">
                        <Label>
                          Kata Kunci <small>(Opsional)</small>
                        </Label>
                        <MultipleInputSelect
                          setValue={setValue}
                          defaultValue={questions[index].question_keyword}
                          fieldName={field.name}
                          valueName={`questions.${index}.question_keyword`}
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

                  <div className="d-flex justify-content-end align-items-center">
                    {fields.length > 1 ? (
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
              </Row>

              {fields.length !== index + 1 ? (
                <hr className="my-3 mx-n2 border-primary" />
              ) : null}
            </Fragment>
          ))}
        </CardBody>
        <div
          className={classnames(
            "bg-light-success mt-3 p-2",
            "d-flex justify-content-between align-items-center"
          )}
        >
          <div className="text-dark">
            <p className="mb-0">
              Total: <Badge color="success">{fields.length} Soal</Badge>{" "}
              {questionDraft ? <Badge color="warning">Draft</Badge> : null}
            </p>
          </div>
          <Button type="submit" color="success">
            {isSubmitting ? (
              "Sedang Menyimpan..."
            ) : (
              <>
                <Save size={14} /> Simpan Pertanyaan
              </>
            )}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default CreateQuestionForm;
