import Axios from "axios";
import React, { useState } from "react";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { Controller, useForm } from "react-hook-form";
import {
  Row,
  Col,
  Form,
  Card,
  Input,
  Label,
  Badge,
  Button,
  CardBody,
  FormGroup,
  CardHeader,
  FormFeedback,
} from "reactstrap";
import { nanoid } from "nanoid";
import { Fragment } from "react";
import { Save } from "react-feather";

import MultipleInputSelect from "../core/multiple-input-select/MultipleInputSelect";
import {
  getCategoryByProgram,
  getQuestionById,
  getSubCategoryByCategoryId,
  updateQuestion,
} from "../../services/exam/question";
import {
  normalNumber,
  decimalNumber,
  getLastSegment,
  isObjEmpty,
} from "../../utility/Utils";
import { useEffect, useCallback, useRef } from "react";
import SpinnerCenter from "../core/spinners/Spinner";
import { programs } from "../../config/programs";
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

const questionOptionSchema = () => {
  return yup.array().of(
    yup.object().shape({
      option: yup
        .string()
        .test("option_is_required", "", function (option, context) {
          const answer_type = context.from[1].value.answer_type.value ?? null;
          const answerTypeWithNoOptionChar = [
            "PERNYATAAN",
            "CHECKBOX",
            "NUMBER",
          ].some((type) => type === answer_type);
          if (answer_type && answerTypeWithNoOptionChar) return true;
          return option;
        }),
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
  answer_type: yup.object().required(),
  question_type: yup.object().required(),
  question_category: yup.object().required(),
  sub_category: yup.object().required(),
  question: yup.string().required(),
  question_options: questionOptionSchema(),
  explanation: yup.string().required(),
  answer_header_true: yup.string().when("answer_type", {
    is: (answerType) => answerType.value == "PERNYATAAN",
    then: (_) => yup.string().required(),
    otherwise: (_) => yup.mixed().notRequired(),
  }),
  answer_header_false: yup.string().when("answer_type", {
    is: (answerType) => answerType.value == "PERNYATAAN",
    then: (_) => yup.string().required(),
    otherwise: (_) => yup.mixed().notRequired(),
  }),
});

const EditQuestionForm = () => {
  const [question, setQuestion] = useState(null);
  const [moduleTypeOptions, setModuleTypeOptions] = useState(
    initialModuleTypeOptions
  );
  const [initialQuestion, setInitialQuestion] = useState();
  const [categories, setCategories] = useState();
  const [subCategories, setSubCategories] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCategory, setIsFetchingCategory] = useState(false);
  const [isFetchingSubCategories, setIsFetchingSubCategories] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      id: nanoid(),
      question: "",
      question_options: [],
      explanation: "",
      explanation_media: "",
      answer_header_true: "",
      answer_header_false: "",
    },
  });
  const isCanceled = useRef(false);
  const { id, program, question_options, tags, question_keyword, answer_type } =
    watch();
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

  // const handleAddOptionPerNumber = () => {
  //   const currentForm = getValues();
  //   const lastQuestionOption = currentForm.question_options?.reverse()[0];
  //   const nextOptionChar = String.fromCharCode(
  //     lastQuestionOption.option.charCodeAt(0) + 1
  //   );
  //   const newOption = {
  //     id: nanoid(),
  //     option: nextOptionChar,
  //     option_choice: "",
  //     value: "",
  //   };
  //   const updatedOptions = [...currentForm.question_options, newOption];
  //   updatedOptions.sort((a, b) => {
  //     if (a.option < b.option) return -1;
  //     return 1;
  //   });

  //   setValue("question_options", updatedOptions);
  // };

  // const handleRemoveOptionPerNumber = (optionIndex) => {
  //   const currentForm = getValues();
  //   currentForm.question_options.splice(optionIndex, 1);
  //   const startOpt = "A";
  //   const options = [...currentForm.question_options];
  //   const updatedOptForm = options.map((item, index) => {
  //     const updatedOptChar = String.fromCharCode(
  //       startOpt.charCodeAt(0) + index
  //     );
  //     return {
  //       id: nanoid(),
  //       value: item.value,
  //       option: updatedOptChar,
  //       option_choice: item.option_choice,
  //     };
  //   });
  //   setValue("question_options", updatedOptForm);
  // };

  const fetchCategories = async (program) => {
    try {
      setIsFetchingCategory(true);
      const categories = await getCategoryByProgram(program, {
        cancelToken: source.token,
      });
      setCategories(categories);
      setIsFetchingCategory(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      setIsFetchingSubCategories(true);
      const data = await getSubCategoryByCategoryId(categoryId, {
        cancelToken: source.token,
      });
      setSubCategories(data ?? []);
      setIsFetchingSubCategories(false);
    } catch (error) {
      console.log(error);
    }
  };

  const onCategoryChange = (value) => {
    const categoryId = value.id;
    setValue("sub_category", "");
    fetchSubCategories(categoryId);
  };

  const setDefaultValue = (data) => {
    setValue("id", data.id);
    setValue(
      "question_type",
      question_type.find((type) => type.value == data.question_type)
    );
    setValue(
      "program",
      programs.find((program) => program.slug == data.program)
    );
    setValue("question_category", data.question_categories);
    setValue("sub_category", data.sub_category_questions);
    setValue("question", data.question);
    setValue("answer_header_true", data.answer_header_true);
    setValue("answer_header_false", data.answer_header_false);
    setValue(
      "question_options",
      data.answers
        .map((answer) => ({
          id: answer.id,
          option: answer.option,
          option_choice: answer.answer,
          value: answer.score,
        }))
        .sort((a, b) => a.id - b.id)
    );
    setValue("explanation", data.explanation);
    setValue(
      "explanation_media",
      data.explanation_media ? data.explanation_media : ""
    );
    setValue("parent_id", data.parent_id);
    setValue("tags", data.tags);
    setValue("question_keyword", data.question_keyword);

    let finalModuleTypeOptions = [...moduleTypeOptions];
    if (data.program === "utbk") {
      finalModuleTypeOptions = [
        ...moduleTypeOptions,
        checkboxModuleTypeOption,
        statementModuleTypeOption,
        isianModuleTypeOption,
      ];
    }
    setModuleTypeOptions(finalModuleTypeOptions);
    fetchSubCategories(data.question_categories.id);
  };

  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      const id = getLastSegment();
      const data = await getQuestionById(id);
      if (!isCanceled.current) {
        setDefaultValue(data);
        setInitialQuestion(data);
        fetchCategories(data.program);
        setQuestion(data);
      }
    } catch (error) {
      console.log({ error });
      setIsLoading(false);
    }
  };

  const getModuleTypeAnswerLabel = () => {
    return moduleTypeAnswerLabels[answer_type?.value]
      ? moduleTypeAnswerLabels[answer_type?.value]
      : moduleTypeAnswerLabels["DEFAULT"];
  };

  const fetchQuestionOptionsComponent = useCallback(
    (questionOptions) => {
      switch (answer_type?.value) {
        case "CHECKBOX":
          return <CheckboxQuestion questionOptions={questionOptions} />;
        case "PERNYATAAN":
          return <StatementQuestion questionOptions={questionOptions} />;
        case "NUMBER":
          return <IsianQuestion questionOptions={questionOptions} />;
        default:
          return <MultipleOptionsQuestion questionOptions={questionOptions} />;
      }
    },
    [answer_type?.value]
  );

  const MultipleOptionsQuestion = ({ questionOptions }) => {
    return (
      <>
        <Label className="form-label">{getModuleTypeAnswerLabel()}</Label>
        {questionOptions.map((fieldOption, optionIndex) => (
          <Fragment key={fieldOption.id}>
            <div className="d-flex mt-1">
              <Controller
                name={`question_options.${optionIndex}.option`}
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
                  name={`question_options.${optionIndex}.option_choice`}
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
                name={`question_options.${optionIndex}.value`}
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
              {/* {questionOptions.length > 1 && (
                <Button
                  color="transparent"
                  className="p-1 bg-light-danger border-0"
                  onClick={() =>
                    handleRemoveOptionPerNumber(questionIndex, optionIndex)
                  }
                >
                  <Minus size={14} />
                </Button>
              )} */}
            </div>
          </Fragment>
        ))}
        {/* <Button
          size="sm"
          color="primary"
          className="mt-2 ml-auto d-block"
          onClick={() => handleAddOptionPerNumber(questionIndex)}
        >
          <Plus size={14} /> Tambah Opsi
        </Button> */}
      </>
    );
  };

  const CheckboxQuestion = ({ questionOptions }) => {
    return (
      <>
        <div className="d-flex mt-1" style={{ gap: "6rem" }}>
          <Label className="form-label" style={{ width: "67%" }}>
            {getModuleTypeAnswerLabel()}
          </Label>
          <Label className="form-label">Kunci Jawaban</Label>
          <Label className="form-label"></Label>
        </div>
        {questionOptions.map((fieldOption, optionIndex) => (
          <Fragment key={fieldOption.id}>
            <div
              className="d-flex align-items-center mt-1"
              style={{ gap: "5rem" }}
            >
              <div className="flex-fill answer-question-create">
                <Controller
                  name={`question_options.${optionIndex}.option_choice`}
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
                name={`question_options.${optionIndex}.value`}
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  const isChecked = getValues(
                    `question_options.${optionIndex}.value`
                  );
                  const isCheckedClassName = isChecked ? "checked" : "";
                  return (
                    <FormGroup className="mb-0">
                      <div
                        className={`form-check custom-option custom-option-basic ${isCheckedClassName}`}
                      >
                        <label
                          className="form-check-label custom-option-content"
                          htmlFor={`question_options.${optionIndex}.value`}
                          style={{
                            border: error ? "1px solid red" : undefined,
                          }}
                        ></label>
                        <input
                          {...rest}
                          ref={ref}
                          className="form-check-input"
                          type="checkbox"
                          id={`question_options.${optionIndex}.value`}
                          name={`question_options.${optionIndex}.value`}
                          onChange={(event) => {
                            setValue(
                              `question_options.${optionIndex}.value`,
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
              {/* {questionOptions.length > 1 && (
                <Button
                  color="transparent"
                  className="p-1 bg-light-danger border-0"
                  onClick={() =>
                    handleRemoveOptionPerNumber(questionIndex, optionIndex)
                  }
                >
                  <Minus size={14} />
                </Button>
              )} */}
            </div>
          </Fragment>
        ))}
        {/* <Button
          size="sm"
          color="primary"
          className="mt-2 ml-auto d-block"
          onClick={() => handleAddOptionPerNumber(questionIndex)}
        >
          <Plus size={14} /> Tambah Opsi
        </Button> */}
      </>
    );
  };

  const StatementQuestion = ({ questionOptions }) => {
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
            {getModuleTypeAnswerLabel()}
          </Label>
          <div className="mb-0 form-group">
            <table className="w-100">
              <thead></thead>
              <tbody>
                <tr>
                  <td style={{ width: "150px" }}>
                    <Controller
                      name="answer_header_true"
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
                      name="answer_header_false"
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
          <Fragment key={fieldOption.id}>
            <div
              className="d-flex align-items-center mt-1"
              style={{ gap: "50px" }}
            >
              <div className="flex-fill answer-question-create">
                <Controller
                  name={`question_options.${optionIndex}.option_choice`}
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
                name={`question_options.${optionIndex}.value`}
                defaultValue=""
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  const radioOptionClassNames = {
                    checkedTableCell: "chosen-cell",
                    uncheckedTableCell: null,
                    checkedKeyAnswerIcon: "chosen-key",
                    uncheckedKeyAnswerIcon: "unchosen-key",
                  };

                  const firstRadioOption = document.getElementById(
                    `question_options.${optionIndex}.value_0`
                  );
                  const isFirstRadioOptionChecked = firstRadioOption
                    ? firstRadioOption.checked || fieldOption.value == 1
                    : false;

                  const secondRadioOption = document.getElementById(
                    `question_options.${optionIndex}.value_1`
                  );
                  const isSecondRadioOptionChecked = secondRadioOption
                    ? secondRadioOption.checked || fieldOption.value == 0
                    : false;

                  return (
                    <FormGroup className="mb-0">
                      <table className="w-100 statement-question-table">
                        <thead></thead>
                        <tbody>
                          {optionIndex === 0 ? (
                            <tr>
                              <td colSpan={2} className="text-center p-50">
                                Kunci Jawaban
                              </td>
                            </tr>
                          ) : null}
                          <tr>
                            <td
                              id={`question_options.${optionIndex}.cell_0`}
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
                                  htmlFor={`question_options.${optionIndex}.value_0`}
                                >
                                  <input
                                    {...rest}
                                    ref={ref}
                                    className="form-check-input position-absolute invisible"
                                    style={{ top: "35%", left: "50%" }}
                                    type="radio"
                                    id={`question_options.${optionIndex}.value_0`}
                                    name={`question_options.${optionIndex}.value`}
                                    onChange={(event) => {
                                      toggleChosenStatementOptionKey(
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
                                    id={`question_options.${optionIndex}.key_0`}
                                    style={{
                                      top: "35%",
                                      left: "25%",
                                    }}
                                  ></div>
                                </label>
                              </div>
                            </td>
                            <td
                              id={`question_options.${optionIndex}.cell_1`}
                              className={clsx(
                                field.value === "false" && "chosen-cell",
                                isSecondRadioOptionChecked
                                  ? radioOptionClassNames["checkedTableCell"]
                                  : radioOptionClassNames["uncheckedTableCell"]
                              )}
                            >
                              <div className="custom-statement-option-basic position-relative">
                                <label
                                  className="form-check-label custom-statement-option-content"
                                  htmlFor={`question_options.${optionIndex}.value_1`}
                                  style={{
                                    border: error ? "1px solid red" : undefined,
                                  }}
                                >
                                  <input
                                    {...rest}
                                    ref={ref}
                                    className="form-check-input invisible"
                                    style={{ top: "35%", left: "50%" }}
                                    type="radio"
                                    id={`question_options.${optionIndex}.value_1`}
                                    name={`question_options.${optionIndex}.value`}
                                    onChange={(event) => {
                                      toggleChosenStatementOptionKey(
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
                                    id={`question_options.${optionIndex}.key_1`}
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
              {/* {questionOptions.length > 1 && (
                <Button
                  color="transparent"
                  className="p-1 bg-light-danger border-0"
                  onClick={() =>
                    handleRemoveOptionPerNumber(questionIndex, optionIndex)
                  }
                >
                  <Minus size={14} />
                </Button>
              )} */}
            </div>
          </Fragment>
        ))}
        {/* <Button
          size="sm"
          color="primary"
          className="mt-2 ml-auto d-block"
          onClick={() => handleAddOptionPerNumber(questionIndex)}
        >
          <Plus size={14} /> Tambah Opsi
        </Button> */}
      </>
    );
  };

  const IsianQuestion = ({ questionOptions }) => {
    return (
      <>
        <Label className="form-label">{getModuleTypeAnswerLabel()}</Label>
        {questionOptions.map((fieldOption, optionIndex) => (
          <Fragment key={fieldOption.id}>
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
                  name={`question_options.${optionIndex}.option_choice`}
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
                name={`question_options.${optionIndex}.value`}
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
                        placeholder="Bobot Nilai"
                        ref={(ref) => ref}
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />
            </div>
          </Fragment>
        ))}
        {/* <Button
          size="sm"
          color="primary"
          className="mt-2 ml-auto d-block"
          onClick={() => handleAddOptionPerNumber(questionIndex)}
        >
          <Plus size={14} /> Tambah Opsi
        </Button> */}
      </>
    );
  };

  const toggleChosenStatementOptionKey = (optionIndex, optionItemIndex) => {
    const currentOptionItemIndex = optionItemIndex;
    const siblingOptionItemIndex =
      optionItemIndex == 0 ? optionItemIndex + 1 : optionItemIndex - 1;

    const currentQuestionOptionTableCell = document.getElementById(
      `question_options.${optionIndex}.cell_${currentOptionItemIndex}`
    );
    const currentQuestionOptionKeyIconElement = document.getElementById(
      `question_options.${optionIndex}.key_${currentOptionItemIndex}`
    );
    const currentQuestionOptionRadioElement = document.getElementById(
      `question_options.${optionIndex}.value_${currentOptionItemIndex}`
    );

    const siblingQuestionOptionTableCell = document.getElementById(
      `question_options.${optionIndex}.cell_${siblingOptionItemIndex}`
    );
    const siblingQuestionOptionKeyIconElement = document.getElementById(
      `question_options.${optionIndex}.key_${siblingOptionItemIndex}`
    );
    const siblingQuestionOptionRadioElement = document.getElementById(
      `question_options.${optionIndex}.value_${siblingOptionItemIndex}`
    );

    // siblingQuestionOptionTableCell.classList.remove("chosen-cell");
    // siblingQuestionOptionKeyIconElement.classList.remove("chosen-key");

    // currentQuestionOptionTableCell.classList.toggle("chosen-cell");
    // currentQuestionOptionKeyIconElement.classList.toggle("chosen-key");
  };

  const getPayload = () => {
    const form = getValues();
    const copyOptions = [...form.question_options];
    const optionsDescByValue = copyOptions.sort(
      (a, b) => parseInt(b.value) - parseInt(a.value)
    );
    let true_answer_header = null;
    let false_answer_header = null;
    if (form.answer_type.value === "PERNYATAAN") {
      true_answer_header = form.answer_header_true;
      false_answer_header = form.answer_header_false;
    }
    const highestOption = optionsDescByValue[0];
    return {
      id: form.id,
      question: form.question,
      program: form.program.slug,
      sub_category: form.sub_category.id,
      explanation: form.explanation,
      explanation_media: form.explanation_media,
      answer_type: form.answer_type.value,
      question_categories_id: form.question_category.id,
      question_type: form.question_type.value,
      tags: form.tags,
      question_keyword: form.question_keyword,
      answer_header_true: true_answer_header,
      answer_header_false: false_answer_header,
      answers: generateAnswersPayload({
        answer_type: form.answer_type.value,
        question_options: form.question_options,
      }),
    };
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
      id: typeof option.id == "string" ? option.nanoid() : option.id,
      answer: option.option_choice,
      score: [1, "true"].includes(option.value) ? 1 : 0,
      is_true: [1, "true"].includes(option.value),
    }));
  };

  const generateCheckboxAnswersPayload = (question_options) => {
    return question_options.map((option) => ({
      id: typeof option.id == "string" ? option.nanoid() : option.id,
      answer: option.option_choice,
      score: [1, true].includes(option.value) ? 1 : 0,
      is_true: [1, true].includes(option.value) == true,
    }));
  };

  const generateIsianAnswerPayload = (question_options) => {
    return question_options.map((option) => ({
      id: typeof option.id == "string" ? option.nanoid() : option.id,
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
      id: typeof option.id == "string" ? option.nanoid() : option.id,
      option: option.option,
      answer: option.option_choice,
      score: +option.value,
      is_true: option.option === highestOption.option,
    }));
  };

  const loadQuestionChoicesOptions = () => {
    const currentForm = getValues();
    const currentAnswerType = currentForm?.answer_type?.value;
    const isMultipleChoicesOrEssaysAnswerType = [
      "PERNYATAAN",
      "CHECKBOX",
    ].includes(currentAnswerType);
    const currentQuestionOptions = [...currentForm.question_options];
    if (isMultipleChoicesOrEssaysAnswerType) {
      let optionChar = "A";
      currentQuestionOptions?.forEach((option, index) => {
        setValue(`question_options.${index}.option`, optionChar);
        optionChar = String.fromCharCode(optionChar.charCodeAt() + 1);
      });
    }
    currentQuestionOptions?.forEach((option, index) => {
      setValue(`question_options.${index}.value`, "");
    });
    setValue("answer_header_true", "");
    setValue("answer_header_false", "");
  };

  const redirectToIndexPage = () => {
    window.location.href = "/ujian/bank-soal";
  };

  const submitHandler = async () => {
    trigger();
    if (isObjEmpty(errors)) {
      const payload = getPayload();
      payload.cancelToken = source.token;
      try {
        setIsSubmitting(true);
        await updateQuestion(payload.id, { data: payload });
        if (!isCanceled.current) {
          redirectToIndexPage();
        }
      } catch (error) {
        setIsSubmitting(false);
        console.log({ error });
      }
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (program?.slug) {
      let finalModuleTypeOptions = [...initialModuleTypeOptions];
      if (program?.slug === "utbk") {
        finalModuleTypeOptions = [
          ...moduleTypeOptions,
          checkboxModuleTypeOption,
          statementModuleTypeOption,
        ];
      }
      if (!isLoading) {
        setValue(`answer_type`, "");
        setModuleTypeOptions(finalModuleTypeOptions);
      }
      (async () => {
        try {
          setValue("question_category", "");
          setValue("sub_category", "");
          setCategories([]);
          setSubCategories([]);
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
    }
  }, [program?.slug]);

  useEffect(() => {
    if (!isLoading || !question) return;
    setValue(
      "answer_type",
      moduleTypeOptions.find((type) => type.value == question.answer_type)
    );
    setIsLoading(false);
  }, [question, moduleTypeOptions]);

  useEffect(() => {
    if (isLoading) return;
    if (program?.slug !== "utbk") {
      if (answer_type?.value !== "") {
        setValue(`answer_type`, "");
      }
    }
  }, [program?.slug]);

  useEffect(() => {
    fetchQuestion();
  }, []);

  return (
    <Card className={classnames(isSubmitting && "block-content")}>
      {isLoading ? (
        <SpinnerCenter />
      ) : (
        <>
          {initialQuestion?.parent_id || initialQuestion?.child_questions ? (
            <Col className="mx-auto">
              <div
                className="alert alert-info mt-1 alert-validation-msg"
                role="alert"
              >
                <div className="alert-body">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-info mr-50 align-middle"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <span>
                    Soal ini sudah berelasi dengan soal lain, untuk dapat
                    mengubah kategori soal pastikan soal tidak berelasi dengan
                    soal lain
                  </span>
                </div>
              </div>
            </Col>
          ) : null}
          <CardHeader>
            <Badge color="primary">Nomor #{id}</Badge>
          </CardHeader>
          <Form onSubmit={handleSubmit(submitHandler)}>
            <CardBody className="pt-0">
              <Row>
                <Col md={6}>
                  <Controller
                    name="answer_type"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">Tipe Jawaban</Label>
                          <Select
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                            {...field}
                            isDisabled={true}
                            options={moduleTypeOptions}
                            onChange={(value) => {
                              field.onChange(value);
                              loadQuestionChoicesOptions();
                            }}
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
                    name="question_type"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">Tipe Soal</Label>
                          <Select
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                            {...field}
                            isDisabled
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
                    name="program"
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <FormGroup className="flex-fill">
                          <Label className="form-label">Pilih Program</Label>
                          <Select
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                zIndex: 9999,
                              }),
                            }}
                            {...field}
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
                    name="question_category"
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
                              onCategoryChange(value);
                            }}
                            isLoading={isFetchingCategory}
                            // isDisabled={isFetchingCategory}
                            isDisabled={
                              initialQuestion?.parent_id ||
                              initialQuestion?.child_questions
                                ? true
                                : false
                            }
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
                    name="sub_category"
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
                            options={subCategories}
                            isLoading={isFetchingSubCategories}
                            isDisabled={isFetchingSubCategories}
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
                    name="question"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <>
                        <Label className="form-label">Pertanyaan</Label>
                        <FormGroup>
                          <div
                            className={classnames(error && "custom-is-invalid")}
                          >
                            {initialQuestion?.question ? (
                              <CustomCKEditor
                                initData={value}
                                data={value}
                                onChange={onChange}
                              />
                            ) : null}
                          </div>
                        </FormGroup>
                      </>
                    )}
                  />
                  {fetchQuestionOptionsComponent(question_options)}
                  {/* {question_options.map((fieldOption, optionIndex) => (
                    <Fragment key={fieldOption.id}>
                      <div className="d-flex mt-1">
                        <Controller
                          name={`question_options.${optionIndex}.option`}
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
                                  innerRef={ref}
                                  invalid={error && true}
                                  className="text-center h-100"
                                />
                              </FormGroup>
                            );
                          }}
                        />
                        <div className="flex-fill mr-1  answer-question-edit">
                          <Controller
                            name={`question_options.${optionIndex}.option_choice`}
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
                          name={`question_options.${optionIndex}.value`}
                          control={control}
                          render={({ field, fieldState: { error } }) => {
                            return (
                              <FormGroup className="mb-0">
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
                      </div>
                    </Fragment>
                  ))} */}

                  {/* <Button
                    size="sm"
                    color="primary"
                    className="mt-2 ml-auto d-block"
                    onClick={handleAddOptionPerNumber}
                  >
                    <Plus size={14} /> Tambah Opsi
                  </Button> */}

                  <Controller
                    name="explanation"
                    control={control}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <>
                        <Label className="form-label mt-2">
                          Penjelasan Soal
                        </Label>
                        <div
                          className={classnames(error && "custom-is-invalid")}
                        >
                          {initialQuestion?.explanation ? (
                            <CustomCKEditor
                              initData={value}
                              data={value}
                              onChange={onChange}
                            />
                          ) : null}
                        </div>
                      </>
                    )}
                  />

                  <Controller
                    name="explanation_media"
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
                            id="explanation_media"
                            innerRef={ref}
                            invalid={error && true}
                            placeholder=""
                            onClick={(e) =>
                              openFileManager(e, `explanation_media`)
                            }
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                        </FormGroup>
                      );
                    }}
                  />

                  {Array.isArray(tags) ? (
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
                            Gunakan simbol koma (,) untuk penginputan lebih dari
                            1
                          </small>
                        </FormGroup>
                      )}
                    />
                  ) : null}

                  {Array.isArray(question_keyword) ? (
                    <Controller
                      isClearable
                      control={control}
                      name="input_question_keyword"
                      render={({ field, fieldState: { error } }) => (
                        <FormGroup className="mt-1">
                          <Label>
                            Kata Kunci <small>(Opsional)</small>
                          </Label>
                          <MultipleInputSelect
                            setValue={setValue}
                            fieldName={field.name}
                            defaultValue={question_keyword}
                            valueName="question_keyword"
                            currentValue={field.value}
                            changeHandler={field.onChange}
                          />
                          <FormFeedback>{error?.message}</FormFeedback>
                          <small>
                            Gunakan simbol koma (,) untuk penginputan lebih dari
                            1
                          </small>
                        </FormGroup>
                      )}
                    />
                  ) : null}
                </Col>
              </Row>
            </CardBody>

            <div
              className={classnames(
                "bg-light-primary mt-3 p-2",
                "d-flex justify-content-end align-items-center"
              )}
            >
              <Button
                type="submit"
                color="primary"
                disabled={isFetchingCategory || isFetchingSubCategories}
              >
                {isSubmitting ? (
                  "Sedang Memperbarui..."
                ) : isFetchingCategory || isFetchingSubCategories ? (
                  "Please wait"
                ) : (
                  <>
                    <Save size={14} /> Perbarui Soal
                  </>
                )}
              </Button>
            </div>
          </Form>
        </>
      )}
    </Card>
  );
};

export default EditQuestionForm;
