import { Fragment, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Form, Modal, ModalBody, ModalHeader } from "reactstrap";

import Header from "./Header";
import Main from "./Main";
import { getStudentByClassroomId } from "../../../services/samapta/samapta";
import { showToast } from "../../../utility/Utils";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const CreateSessionScoreForm = ({ open, close, ids, dataClass }) => {
  const FormSchema = yup.object().shape({
    session_name: yup.string().required("Wajib diisi"),
    session_date: yup.string().required("Wajib diisi"),
    students: yup.array().of(
      yup.object().shape({
        scores: yup.object().shape({
          run: yup
            .mixed("Nilai tidak valid")
            .test(
              "run_score_is_required",
              "Wajib diisi",
              function (value, context) {
                const addScore = context?.from[1]?.value?.add_score;
                if (!addScore) {
                  return true;
                }
                return value;
              }
            )
            .test(
              "run_score_is_not_valid",
              "Nilai tidak valid",
              function (value, context) {
                const addScore = context?.from[1]?.value?.add_score;
                if (!addScore) {
                  return true;
                }
                const parsedValue = +value;
                return !isNaN(parsedValue);
              }
            ),
          sit_up: yup
            .mixed("Nilai tidak valid")
            .test(
              "sit_up_score_is_required",
              "Wajib diisi",
              function (value, context) {
                const addScore = context?.from[1]?.value?.add_score;
                if (!addScore) {
                  return true;
                }
                return value;
              }
            )
            .test(
              "sit_up_score_is_not_valid",
              "Nilai tidak valid",
              function (value, context) {
                const addScore = context?.from[1]?.value?.add_score;
                if (!addScore) {
                  return true;
                }
                const parsedValue = +value;
                return !isNaN(parsedValue);
              }
            ),
          push_up: yup
            .mixed("Nilai tidak valid")
            .test(
              "push_up_score_is_required",
              "Wajib diisi",
              function (value, context) {
                const addScore = context?.from[1]?.value?.add_score;
                if (!addScore) {
                  return true;
                }
                return value;
              }
            )
            .test(
              "push_up_score_is_not_valid",
              "Nilai tidak valid",
              function (value, context) {
                const addScore = context?.from[1]?.value?.add_score;
                if (!addScore) {
                  return true;
                }
                const parsedValue = +value;
                return !isNaN(parsedValue);
              }
            ),
          // pull_up: yup
          //   .mixed("Nilai tidak valid")
          //   .test(
          //     "pull_up_score_is_required",
          //     "Wajib diisi",
          //     function (value, context) {
          //       const addScore = context?.from[1]?.value?.add_score;
          //       if (!addScore) {
          //         return true;
          //       }
          //       return value;
          //     }
          //   )
          //   .test(
          //     "pull_up_score_is_not_valid",
          //     "Nilai tidak valid",
          //     function (value, context) {
          //       const addScore = context?.from[1]?.value?.add_score;
          //       if (!addScore) {
          //         return true;
          //       }
          //       const parsedValue = +value;
          //       return !isNaN(parsedValue);
          //     }
          //   ),
          shuttle: yup
            .mixed("Nilai tidak valid")
            .test(
              "shuttle_score_is_required",
              "Wajib diisi",
              function (value, context) {
                const addScore = context?.from[1]?.value?.add_score;
                if (!addScore) {
                  return true;
                }
                return value;
              }
            )
            .test(
              "shuttle_score_is_not_valid",
              "Nilai tidak valid",
              function (value, context) {
                const addScore = context?.from[1]?.value?.add_score;
                if (!addScore) {
                  return true;
                }
                const parsedValue = +value;
                return !isNaN(parsedValue);
              }
            ),
          // swim: yup
          //   .mixed("Nilai tidak valid")
          //   .test(
          //     "swim_score_is_required",
          //     "Wajib diisi",
          //     function (value, context) {
          //       const addScore = context?.from[1]?.value?.add_score;
          //       if (!addScore) {
          //         return true;
          //       }

          //       const selectionType = selection_type?.value;
          //       if (selectionType != "TNI-POLRI") {
          //         return true;
          //       }

          //       return selectionType == "TNI-POLRI" && value;
          //     }
          //   )
          //   .test(
          //     "swim_score_is_not_valid",
          //     "Nilai tidak valid",
          //     function (value, context) {
          //       const addScore = context?.from[1]?.value?.add_score;
          //       if (!addScore) {
          //         return true;
          //       }
          //       const parsedValue = +value;
          //       return !isNaN(parsedValue);
          //     }
          //   ),
        }),
      })
    ),
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      session_name: "",
      session_date: "",
    },
  });

  const { fields, replace, update } = useFieldArray({
    control,
    name: "students",
    defaultValues: [],
  });
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  const toggleModal = () => {
    setIsModalOpen((current) => !current);
  };

  // const onSubmit = (data) => console.log(data);
  async function submitData() {
    try {
      setIsSubmitting(true);
      const formValues = getValues();

      const payload = [];

      formValues.students.forEach((student) => {
        const classroomId = ids;

        // Check if there is an existing payload object with the same classroom_id
        let existingClassroomObject = payload.find(
          (obj) => obj.classroom_id === classroomId
        );

        // If not, create a new object for this classroom_id
        if (!existingClassroomObject) {
          existingClassroomObject = {
            title: formValues.session_name,
            description: null,
            year: +dataClass.year,
            date: formValues.session_date,
            status: null,
            instance:
              dataClass.tags.includes("SKD") &&
              dataClass.tags.includes("SAMAPTA")
                ? "SEKDIN"
                : "",
            classroom_id: classroomId,
            record_classroom: [],
          };
          payload.push(existingClassroomObject);
        }

        // Create a new student object for exercise_a and exercise_b
        const newStudentObject = {
          smartbtw_id: +student.smartbtw_id,
          name: student.name,
          email: student.email,
          gender: +student.gender,
          exercise_a: {
            r_score: +student.scores.run,
          },
          exercise_b: [
            {
              type: "SIT_UP",
              r_score: +student.scores.sit_up,
            },
            {
              type: "PUSH_UP",
              r_score: +student.scores.push_up,
            },
            {
              type: "SHUTTLE",
              r_score: +(student.scores.shuttle / 1000).toFixed(1),
            },
          ],
        };

        // Add the new student object to the existing classroom object
        existingClassroomObject.record_classroom.push(newStudentObject);
      });

      const url = "/api/samapta/students/create";
      const response = await axios.post(url, {
        ...payload,
      });
      const data = await response.data;
      if (data.success) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data berhasil ditambah",
        });
        setTimeout(() => {
          window.location.href = `/samapta/list-class/${ids}`;
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setIsFetchingStudents(true);
        const data = await getStudentByClassroomId(ids);
        const dataWithScores = data?.length
          ? data?.map((item) => {
              return {
                ...item,
                add_score: false,
                scores: {
                  run: "",
                  sit_up: "",
                  push_up: "",
                  pull_up: "",
                  shuttle: "",
                  swim: "",
                },
              };
            })
          : [];
        replace(dataWithScores);
      } catch (error) {
        console.log(error);
      } finally {
        setIsFetchingStudents(false);
      }
    })();
  }, []);

  return (
    <Fragment>
      <Modal isOpen={open} toggle={toggleModal} size="xl" centered>
        <ModalHeader toggle={close}></ModalHeader>
        <ModalBody className="p-0">
          <Form onSubmit={handleSubmit(submitData)}>
            <Header control={control} errors={errors} />
            <Main
              control={control}
              errors={errors}
              formValues={watch}
              isFetchingStudents={isFetchingStudents}
              isSubmitting={isSubmitting}
              fields={fields}
              updateField={update}
              replaceField={replace}
              toggleModal={toggleModal}
              keywordFilter={keywordFilter}
              setKeywordFilter={setKeywordFilter}
              genderFilter={genderFilter}
              setGenderFilter={setGenderFilter}
              setClose={close}
            />
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};
export default CreateSessionScoreForm;
