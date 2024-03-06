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
  getCsrf,
  getClassroomId,
  getScheduleId,
  isObjEmpty,
  normalNumber,
} from "../../../utility/Utils";

const MySwal = withReactContent(Swal);

const getPresences = async () => {
  try {
    const scheduleId = getScheduleId();
    const url = `/api/learning/schedule/with-student/${scheduleId}`;
    const response = await axios.get(url);
    const data = await response.data;
    return data;
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
});

const fieldsSchema = yup.object().shape({
  presences: yup.array().of(formSchema),
});

const PresenceTable = () => {
  const [searchValue, setSearchValue] = useState("");
  const [schedule, setSchedule] = useState(null);
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
    const updatedStudents = schedule?.students ?? [];
    updatedStudents.map((student, index) => {
      append({
        name: student.name,
        presence: student.presence,
        comment: student.comment,
        smartbtw_id: student.smartbtw_id,
        parent_phone: student?.parent_phone,
        duration_percentages: student?.duration_percentages ?? 0,
        log_at: student?.log_at,
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
      const presenceId = schedule?.presence?._id ?? "";
      const url = `/api/learning/presence/${presenceId}`;
      const payload = {
        classroom_id: schedule?.classroom_id,
        class_schedule_id: schedule?._id,
        comment: "",
        logs: presenceWatch.map((student) => ({
          smartbtw_id: student.smartbtw_id,
          presence: student.presence,
          comment: student.comment,
          parent_phone: student?.parent_phone,
          name: student?.name,
          duration_percentages: +student?.duration_percentages ?? 0,
        })),
      };
      const response = await axios.post(url, payload, {
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
    return !!schedule?.presence;
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
    if (status == "NOT_ATTEND") {
      return <Badge color="light-danger">Tidak Hadir</Badge>;
    }
    return <Badge color="light-warning">Baru Bergabung</Badge>;
  };

  return (
    ["*", "read"].some((r) => userRole.includes(r)) && (
      <>
        <AvForm onSubmit={handleSubmit(savePresences)}>
          <Card>
            <CardHeader className="flex-column align-md-items-center align-items-start border-bottom">
              <CardTitle tag="h4">{schedule?.classroom?.title}</CardTitle>
              {schedule?.title ? (
                <div className="d-flex align-items-center justify-content-between">
                  <p className="font-weight-bold">
                    <small>Pelajaran :</small>
                  </p>
                  <p className="ml-25">
                    <small>{schedule.title}</small>
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
                      <td>{student.name}</td>
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
                              />
                              <AvRadio
                                customInput
                                label="Tidak Hadir"
                                value="NOT_ATTEND"
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
                                presenceWatch[index]?.comment
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
                            <p className="mb-0">-</p>
                          )
                        ) : (
                          <p className="mb-0">{student.comment ?? "-"}</p>
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

export default PresenceTable;
