import axios from "axios";
import * as yup from "yup";
import moment from "moment";
import Swal from "sweetalert2";
import Cleave from "cleave.js/react";
import classnames from "classnames";
import { Save } from "react-feather";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Row,
  Col,
  Button,
  Table,
  Badge,
  FormFeedback,
} from "reactstrap";
import {
  AvRadioGroup,
  AvRadio,
  AvForm,
} from "availity-reactstrap-validation-safe";
import { yupResolver } from "@hookform/resolvers/yup";
import withReactContent from "sweetalert2-react-content";
import { useForm, Controller, useFieldArray } from "react-hook-form";

import {
  getUserAllowedRoleFromBlade,
  getClassroomFromBlade,
  getScheduleFromBlade,
  getCsrf,
  getClassroomId,
  getScheduleId,
  isObjEmpty,
  normalNumber,
} from "../../../utility/Utils";

const MySwal = withReactContent(Swal);

const classroom = getClassroomFromBlade();
const scheduleFromBlade = getScheduleFromBlade();
const getPresences = async () => {
  try {
    const scheduleId = getScheduleId();
    const url = `/api/online-class/schedules/${scheduleId}/attendances`;
    const response = await axios.get(url);
    const data = await response.data;
    return data?.data ?? [];
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getOnlineSchedule = async () => {
  try {
    const scheduleId = getScheduleId();
    const url = `/api/online-class/schedules/${scheduleId}`;
    const response = await axios.get(url);
    const data = await response.data;
    return data?.data ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const redirectToSchedule = () => {
  window.location.href = `/pembelajaran/jadwal/${getClassroomId()}`;
};

const formSchema = yup.object().shape({
  presence: yup.string().required(),
  comment: yup.string().when(["presence"], {
    is: (presenceStatus) => presenceStatus === "NOT_ATTEND",
    then: yup.string().required("Wajib diisi"),
    otherwise: yup.string().notRequired().nullable(),
  }),
  duration_in_minutes: yup.number().when(["presence"], {
    is: (presenceStatus) => presenceStatus === "ATTEND",
    then: yup
      .number()
      .min(1, "Nilai minimal 1")
      .required("Wajib diisi")
      .typeError("Wajib diisi"),
    otherwise: yup.number().notRequired().nullable(),
  }),
  duration_percentages: yup.number().when(["presence"], {
    is: (presenceStatus) => presenceStatus === "ATTEND",
    then: yup
      .number()
      .min(60, "Persentase kehadiran minimal 60%")
      .max(100, "Persentase kehadiran maksimal 100%")
      .required("Wajib diisi")
      .typeError("Wajib diisi"),
    otherwise: yup.number().notRequired().nullable(),
  }),
});

const fieldsSchema = yup.object().shape({
  presences: yup.array().of(formSchema),
});

const OnlinePresenceTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [schedule, setSchedule] = useState(null);
  const [onlineSchedule, setOnlineSchedule] = useState(null);
  const [userRole] = useState(getUserAllowedRoleFromBlade());
  const [isLoading, setIsLoading] = useState(false);
  const [formAction, setFormAction] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    register,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { presences: [] },
    resolver: yupResolver(fieldsSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "presences",
  });

  const { presences: presenceWatch } = watch();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    setValue("presences", []);
    const mappedAttendees = schedule ?? [];
    mappedAttendees.map((data, index) => {
      append({
        name: data?.name,
        email: data?.email,
        presence: data?.presence,
        comment: data?.comment,
        smartbtw_id: data?.smartbtw_id,
        duration: data?.duration ?? 0,
        duration_in_minutes: data?.duration_in_minutes ?? 0,
        duration_percentages: data?.duration_percentages ?? 0,
        is_attend_available: data?.is_attend_available,
        updated_by: data?.updated_by ?? null,
        log_at: data?.updated_at,
        add_attendance:
          data?.is_attend_available && data?.presence ? false : true,
        index,
      });
    });
  }, [schedule]);

  const initialize = async () => {
    setIsLoading(true);
    await loadAll();
    setIsLoading(false);
  };

  const getFilteredData = (key) => {
    const lowerKey = String(key).toLocaleLowerCase();
    return fields.filter((student) =>
      student.name.toLowerCase().includes(lowerKey)
    );
  };

  const loadAll = async () => {
    setSchedule(await getPresences());
    setOnlineSchedule(await getOnlineSchedule());
  };

  const savePresences = async () => {
    trigger();
    if (!isObjEmpty(errors)) return;

    const state = await MySwal.fire({
      title: "Pastikan absensi yang diinput sudah benar!",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Proses",
      cancelButtonText: "Batalkan",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-outline-secondary ml-1",
      },
      buttonsStyling: false,
    });
    if (state.isDismissed) return;

    const saveTitle = "Simpan";
    try {
      setIsSubmitting(true);
      const url = `/api/online-class/schedules/${scheduleFromBlade?._id}/attendances`;
      const payload = {
        schedule_id: scheduleFromBlade?._id,
        attendances: presenceWatch.map((student) => ({
          smartbtw_id: student?.smartbtw_id,
          presence: student?.presence,
          comment: student?.comment,
          name: student?.name,
          email: student?.email,
          meeting_id: onlineSchedule?.zoom_meeting_id,
          duration: +student?.duration_in_minutes * 60 ?? 0, //convert to seconds
          duration_in_minutes: +student?.duration_in_minutes ?? 0,
          duration_percentages: +student?.duration_percentages ?? 0,
          updated_by: student?.updated_by ?? null,
          add_attendance: student?.add_attendance,
        })),
      };
      const response = await axios.put(url, payload, {
        headers: { "X-CSRF-TOKEN": getCsrf() },
      });
      const data = await response.data;
      await loadAll();
      toastr.success(`${saveTitle} absensi sukses`, saveTitle, {
        closeButton: true,
        tapToDismiss: false,
        timeOut: 3000,
      });
    } catch (error) {
      toastr.error(`${saveTitle} absensi gagal. Coba lagi nanti`, saveTitle, {
        closeButton: true,
        tapToDismiss: false,
        timeOut: 3000,
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPresenceExist = () => {
    return schedule?.some((value) => value.is_attend_available);
  };

  const isShowCreateView = () => {
    const isUserCanCreate = ["*", "create"].some((r) => userRole.includes(r));
    return isUserCanCreate && !isPresenceExist();
  };

  const isShowEditView = () => {
    const isUserCanEdit = ["*", "edit"].some((r) => userRole.includes(r));
    return isUserCanEdit && isPresenceExist();
  };

  const getAttendanceStatus = (status) => {
    if (status == "ATTEND") {
      return <Badge color="light-success">Hadir</Badge>;
    }
    if (status == "NOT_ATTEND" || status == "NOT-ATTEND") {
      return <Badge color="light-danger">Tidak Hadir</Badge>;
    }
    return <Badge color="light-warning">Baru Bergabung</Badge>;
  };

  const handleDurationInMinutesChange = (value, index) => {
    if (!value) {
      setValue(`presences.${index}.duration`, "");
      setValue(`presences.${index}.duration_in_minutes`, "");
      setValue(`presences.${index}.duration_percentages`, 0);
      return;
    }
    if (
      onlineSchedule?.duration
        ? value > onlineSchedule?.duration
        : value > 90
    ) {
      setValue(`presences.${index}.duration_in_minutes`, "");
      setValue(`presences.${index}.duration_percentages`, 0);
      return;
    }

    setValue(`presences.${index}.duration_in_minutes`, value);
    setValue(
      `presences.${index}.duration_percentages`,
      Math.round((value / onlineSchedule?.duration ?? 90) * 100)
    );
  };

  const handlePresenceIsChanged = (value, index) => {
    setValue(`presences.${index}.presence`, value);
    if (value === "ATTEND") {
      setValue(`presences.${index}.comment`, null);
      setValue(`presences.${index}.duration`, presenceWatch[index].duration);
      setValue(
        `presences.${index}.duration_in_minutes`,
        presenceWatch[index].duration_in_minutes
      );
      setValue(
        `presences.${index}.duration_percentages`,
        presenceWatch[index].duration_percentages
      );
    }
    if (value === "NOT_ATTEND") {
      setValue(`presences.${index}.duration`, null);
      setValue(`presences.${index}.duration_in_minutes`, null);
      setValue(`presences.${index}.duration_percentages`, null);
      setValue(`presences.${index}.comment`, presenceWatch[index].comment);
    }
  };

  return (
    ["*", "read"].some((r) => userRole.includes(r)) && (
      <>
        <AvForm onSubmit={handleSubmit(savePresences)}>
          <Card>
            <CardHeader className="flex-column align-md-items-center align-items-start border-bottom">
              <CardTitle tag="h4">{classroom?.title}</CardTitle>
              {scheduleFromBlade.title ? (
                <div className="d-flex align-items-center justify-content-between">
                  <p className="font-weight-bold">
                    <small>Pelajaran :</small>
                  </p>
                  <p className="ml-25">
                    <small>{scheduleFromBlade.title}</small>
                  </p>
                </div>
              ) : null}
            </CardHeader>
            <Row className="justify-content-end mx-0">
              <Col
                className="d-flex align-items-center justify-content-end mt-1"
                md="6"
                sm="12"
              >
                <Label className="mr-1" for="search-input">
                  Search
                </Label>
                <Input
                  className="dataTable-filter mb-50"
                  type="text"
                  bsSize="sm"
                  id="search-input"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </Col>
            </Row>

            <Table striped responsive>
              <thead className="thead-light">
                <tr>
                  <td>#</td>
                  <td>Nama</td>
                  <td>Status Kehadiran</td>
                  <td>Keterangan</td>
                  <td>Lama Durasi Siswa Dalam Meeting (Menit)</td>
                  <td>Persentase Kehadiran</td>
                  <td>Waktu Presensi</td>
                </tr>
              </thead>
              <tbody>
                {(searchValue.length
                  ? getFilteredData(searchValue)
                  : fields
                ).map((student) => {
                  const text = isPresenceExist()
                    ? getAttendanceStatus(student.presence)
                    : "Belum diisi";
                  const { index } = student;
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {student.name} ({student.email})
                      </td>
                      <td>
                        {isShowCreateView() || isShowEditView() ? (
                          <AvRadioGroup
                            required
                            name={`presences.${index}.presence`}
                            value="1"
                            {...register(`presences.${index}.presence`)}
                          >
                            <div className="d-flex">
                              <AvRadio
                                className="mb-1 mr-50"
                                customInput
                                label="Hadir"
                                value="ATTEND"
                                onClick={(event) =>
                                  handlePresenceIsChanged(
                                    event.target.value,
                                    index
                                  )
                                }
                              />
                              <AvRadio
                                customInput
                                label="Tidak Hadir"
                                value="NOT_ATTEND"
                                onClick={(event) =>
                                  handlePresenceIsChanged(
                                    event.target.value,
                                    index
                                  )
                                }
                              />
                            </div>
                          </AvRadioGroup>
                        ) : (
                          <div>{text}</div>
                        )}
                      </td>
                      <td>
                        {isShowCreateView() || isShowEditView() ? (
                          presenceWatch[index]?.presence == "NOT_ATTEND" ? (
                            <Controller
                              name={`presences.${index}.comment`}
                              control={control}
                              defaultValue={
                                presenceWatch[index]?.comment !== null
                                  ? presenceWatch[index]?.comment
                                  : ""
                              }
                              render={({ field, fieldState: { error } }) => {
                                const { ref, ...rest } = field;
                                return (
                                  <Input
                                    {...rest}
                                    placeholder="Contoh: Sakit, Izin, dll"
                                    innerRef={ref}
                                    invalid={error && true}
                                  />
                                );
                              }}
                            />
                          ) : (
                            <p className="mb-0">{student.comment ?? "-"}</p>
                          )
                        ) : (
                          <p className="mb-0">{student.comment ?? "-"}</p>
                        )}
                      </td>
                      <td>
                        {isShowCreateView() || isShowEditView() ? (
                          presenceWatch[index]?.presence == "ATTEND" ? (
                            <Controller
                              name={`presences.${index}.duration_in_minutes`}
                              control={control}
                              defaultValue={
                                presenceWatch[index]?.duration_in_minutes
                                  ? presenceWatch[index]?.duration_in_minutes
                                  : ""
                              }
                              render={({ field, fieldState: { error } }) => {
                                const { ref, ...rest } = field;
                                return (
                                  <>
                                    <Cleave
                                      {...field}
                                      options={normalNumber}
                                      className={classnames("form-control", {
                                        "is-invalid": error,
                                      })}
                                      onChange={(e) =>
                                        handleDurationInMinutesChange(
                                          e.target.rawValue,
                                          index
                                        )
                                      }
                                      value={field.value ?? 0}
                                    />
                                    <FormFeedback>
                                      {error?.message}
                                    </FormFeedback>
                                  </>
                                );
                              }}
                            />
                          ) : (
                            <p className="mb-0">
                              {student?.duration_in_minutes ?? "-"}
                            </p>
                          )
                        ) : (
                          <p className="mb-0">
                            {" "}
                            {student?.duration_in_minutes ?? "-"}
                          </p>
                        )}
                      </td>
                      <td>
                        {isShowCreateView() || isShowEditView() ? (
                          presenceWatch[index]?.presence == "ATTEND" ? (
                            <Controller
                              name={`presences.${index}.duration_percentages`}
                              control={control}
                              defaultValue={
                                presenceWatch[index]?.duration_percentages
                                  ? presenceWatch[index]?.duration_percentages
                                  : ""
                              }
                              render={({ field, fieldState: { error } }) => {
                                const { ref, ...rest } = field;
                                return (
                                  <>
                                    <Cleave
                                      {...field}
                                      options={normalNumber}
                                      disabled={true}
                                      className={classnames("form-control", {
                                        "is-invalid": error,
                                      })}
                                      onChange={(e) =>
                                        field.onChange(e.target.rawValue)
                                      }
                                      value={field.value ?? 0}
                                    />
                                    <FormFeedback>
                                      {error?.message}
                                    </FormFeedback>
                                  </>
                                );
                              }}
                            />
                          ) : (
                            <p className="mb-0">
                              {student?.duration_percentages ?? "-"}
                            </p>
                          )
                        ) : (
                          <p className="mb-0">
                            {student?.duration_percentages ?? "-"}
                          </p>
                        )}
                      </td>
                      <td>
                        {student?.log_at
                          ? moment(student.log_at).format("DD/MM/YYYY HH:mm:ss")
                          : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>

          {/* Button */}
          {(isShowCreateView() || isShowEditView()) && (
            <div className="d-flex justify-content-end mb-5">
              <Button
                disabled={isLoading || isSubmitting}
                color="success"
                type="submit"
              >
                <Save size={14} /> {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          )}
        </AvForm>
      </>
    )
  );
};

export default OnlinePresenceTable;
