import * as yup from "yup";
import { Button } from "reactstrap";
import { ArrowLeft } from "react-feather";
import { useForm } from "react-hook-form";
import { Fragment, useMemo, useRef, useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";

import "filepond/dist/filepond.min.css";
import "flatpickr/dist/themes/airbnb.css";
import "react-slidedown/lib/slidedown.css";

import ChooseStudent from "./ChooseStudent.js";
import CreateStudent from "./CreateStudent.js";
import { isObjEmpty } from "../../../../utility/Utils.js";
import DividerText from "../../../core/divider/DividerText.js";
import axios from "axios";
import clsx from "clsx";
import ChooseAndEditStudent from "./ChooseAndEditStudent.js";

const CREATE_NEW_STUDENT = "create-new-student";
const SELECT_STUDENT = "select-student";
const UPDATE_STUDENT_FOR_SCREENING = "update-student-for-screening";

const createStudentSchema = {
  name: yup.string().required(),
  email: yup.string().email().required(),
  phone_number: yup.string().required(),
  birth_date: yup.string().required(),
  gender: yup.string().required(),
  province: yup.object().required(),
  district: yup.object().required(),
  major: yup.object().required(),
  last_education: yup.object().required(),
  school_origin_province: yup.object().required(),
  school_origin_district: yup.object().required(),
  school_origin: yup.object().required(),
  parent_name: yup.string().required(),
  parent_phone_number: yup.string().required(),
  address: yup.string().required(),
};

const selectStudentSchema = {
  student: yup.object().required(),
};

const SelectStudent = ({
  stepper,
  selectedStudent,
  setSelectedStudent,
  selectedStudentDetail,
  setSelectedStudentDetail,
  isSiswaUnggulanProduct,
}) => {
  const [selectedMethod, setSelectedMethod] = useState();
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);
  const [studentSchema, setStudentSchema] = useState(createStudentSchema);
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const {
    trigger,
    register,
    control,
    watch,
    setError,
    clearErrors,
    setFocus,
    setValue,
    getValues,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm({
    resolver: useMemo(
      () => yupResolver(yup.object().shape(createStudentSchema)),
      [studentSchema]
    ),
  });
  const selectedProvince = watch("province");
  const selectedDistrict = watch("district");
  const emailCreatedForm = watch("email");
  const currentStudentFormValue = watch("student");
  const watchedFormValues = watch();

  const handleErrorCreateStudent = (error) => {
    const errObj = error.response.data.data?.errors;
    if (errObj) {
      const arrKeyErrors = Object.keys(errObj);
      arrKeyErrors.map((key, index) => {
        const name = key.split(".").pop();
        setError(name, {
          type: "manual",
          message: errObj[key],
        });
        if (index === 0) {
          setFocus(name);
        }
      });
    } else {
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message: "Sistem dalam perbaikan, harap mencoba beberapa saat lagi",
      });
    }
  };

  const getCreateStudentFormPayload = () => {
    const currentValues = getValues();
    const payload = {
      nama_lengkap: currentValues.name,
      email: currentValues.email,
      no_wa: currentValues.phone_number,
      jk: currentValues.gender,
      ttl: currentValues.birth_date,
      nama_ortu: currentValues.parent_name,
      hp_ortu: currentValues.parent_phone_number,
      alamat: currentValues.address,
      id_provinsi: currentValues.province.value,
      kab_kota_id: currentValues.district.value,
      asal_sekolah: currentValues.school_origin?.label,
      jurusan: currentValues.major?.label,
      pendidikan_terakhir: currentValues.last_education?.label,
      last_education_id: currentValues.major?.value,
      status: 1,
      tujuan_tryout: "-",
      school_origin_id: currentValues?.school_origin?.value,
      birth_mother_name: currentValues?.birth_mother_name,
      birth_place: currentValues?.birth_place,
      nik: currentValues?.nik,
      account_type: "btwedutech",
    };

    return payload;
  };

  const createStudent = async () => {
    trigger();
    if (!isObjEmpty(errors)) return;

    let url = "/api/sale/create-student";
    const payload = getCreateStudentFormPayload();

    if (selectedStudent?.id) {
      payload.student_id = selectedStudent?.id;
      url = "/api/sale/update-student";
    }

    try {
      setIsCreatingStudent(true);
      const response = await axios.post(`${url}`, {
        ...payload,
        cancelToken: source.token,
      });
      const data = await response.data;
      const createdStudent = data?.data;

      if (!isCanceled.current) {
        setIsCreatingStudent(false);
        setSelectedStudent({
          id: createdStudent.id,
          name: createdStudent.nama_lengkap,
          email: createdStudent.email,
          address: createdStudent.alamat,
          phone_number: createdStudent.no_wa,
          gender: createdStudent?.jk,
        });
        stepper.next();
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsCreatingStudent(false);
        handleErrorCreateStudent(error);
      }
    }
  };

  const updateStudent = async () => {
    trigger();
    if (!isObjEmpty(errors)) return;

    const url = "/api/sale/update-student";
    const payload = getCreateStudentFormPayload();

    if (currentStudentFormValue?.value)
      payload.student_id = currentStudentFormValue?.value;

    try {
      setIsUpdatingStudent(true);
      const response = await axios.post(`${url}`, {
        ...payload,
        cancelToken: source.token,
      });
      const data = await response.data;
      const updatedStudent = data?.data;

      if (!isCanceled.current) {
        setIsUpdatingStudent(false);
        setSelectedStudent({
          id: updatedStudent.id,
          name: updatedStudent.nama_lengkap,
          email: updatedStudent.email,
          address: updatedStudent.alamat,
          phone_number: updatedStudent.no_wa,
          gender: updatedStudent?.jk,
        });
        stepper.next();
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsUpdatingStudent(false);
        handleErrorCreateStudent(error);
      }
    }
  };

  const selectStudent = () => {
    trigger();
    if (!isObjEmpty(errors)) return;

    const { student } = getValues();
    setSelectedStudent({
      id: student.value,
      name: student.name,
      email: student.email,
      address: student.address,
      phone_number: student.phone_number,
    });
    stepper.next();
  };

  const selectMethodHandler = (method) => {
    if (
      method !== CREATE_NEW_STUDENT &&
      method !== SELECT_STUDENT &&
      method !== UPDATE_STUDENT_FOR_SCREENING
    )
      return;
    if (method === CREATE_NEW_STUDENT) {
      setStudentSchema(createStudentSchema);
    } else if (method === UPDATE_STUDENT_FOR_SCREENING) {
      setStudentSchema(createStudentSchema);
    } else {
      setStudentSchema(selectStudentSchema);
    }
    setSelectedMethod(method);
  };

  const resetSelectedMethod = () => {
    setSelectedMethod(null);
  };

  const handleToPreviousStep = () => {
    if (selectedMethod === CREATE_NEW_STUDENT && selectedStudent) {
      resetForm();
    }
    stepper.previous();
  };

  const renderContent = (selectedMethod) => {
    if (selectedMethod == CREATE_NEW_STUDENT) {
      return (
        <CreateStudent
          errors={errors}
          stepper={stepper}
          control={control}
          register={register}
          setValue={setValue}
          clearErrors={clearErrors}
          formValues={watchedFormValues}
          handleSubmit={handleSubmit}
          createStudent={createStudent}
          selectedStudent={selectedStudent}
          emailCreatedForm={emailCreatedForm}
          selectedDistrict={selectedDistrict}
          selectedProvince={selectedProvince}
          isCreatingStudent={isCreatingStudent}
          handleToPreviousStep={handleToPreviousStep}
        />
      );
    } else if (selectedMethod == UPDATE_STUDENT_FOR_SCREENING) {
      return (
        <ChooseAndEditStudent
          errors={errors}
          stepper={stepper}
          control={control}
          register={register}
          setValue={setValue}
          resetForm={resetForm}
          formValues={watchedFormValues}
          clearErrors={clearErrors}
          handleSubmit={handleSubmit}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          selectedDistrict={selectedDistrict}
          selectedProvince={selectedProvince}
          currentStudentFormValue={currentStudentFormValue}
          setSelectedStudentDetail={setSelectedStudentDetail}
          updateStudent={updateStudent}
          isUpdatingStudent={isUpdatingStudent}
          handleToPreviousStep={handleToPreviousStep}
        />
      );
    } else {
      return (
        <ChooseAndEditStudent
          errors={errors}
          stepper={stepper}
          control={control}
          register={register}
          setValue={setValue}
          resetForm={resetForm}
          formValues={watchedFormValues}
          handleSubmit={handleSubmit}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
          selectedDistrict={selectedDistrict}
          selectedProvince={selectedProvince}
          currentStudentFormValue={currentStudentFormValue}
          setSelectedStudentDetail={setSelectedStudentDetail}
          updateStudent={updateStudent}
          isUpdatingStudent={isUpdatingStudent}
          handleToPreviousStep={handleToPreviousStep}
        />
      );
    }
  };

  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0">Pilih Siswa</h5>
        <small>Pilih siswa yang bersangkutan</small>
      </div>

      {!selectedMethod ? (
        <>
          <Button
            block
            outline
            color="primary"
            onClick={() => selectMethodHandler(CREATE_NEW_STUDENT)}
          >
            Buat Siswa Baru
          </Button>
          <DividerText text="atau" className={clsx("text-center my-50")} />
          <Button
            block
            color="primary"
            onClick={() => selectMethodHandler(SELECT_STUDENT)}
          >
            Pilih Siswa
          </Button>

          <Button
            color="primary"
            className="btn-prev mt-3"
            onClick={handleToPreviousStep}
          >
            <ArrowLeft
              size={14}
              className="align-middle mr-sm-25 mr-0"
            ></ArrowLeft>
            <span className="align-middle d-sm-inline-block d-none">
              Sebelumnya
            </span>
          </Button>
        </>
      ) : (
        <>
          <div className="mt-2 mb-2">
            <Button
              className="btn-icon btn-sm rounded-circle"
              outline
              color="primary"
            >
              <ArrowLeft
                size={20}
                onClick={() => {
                  resetForm();
                  clearErrors();
                  setSelectedStudent(null);
                  resetSelectedMethod();
                }}
                className="text-primary"
              />
            </Button>
          </div>
          {renderContent(selectedMethod)}
        </>
      )}
    </Fragment>
  );
};

export default SelectStudent;
