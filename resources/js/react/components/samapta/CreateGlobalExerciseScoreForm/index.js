import { Fragment, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Form, Modal, ModalBody, ModalHeader } from "reactstrap";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import Header from "./Header";
import Main from "./Main";
import { getStudentsBySelection } from "../../../services/samapta/samapta";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { showToast } from "../../../utility/Utils";

const MySwal = withReactContent(Swal);

const CreateGlobalExerciseScoreForm = ({ open, close }) => {
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [keywordFilter, setKeywordFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  const FormSchema = yup.object().shape({
    selection_type: yup
      .object()
      .required("Wajib diisi")
      .typeError("Wajib diisi"),
    selection_year: yup
      .object()
      .required("Wajib diisi")
      .typeError("Wajib diisi"),
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
          swim: yup
            .mixed("Nilai tidak valid")
            .test(
              "swim_score_is_required",
              "Wajib diisi",
              function (value, context) {
                const addScore = context?.from[1]?.value?.add_score;
                if (!addScore) {
                  return true;
                }

                const selectionType = selection_type?.value;
                if (selectionType != "TNI-POLRI") {
                  return true;
                }

                return selectionType == "TNI-POLRI" && value;
              }
            )
            .test(
              "swim_score_is_not_valid",
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
        }),
      })
    ),
  });

  const { control, handleSubmit, watch, getValues } = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      selection_type: "",
      selection_year: "",
      session_name: "",
      session_date: "",
    },
  });

  const { fields, replace, update } = useFieldArray({
    control,
    name: "students",
    defaultValues: [],
  });

  const { selection_type, selection_year } = watch();

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
        const classroomId = student.classroom_id;

        // Check if there is an existing payload object with the same classroom_id
        let existingClassroomObject = payload.find(
          (obj) => obj.classroom_id === classroomId
        );

        // If not, create a new object for this classroom_id
        if (!existingClassroomObject) {
          existingClassroomObject = {
            title: formValues.session_name,
            description: null,
            year: +formValues.selection_year.value,
            date: formValues.session_date,
            status: "",
            instance: formValues.selection_type.label,
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
          window.location.href = "/samapta";
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!selection_type?.value || !selection_year?.value) {
      return;
    }
    (async () => {
      if (fields.length) {
        const state = await MySwal.fire({
          title: "Yakin mengubah data?",
          icon: "info",
          text: "dengan menekan yakin, semua nilai yang telah anda inputkan akan hilang",
          showCancelButton: true,
          confirmButtonText: "Yakin",
          cancelButtonText: "Batal",
          customClass: {
            confirmButton: "btn btn-info",
            cancelButton: "btn btn-outline-info ml-1",
          },
          buttonsStyling: false,
        });
        if (state.isDismissed) return;
      }

      try {
        setIsFetchingStudents(true);
        const data = await getStudentsBySelection({
          selection_type: selection_type.value,
          selection_year: selection_year.value,
        });
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
        setKeywordFilter("");
        setGenderFilter("");
      } catch (error) {
        console.log(error);
      } finally {
        setIsFetchingStudents(false);
      }
    })();
  }, [selection_type?.value, selection_year?.value]);

  return (
    <Fragment>
      <Modal isOpen={open} toggle={toggleModal} size="xl" centered>
        <ModalHeader toggle={close}></ModalHeader>
        <ModalBody className="p-0">
          <Form onSubmit={handleSubmit(submitData)}>
            <Header control={control} />
            <Main
              control={control}
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
export default CreateGlobalExerciseScoreForm;
