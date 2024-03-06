import { Fragment, useEffect, useState } from "react";
import { useFieldArray, Controller, useForm } from "react-hook-form";
import {
  Form,
  Modal,
  ModalBody,
  FormFeedback,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import Flatpickr from "react-flatpickr";

import "react-slidedown/lib/slidedown.css";
import "flatpickr/dist/themes/airbnb.css";

import clsx from "clsx";
import Main from "./Main";
import { getStudentBySessionId } from "../../../services/samapta/samapta";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import styles from "./index.module.css";
import { showToast } from "../../../utility/Utils";
import moment from "moment-timezone";

const EditSessionScoreForm = ({ open, close, sessionId }) => {
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [data, setData] = useState([]);
  const [dataSession, setDataSession] = useState([]);

  const FormSchema = yup.object().shape({
    session_name: yup.string().required("Wajib diisi"),
    session_date: yup.string().required("Wajib diisi"),
    // students: yup.array().of(
    //   yup.object().shape({
    //     scores: yup.object().shape({
    //       run: yup
    //         .mixed("Nilai tidak valid")
    //         .test(
    //           "run_score_is_required",
    //           "Wajib diisi",
    //           function (value, context) {
    //             const addScore = context?.from[1]?.value?.add_score;
    //             if (!addScore) {
    //               return true;
    //             }
    //             return value;
    //           }
    //         )
    //         .test(
    //           "run_score_is_not_valid",
    //           "Nilai tidak valid",
    //           function (value, context) {
    //             const addScore = context?.from[1]?.value?.add_score;
    //             if (!addScore) {
    //               return true;
    //             }
    //             const parsedValue = +value;
    //             return !isNaN(parsedValue);
    //           }
    //         ),
    //       sit_up: yup
    //         .mixed("Nilai tidak valid")
    //         .test(
    //           "sit_up_score_is_required",
    //           "Wajib diisi",
    //           function (value, context) {
    //             const addScore = context?.from[1]?.value?.add_score;
    //             if (!addScore) {
    //               return true;
    //             }
    //             return value;
    //           }
    //         )
    //         .test(
    //           "sit_up_score_is_not_valid",
    //           "Nilai tidak valid",
    //           function (value, context) {
    //             const addScore = context?.from[1]?.value?.add_score;
    //             if (!addScore) {
    //               return true;
    //             }
    //             const parsedValue = +value;
    //             return !isNaN(parsedValue);
    //           }
    //         ),
    //       push_up: yup
    //         .mixed("Nilai tidak valid")
    //         .test(
    //           "push_up_score_is_required",
    //           "Wajib diisi",
    //           function (value, context) {
    //             const addScore = context?.from[1]?.value?.add_score;
    //             if (!addScore) {
    //               return true;
    //             }
    //             return value;
    //           }
    //         )
    //         .test(
    //           "push_up_score_is_not_valid",
    //           "Nilai tidak valid",
    //           function (value, context) {
    //             const addScore = context?.from[1]?.value?.add_score;
    //             if (!addScore) {
    //               return true;
    //             }
    //             const parsedValue = +value;
    //             return !isNaN(parsedValue);
    //           }
    //         ),
    //       // pull_up: yup
    //       //   .mixed("Nilai tidak valid")
    //       //   .test(
    //       //     "pull_up_score_is_required",
    //       //     "Wajib diisi",
    //       //     function (value, context) {
    //       //       const addScore = context?.from[1]?.value?.add_score;
    //       //       if (!addScore) {
    //       // //         return true;
    //       // //       }
    //       // //       return value;
    //       // //     }
    //       // //   )
    //       // //   .test(
    //       //     "pull_up_score_is_not_valid",
    //       //     "Nilai tidak valid",
    //       //     function (value, context) {
    //       //       const addScore = context?.from[1]?.value?.add_score;
    //       //       if (!addScore) {
    //       //         return true;
    //       //       }
    //       //       const parsedValue = +value;
    //       //       return !isNaN(parsedValue);
    //       //     }
    //       //   ),
    //       shuttle: yup
    //         .mixed("Nilai tidak valid")
    //         .test(
    //           "shuttle_score_is_required",
    //           "Wajib diisi",
    //           function (value, context) {
    //             const addScore = context?.from[1]?.value?.add_score;
    //             if (!addScore) {
    //               return true;
    //             }
    //             return value;
    //           }
    //         )
    //         .test(
    //           "shuttle_score_is_not_valid",
    //           "Nilai tidak valid",
    //           function (value, context) {
    //             const addScore = context?.from[1]?.value?.add_score;
    //             if (!addScore) {
    //               return true;
    //             }
    //             const parsedValue = +value;
    //             return !isNaN(parsedValue);
    //           }
    //         ),
    //       // swim: yup
    //       //   .mixed("Nilai tidak valid")
    //       //   .test(
    //       //     "swim_score_is_required",
    //       //     "Wajib diisi",
    //       //     function (value, context) {
    //       //       const addScore = context?.from[1]?.value?.add_score;
    //       //       if (!addScore) {
    //       //         return true;
    //       //       }

    //       //       const selectionType = selection_type?.value;
    //       //       if (selectionType != "TNI-POLRI") {
    //       //         return true;
    //       //       }

    //       //       return selectionType == "TNI-POLRI" && value;
    //       //     }
    //       //   )
    //       //   .test(
    //       //     "swim_score_is_not_valid",
    //       //     "Nilai tidak valid",
    //       //     function (value, context) {
    //       //       const addScore = context?.from[1]?.value?.add_score;
    //       //       if (!addScore) {
    //       //         return true;
    //       //       }
    //       //       const parsedValue = +value;
    //       //       return !isNaN(parsedValue);
    //       //     }
    //       //   ),
    //     }),
    //   })
    // ),
  });

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
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

  const toggleModal = () => {
    setIsModalOpen((current) => !current);
  };

  // const onSubmit = (data) => console.log(data);
  async function submitData() {
    try {
      const formValues = getValues();
      // const payload = [];

      // formValues.students.forEach((student) => {
      //   const classroomId = dataSession.classroom_id;

      //   // Check if there is an existing payload object with the same classroom_id
      //   let existingClassroomObject = payload.find(
      //     (obj) => obj.classroom_id === classroomId
      //   );

      //   // If not, create a new object for this classroom_id
      //   if (!existingClassroomObject) {
      //     existingClassroomObject = {
      //       title: formValues.session_name,
      //       description: null,
      //       year: +dataSession.year,
      //       date: formValues.session_date,
      //       status: null,
      //       // instance: formValues.selection_type.label,
      //       classroom_id: classroomId,
      //       record_classroom: [],
      //     };
      //     payload.push(existingClassroomObject);
      //   }

      //   // Create a new student object for exercise_a and exercise_b
      //   const newStudentObject = {
      //     smartbtw_id: +student.smartbtw_id,
      //     name: student.name,
      //     email: student.email,
      //     gender: +student.gender,
      //     exercise_a: {
      //       r_score: +student.scores.run,
      //     },
      //     exercise_b: [
      //       {
      //         type: "SIT_UP",
      //         r_score: +student.scores.sit_up,
      //       },
      //       {
      //         type: "PUSH_UP",
      //         r_score: +student.scores.push_up,
      //       },
      //       {
      //         type: "SHUTTLE",
      //         r_score: +student.scores.shuttle,
      //       },
      //     ],
      //   };

      //   // Add the new student object to the existing classroom object
      //   existingClassroomObject.record_classroom.push(newStudentObject);
      // });
      const payload = {
        title: formValues.session_name,
        description: null,
        year: +dataSession.year,
        date: formValues.session_date,
        status: null,
        // instance: formValues.selection_type.label, // Tambahkan instance sesuai kebutuhan Anda
        classroom_id: dataSession.classroom_id,
        record_classroom: [],
      };

      formValues.students.forEach((student) => {
        const newStudentObject = {
          smartbtw_id: student.smartbtw_id,
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
              type: "PUSH_UP", // Sesuaikan dengan jenis olahraga yang benar
              r_score: +student.scores.push_up,
            },
            {
              type: "SHUTTLE", // Sesuaikan dengan jenis olahraga yang benar
              r_score: +(student.scores.shuttle / 1000).toFixed(1),
            },
          ],
        };

        payload.record_classroom.push(newStudentObject);
      });
      const url = `/api/samapta/students/update/${sessionId}`;
      setIsSubmitting(true);
      const response = await axios.put(url, payload);
      const data = await response.data;
      if (data.success) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data berhasil diperbarui",
        });
        setTimeout(() => {
          window.location.href = `/samapta/detail-sesi/${sessionId}`;
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
        const gender = null;
        const sessionData = await getSession(sessionId);
        const classId = sessionData.classroom_id;
        const data = await getStudentBySessionId(sessionId, gender, classId);
        const dataWithScores = sessionData?.record_classroom?.length
          ? data?.map((item) => {
              return {
                ...item,
                scores: {
                  run: item.exercise_a.r_score,
                  sit_up: item.exercise_b[0].r_score,
                  push_up: item.exercise_b[1].r_score,
                  shuttle: item.exercise_b[2].r_score * 1000,
                },
              };
            })
          : [];
        replace(dataWithScores);
        setValue("session_name", sessionData.title || "");
        setValue("session_date", sessionData.date || "");
        setData(data);
        setDataSession(sessionData);
      } catch (error) {
        console.log(error);
      } finally {
        setIsFetchingStudents(false);
      }
    })();
  }, []);

  const getSession = async (id) => {
    const response = await axios.get(`/api/samapta/students/session/${id}`);
    const data = response.data;
    return data ?? [];
  };

  return (
    <Fragment>
      <Modal isOpen={open} toggle={toggleModal} size="xl" centered>
        <ModalBody className="p-0">
          <Form onSubmit={handleSubmit(submitData)}>
            <div className={clsx("card", "p-2")}>
              <div className={clsx("container text-center")}>
                <div className={clsx(styles["heading-title"])}>
                  Edit Sesi Latihan
                </div>
              </div>
              <div className={clsx("container", styles["form-grid"])}>
                <Controller
                  name="session_name"
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup className="flex-fill">
                        <Label className={clsx("font-weight-bolder")}>
                          Label Sesi
                        </Label>
                        <Input
                          {...field}
                          invalid={error && true}
                          placeholder="Masukan Label Sesi"
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
                <Controller
                  name="session_date"
                  control={control}
                  render={({
                    field: { onChange, ref, value },
                    fieldState: { error },
                  }) => {
                    return (
                      <FormGroup>
                        <Label className={clsx("font-weight-bolder")}>
                          Tanggal Pelaksanaan Sesi
                        </Label>
                        <Flatpickr
                          className={clsx("form-control", {
                            "is-invalid": error,
                          })}
                          style={{ backgroundColor: "#fff" }}
                          data-enable-time
                          ref={ref}
                          value={value}
                          onChange={(date) => onChange(date[0].toISOString())}
                          placeholder="Pilih tanggal pelaksanaan sesi"
                        />
                        <FormFeedback>{error?.message}</FormFeedback>
                      </FormGroup>
                    );
                  }}
                />
              </div>
            </div>
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
              setValue={setValue}
              sessionData={dataSession}
              submitForm={trigger}
            />
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};
export default EditSessionScoreForm;
