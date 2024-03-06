import * as yup from "yup";
import Select from "react-select";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Save } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Col,
  Card,
  Form,
  Input,
  Label,
  Button,
  CardBody,
  FormGroup,
  FormFeedback,
} from "reactstrap";
import {
  getLastSegment,
  isObjEmpty,
  selectThemeColors,
  showToast,
} from "../../../utility/Utils";
import React, { useContext, useEffect, useRef, useState } from "react";

import SelectQuestion from "./select-question";
import { getBranches } from "../../../data/branch";
// import { programs } from "../../../config/programs";
import SelectedQuestionIndex from "./selected-question";
import {
  saveModule,
  getModulesByModuleCode,
  updateModule,
} from "../../../services/exam-cpns/module";
import { ExamModuleContext } from "../../../context/ExamModuleContext";
import MultipleInputSelect from "../../core/multiple-input-select/MultipleInputSelect";
import SpinnerCenter from "../../core/spinners/Spinner";

const programs = [
  {
    name: "SKD",
    slug: "skd",
  },
  {
    name: "SKB",
    slug: "skb",
  },
];
const FormSchema = yup.object().shape({
  module_name: yup.string().required(),
  program: yup.object().required(),
  module_type: yup.object().required(),
  input_tags: yup.string(),
  tags: yup.array().of(yup.string()),
  allowed_branch: yup.array().of(yup.object()).required().min(1),
});

const moduleType = [
  {
    label: "Soal Berurutan",
    value: "SEQUENTIAL",
  },
  {
    label: "Soal Acak",
    value: "RANDOM",
  },
];

