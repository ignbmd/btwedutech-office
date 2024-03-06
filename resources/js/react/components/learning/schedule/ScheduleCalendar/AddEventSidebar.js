import { Fragment, useContext, useState, useEffect } from "react";
import classnames from "classnames";
import Flatpickr from "react-flatpickr";
import { X } from "react-feather";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Input,
  Form,
  FormFeedback,
  CustomInput,
} from "reactstrap";
import moment from "moment-timezone";
import MultipleInputSelect from "../../../core/multiple-input-select/MultipleInputSelect";

import { isObjEmpty } from "../../../../utility/Utils";
import { CalendarContext } from "../../../../context/CalendarContext";

import "flatpickr/dist/themes/airbnb.css";
import { getUserAllowedRoleFromBlade } from "../../../../utility/Utils";

const getClassroomId = () => {
  const url = window.location.href;
  const splitted = url.split("/");
  return splitted[splitted.length - 1];
};

const getCsrf = () => {
  const csrf = document.querySelector('meta[name="csrf-token"]').content;
  return csrf;
};

const fetchPrograms = async () => {
  try {
    const response = await axios.get("/api/internal/programs");
    const data = await response.data;
    return data ?? [];
  } catch (error) {
    return [];
  }
};

const fetchMaterials = async () => {
  try {
    const response = await axios.get("/api/study-material/material");
    const data = await response.data;
    return data ?? [];
  } catch (error) {
    return [];
  }
};

const fetchTopics = async () => {
  const data = ["TKA", "SKD", "TPA"];
  return data;
};

const fetchTeachers = async () => {
  try {
    const response = await axios.get("/api/learning/teacher");
    const data = await response.data;
    return data?.data;
  } catch (error) {
    return [];
  }
};

const fetchAddSchedule = async (payload) => {
  try {
    const response = await axios.post("/api/learning/schedule", payload, {
      headers: { "X-CSRF-TOKEN": getCsrf() },
    });
    const data = await response.data;
    return data;
  } catch (error) {
    console.error(error);
  }
};

const fetchUpdateSchedule = async (id, payload) => {
  try {
    const response = await axios.post(
      `/api/learning/schedule/update/${id}`,
      payload,
      { headers: { "X-CSRF-TOKEN": getCsrf() } }
    );
    const data = await response.data;
    return data;
  } catch (error) {
    console.error(error);
  }
};

const fetchDeleteSchedule = async (id) => {
  try {
    const isConfirmed = confirm("Delete schedule?");
    if (!isConfirmed) return;
    const response = await axios.delete(`/api/learning/schedule/${id}`);
    const data = await response.data;

    return data;
  } catch (error) {
    console.error(error);
  }
};

const getEmptyForm = () => {
  return {
    title: "",
    start_date: "",
    end_date: "",
    teacher_id: "",
    topics: [],
    classroom_id: getClassroomId(),
    material_id: "",
    is_pre_test: false,
    is_post_test: false,
    program: "",
  };
};

const formSchema = yup.object().shape({
  title: yup.string().required("Judul harus diisi"),
  start_date: yup.string().required("Waktu mulai harus diisi"),
  end_date: yup.string().required("Waktu selesai harus diisi"),
  teacher_id: yup.string().required("Pengajar harus dipilih"),
  material_id: yup.string().required("Materi harus dipilih"),
  program: yup.string().required("Materi harus dipilih"),
});

