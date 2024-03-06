import * as yup from "yup";
import { Button } from "reactstrap";
import { ArrowLeft } from "react-feather";
import { useForm } from "react-hook-form";
import { Fragment, useMemo, useRef, useState } from "react";
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

const CREATE_NEW_STUDENT = "create-new-student";
const SELECT_STUDENT = "select-student";

const createStudentSchema = {
  name: yup.string().required(),
  email: yup.string().email().required(),
  branch: yup.object().required(),
  phone_number: yup.string().required(),
  birth_date: yup.string().required(),
  gender: yup.string().required(),
  province: yup.object().required(),
  district: yup.object().required(),
  school: yup.string().required(),
  major: yup.string().required(),
  last_education: yup.string().required(),
  parent_name: yup.string().required(),
  parent_phone_number: yup.string().required(),
  address: yup.string(),
  purpose: yup.object().required(),
};

const selectStudentSchema = {
  student: yup.object().required(),
};

const SelectStudentForm = ({
  stepper,
  selectedStudent,
  setSelectedStudent,
}) => {
  const [selectedMethod, setSelectedMethod] = useState();
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [studentSchema, setStudentSchema] = useState(createStudentSchema);
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const {
    trigger,
    register,
    control,
    watch,
    setError,
    setFocus,
    setValue,
    getValues,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm({
    resolver: useMemo(
      () => yupResolver(yup.object().shape(studentSchema)),
      [studentSchema]
    ),
  });
  const selectedProvince = watch("province");
  const selectedDistrict = watch("district");
  const emailCreatedForm = watch("email");

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
      branch_code: currentValues.branch.code,
      kab_kota_id: currentValues.district.value,
      asal_sekolah: currentValues.school,
      jurusan: currentValues.major,
      pendidikan_terakhir: currentValues.last_education,
      tujuan_tryout: currentValues.purpose.value,
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
          branch_code: createdStudent.kode_cabang,
          gender: `${createdStudent.jk}`,
          phone_number: createdStudent.no_wa,
        });
        stepper.next();
        window.scrollTo(0, 0);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsCreatingStudent(false);
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
      branch_code: student?.branch_code,
      gender:
        typeof student?.gender != undefined ? `${student.gender}` : undefined,
      phone_number: student.phone_number,
    });
    stepper.next();
    window.scrollTo(0, 0);
  };

  const selectMethodHandler = (method) => {
    if (method !== CREATE_NEW_STUDENT && method !== SELECT_STUDENT) return;
    if (method === CREATE_NEW_STUDENT) {
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
    } else {
      return (
        <ChooseStudent
          stepper={stepper}
          control={control}
          handleSubmit={handleSubmit}
          selectStudent={selectStudent}
          selectedStudent={selectedStudent}
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
                onClick={resetSelectedMethod}
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

export default SelectStudentForm;