const CreateEditModuleForm = ({ type }) => {
  const [isLoading, setIsloading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingModule, setIsFetchingModule] = useState(
    type == "edit" ? true : false
  );
  const [modules, setModules] = useState();
  const [branches, setBranches] = useState();
  const [isFetchingBranch, setIsFetchingBranch] = useState(false);
  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues:
      type === "edit"
        ? {
            module_name: "",
            allowed_branch: [],
            tags: [],
          }
        : {
            module_name: "",
            program: programs.find((program) => program.slug == "skd"),
            allowed_branch: [],
            tags: [],
          },
    resolver: yupResolver(FormSchema),
  });
  const isCanceled = useRef(false);
  const { examModuleState, getQuestions, selectQuestionForce, query } =
    useContext(ExamModuleContext);
  const { questions, selectedQuestionData, page, limit } = examModuleState;
  const { program, tags, allowed_branch } = watch();

  const getPayload = () => {
    const form = getValues();
    let updatedQuestionsId = [];
    selectedQuestionData?.map((question) => {
      updatedQuestionsId.push(question.id);
      if (question?.child_questions?.length > 0) {
        question?.child_questions?.map((childQuestion) => {
          updatedQuestionsId.push(childQuestion.id);
        });
      }
    });

    if (updatedQuestionsId.length > 0) {
      if (type === "edit") {
        if (form.module_name != modules.name) {
          const payload = { name: form.module_name };
          return payload;
        } else {
          const payload = {
            name: form.module_name,
            program: form.program.slug,
            question_ids: updatedQuestionsId,
            question_ordering: form.module_type.value,
            allowed_branch: form.allowed_branch?.map((branch) => branch.code),
            tags: form.tags,
          };
          return payload;
        }
      } else if (type === "create") {
        const payload = {
          name: form.module_name,
          program: form.program.slug,
          question_ids: updatedQuestionsId,
          question_ordering: form.module_type.value,
          allowed_branch: form.allowed_branch?.map((branch) => branch.code),
          tags: form.tags,
        };
        return payload;
      }
    } else {
      showToast({
        type: "warning",
        message: "Silahkan pilih soal terlebih dahulu",
      });
    }
  };

  const redirectToIndexPage = () => {
    window.location.href = "/ujian-cpns/modul";
  };

  const submitHandler = () => {
    trigger();
    if (isObjEmpty(errors)) {
      (async () => {
        try {
          const payload = getPayload();
          if (payload) {
            setIsSubmitting(true);
            if (type == "create") {
              await saveModule({ data: payload });
            }
            if (type == "edit") {
              const module_code = getLastSegment();
              const data = await getModulesByModuleCode(module_code);
              await updateModule({ data: payload }, data.id);
            }
            if (!isCanceled.current) {
              redirectToIndexPage();
            }
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

  const fetchBranches = async () => {
    try {
      setIsFetchingBranch(true);
      const data = await getBranches();
      if (!isCanceled.current) {
        setBranches(data);
        setIsFetchingBranch(false);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingBranch(false);
      }
    }
  };

  const loadEdit = async () => {
    try {
      setIsloading(true);
      const module_code = getLastSegment();
      const data = await getModulesByModuleCode(module_code);
      if (!isCanceled.current) {
        setValue("module_name", data?.name);
        setValue(
          "program",
          programs.find((program) => program.slug == data?.program)
        );
        setValue(
          "module_type",
          moduleType.find((type) => type.value == data?.question_ordering)
        );
        setValue("tags", data?.tags);
        setModules(data);
        setIsloading(false);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsloading(false);
      }
    }
  };

  useEffect(() => {
    if (branches && modules) {
      const currentSelectedBranches = modules.allowed_branch;
      const selectedBranchDetails = branches.filter((branch) =>
        currentSelectedBranches.includes(branch.code)
      );
      setValue("allowed_branch", selectedBranchDetails);
    }
  }, [branches, modules]);

  useEffect(() => {
    fetchBranches();
    if (type === "edit") {
      loadEdit();
    }
  }, []);

  useEffect(() => {
    if (program && query.length == 0) {
      getQuestions({
        program: program?.slug,
        types: "STANDALONE,PARENT",
        pages: page,
        limit: limit,
      });
    }
  }, [program?.slug, query, page]);

  useEffect(() => {
    if (questions.length > 0) {
      if (modules && isFetchingModule) {
        setIsFetchingModule(false);
        const selectedQuestions = modules?.questions;
        let orderedQuestions = [];
        selectedQuestions?.map((question) => {
          if (question.question_type == "PARENT") {
            const currentChildIndex = orderedQuestions.findIndex(
              (q) => q.parent_id == question.id
            );
            if (currentChildIndex == -1) {
              const myChildrens = selectedQuestions.filter(
                (child) => child.parent_id == question.id
              );
              orderedQuestions = [
                ...orderedQuestions,
                question,
                ...myChildrens,
              ];
            } else {
              orderedQuestions.splice(currentChildIndex, 0, question);
            }
          } else {
            orderedQuestions = [...orderedQuestions, question];
          }
        });
        orderedQuestions?.map((question) => {
          selectQuestionForce(question);
        });
      }
    }
  }, [modules, questions.length]);

  return (
    <Card
      className={classnames(isSubmitting && "block-content", "overflow-hidden")}
    >
      <CardBody>
        {isLoading ? (
          <SpinnerCenter />
        ) : (
          <Form
            onSubmit={handleSubmit(submitHandler)}
            onKeyDown={(e) => {
              const code = e.keyCode || e.code || e.which;
              if (code == 13) {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
          >
            <Col md={6} className={classnames("mt-2 pl-0")}>
              <Controller
                name="module_name"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, onChange, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Nama Modul</Label>
                      <Input
                        {...rest}
                        id="module_name"
                        onChange={(event) => onChange(event, onChange)}
                        innerRef={ref}
                        invalid={error && true}
                        placeholder="Inputkan Nama Modul"
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
                      <Label className="form-label">Program</Label>
                      <Select
                        {...field}
                        styles={{
                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                        isSearchable={false}
                        isDisabled={type == "create" ? false : true}
                        options={programs}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.slug}
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
                name="module_type"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Pilih Tipe Modul</Label>
                      <Select
                        {...field}
                        isSearchable={false}
                        options={moduleType}
                        onChange={(value) => {
                          field.onChange(value);
                          setValue("module_type", value);
                        }}
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
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
                name="allowed_branch"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">Akses Untuk Cabang</Label>
                      <Select
                        {...field}
                        styles={{
                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                        isMulti={true}
                        isSearchable={true}
                        options={branches}
                        defaultValue={allowed_branch}
                        isLoading={isFetchingBranch}
                        isDisabled={isFetchingBranch}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.code}
                        classNamePrefix="select"
                        theme={selectThemeColors}
                        className={classnames("react-select", {
                          "is-invalid": error && true,
                        })}
                      />
                    </FormGroup>
                  );
                }}
              />
            </Col>
            <Col md="12" className="px-0">
              <Label className="form-label">Pilih Soal</Label>
              <SelectQuestion />
            </Col>
            <Col md="12">
              <div className="bg-light-success mx-n3 mt-1 px-3 py-2">
                <h6 className="section-label my-1">Soal Terpilih</h6>
              </div>
              <SelectedQuestionIndex />
            </Col>
            <div className="text-right mt-3">
              <Button type="submit" color="success">
                {type === "edit" ? (
                  <>
                    {isSubmitting ? (
                      "Sedang Mengupdate..."
                    ) : (
                      <>
                        <Save size={14} /> Update Modul
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {isSubmitting ? (
                      "Sedang Menyimpan..."
                    ) : (
                      <>
                        <Save size={14} /> Simpan Modul
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

CreateEditModuleForm.propTypes = {
  type: PropTypes.oneOf(["create", "edit"]),
};

export default CreateEditModuleForm;