const AddEventSidebar = (props) => {
  // ** Props
  const { calendarStore, calendarsColor } = props;

  // ** Vars
  const selectedSchedule = calendarStore.selectedEvent;
  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: getEmptyForm(),
    resolver: yupResolver(formSchema),
  });
  const [userRole] = useState(getUserAllowedRoleFromBlade());

  const defaultTopics = watch('default_topics');

  // Options
  const [teachers, setTeachers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [topics, setTopics] = useState([]);

  const {
    handleAddEventSidebar: toggleSidebar,
    fetchEvents,
    selectEvent,
    addSidebarOpen: open,
  } = useContext(CalendarContext);

  useEffect(() => {
    if (!open) return;
    initialize();
  }, [open]);

  const initialize = async () => {
    if (!teachers.length) setTeachers(await fetchTeachers());
    if (!materials.length) setMaterials(await fetchMaterials());
    if (!programs.length) setPrograms(await fetchPrograms());
    if (!topics.length) setTopics(await fetchTopics());
  };

  const handleResetInputValues = () => {
    selectEvent({});
    reset(getEmptyForm());
  };

  const handleSetAddValues = () => {
    setValue("start_date", new Date(selectedSchedule?.start).toISOString());
    setValue("end_date", new Date(selectedSchedule?.start).toISOString());
  };

  const handleSetEditValues = () => {
    const extendedProps = selectedSchedule?.extendedProps;
    setValue("title", selectedSchedule?.title);
    setValue(
      "start_date",
      moment(extendedProps?.start_date)
        .utcOffset("+0700")
        .format("YYYY-MM-DD HH:mm:ss")
    );
    setValue(
      "end_date",
      moment(extendedProps?.end_date)
        .utcOffset("+0700")
        .format("YYYY-MM-DD HH:mm:sss")
    );
    setValue("teacher_id", extendedProps?.teacher_id);
    setValue("material_id", extendedProps?.material_id);
    setValue("program", extendedProps?.program);
    setValue("is_pre_test", extendedProps?.is_pre_test);
    setValue("is_post_test", extendedProps?.is_post_test);
    setValue("topics", extendedProps?.topics);
    setValue("default_topics", extendedProps?.topics);
    setValue("input_topics", extendedProps?.topics);
  };

  // ** Set sidebar fields
  const handleSelectedSchedule = () => {
    const isEmpty = isObjEmpty(selectedSchedule);

    // Add from button
    if (isEmpty) {
      return;
    }

    // Add from calendar
    if (!isEmpty && !selectedSchedule?.title) {
      handleSetAddValues();
      return;
    }

    // Edit from calendar
    if (!isEmpty && selectedSchedule?.title) {
      handleSetEditValues();
      return;
    }
  };

  const isSelectedEmpty = () => {
    return (
      isObjEmpty(selectedSchedule) ||
      (!isObjEmpty(selectedSchedule) && !selectedSchedule.title.length)
    );
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      start_date: moment(data.start_date).tz("Asia/Jakarta", true),
      end_date: moment(data.end_date).tz("Asia/Jakarta", true),
    };
    if (isSelectedEmpty()) {
      fetchAddSchedule(payload);
    } else {
      fetchUpdateSchedule(selectedSchedule.id, payload);
    }
    fetchEvents();
    toggleSidebar();
  };

  // ** Event Action buttons
  const EventActions = () => {
    if (isSelectedEmpty()) {
      return (
        <Fragment>
          {["*", "create"].some((r) => userRole.includes(r)) && (
            <Button className="mr-1" type="submit" color="primary">
              Tambah
            </Button>
          )}
          <Button
            color="secondary"
            type="reset"
            onClick={toggleSidebar}
            outline
          >
            Batal
          </Button>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          {["*", "edit"].some((r) => userRole.includes(r)) && (
            <Button className="mr-1" type="submit" color="primary">
              Perbarui
            </Button>
          )}
          {["*", "delete"].some((r) => userRole.includes(r)) && (
            <Button
              color="danger"
              onClick={async () => {
                await fetchDeleteSchedule(selectedSchedule.id);
                fetchEvents();
                toggleSidebar();
              }}
              outline
            >
              Hapus
            </Button>
          )}
        </Fragment>
      );
    }
  };

  // ** Close BTN
  const CloseBtn = (
    <X className="cursor-pointer" size={15} onClick={toggleSidebar} />
  );

  return (
    <Modal
      isOpen={open}
      toggle={toggleSidebar}
      className="sidebar-lg"
      contentClassName="p-0"
      onOpened={handleSelectedSchedule}
      onClosed={handleResetInputValues}
      modalClassName="modal-slide-in event-sidebar"
    >
      <ModalHeader
        className="mb-1"
        toggle={toggleSidebar}
        close={CloseBtn}
        tag="div"
      >
        <h5 className="modal-title">
          {selectedSchedule &&
          selectedSchedule.title &&
          selectedSchedule.title.length
            ? "Ubah"
            : "Tambah"}{" "}
          Jadwal
        </h5>
      </ModalHeader>
      <ModalBody className="flex-grow-1 pb-sm-0 pb-3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState: { error } }) => (
              <FormGroup>
                <Label for="title">
                  Judul <span className="text-danger">*</span>
                </Label>
                <Input
                  {...field}
                  placeholder="Title"
                  invalid={Boolean(error)}
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            )}
          />

          <Controller
            control={control}
            name="teacher_id"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FormGroup>
                <Label for="label">Pengajar</Label>
                <Select
                  options={teachers}
                  getOptionValue={(option) => option.sso_id}
                  getOptionLabel={(option) => option.name}
                  value={teachers.find(
                    (option) => String(option.sso_id) === String(value)
                  )}
                  classNamePrefix="select"
                  isClearable={false}
                  onChange={(data) => onChange(data.sso_id)}
                  className={classnames("react-select", {
                    "is-invalid": error,
                  })}
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            )}
          />

          <Controller
            control={control}
            name="start_date"
            render={({
              field: { onChange, ref, value },
              fieldState: { error },
            }) => (
              <FormGroup>
                <Label>Waktu Mulai</Label>
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
            name="end_date"
            render={({
              field: { onChange, ref, value },
              fieldState: { error },
            }) => (
              <FormGroup>
                <Label>Waktu Selesai</Label>
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
            name="material_id"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FormGroup>
                <Label>Pilih Materi</Label>
                <Select
                  value={materials.find(
                    (option) => String(option._id) === String(value)
                  )}
                  classNamePrefix="select"
                  options={materials}
                  isClearable={false}
                  getOptionValue={(option) => option._id}
                  getOptionLabel={(option) => option.title}
                  onChange={(val) => onChange(val._id)}
                  className={classnames("react-select", {
                    "is-invalid": error,
                  })}
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            )}
          />

          <Controller
            control={control}
            name="program"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FormGroup>
                <Label>Pilih Program</Label>
                <Select
                  value={programs.find(
                    (option) => String(option.id) === String(value)
                  )}
                  classNamePrefix="select"
                  options={programs}
                  isClearable={false}
                  getOptionValue={(option) => option.id}
                  getOptionLabel={(option) => option.text}
                  onChange={(val) => onChange(val.id)}
                  className={classnames("react-select", {
                    "is-invalid": error,
                  })}
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            )}
          />

          <Controller
            control={control}
            name="is_pre_test"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                style={{ zIndex: "unset !important" }}
                value={value}
                onChange={(e) => onChange(e.target.checked)}
                inline
                type="checkbox"
                label="Pre Test"
                id="is_pre_test"
              />
            )}
          />

          <br />

          <Controller
            control={control}
            name="is_post_test"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                style={{ zIndex: "unset !important" }}
                value={value}
                onChange={(e) => onChange(e.target.checked)}
                inline
                type="checkbox"
                label="Post Test"
                className="mt-1"
                id="is_post_test"
              />
            )}
          />

          <Controller
            control={control}
            name="input_topics"
            render={({ field, fieldState: { error } }) => (
              <FormGroup className="mt-1">
                <Label>Topik</Label>
                <MultipleInputSelect
                  setValue={setValue}
                  fieldName={field.name}
                  valueName={`topics`}
                  currentValue={field.value}
                  defaultValue={defaultTopics}
                  changeHandler={field.onChange}
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            )}
          />

          <FormGroup className="d-flex mt-3">
            <EventActions />
          </FormGroup>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default AddEventSidebar;
