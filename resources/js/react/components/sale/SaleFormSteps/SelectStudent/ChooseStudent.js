import React from "react";
import classnames from "classnames";
import debounce from "lodash.debounce";
import { Controller } from "react-hook-form";
import AsyncSelect from "react-select/async";
import { ArrowLeft, ArrowRight } from "react-feather";
import { Button, Col, FormGroup, Label, Row } from "reactstrap";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import EditStudent from "./ChooseAndEditStudent";

const ChooseStudent = ({
  errors,
  stepper,
  control,
  register,
  setValue,
  handleSubmit,
  selectStudent,
  selectedStudent,
  selectedProduct,
  selectedDistrict,
  selectedProvince,
  currentStudentFormValue,
  updateStudent,
  isUpdatingStudent,
  handleToPreviousStep,
}) => {
  const isSiswaUnggulanProduct =
    !selectedProduct?.tags?.includes("SISWA_UNGGULAN");
  const promiseOptions = debounce((searchTerm, callback) => {
    if (searchTerm.length < 5) {
      return callback([], null);
    }
    axios
      .get(`/api/sale/find-student?email=${searchTerm}`)
      .then((result) => {
        const students = result.data.data;
        const studentOptions = students.map((student) => ({
          label: `${student.name} (${student.email}) (${student.account_type})`,
          email: student.email,
          name: student.name,
          value: student.smartbtw_id,
          address: student.address ?? "",
          phone_number: student.whatsapp_no,
        }));
        return callback(studentOptions);
      })
      .catch((error) => {
        return callback([], null);
      });
  }, 500);

  return (
    <AvForm
      className={classnames("mt-50")}
      onSubmit={handleSubmit(selectStudent)}
    >
      <Row className="justify-content-between align-items-end">
        <Col md={12}>
          <FormGroup>
            <Label for="student">Pilih Siswa</Label>
            <Controller
              isClearable
              id="student"
              name="student"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => (
                <AsyncSelect
                  {...field}
                  loadOptions={promiseOptions}
                  placeholder="Ketikkan email siswa"
                  className={classnames("react-select", {
                    "is-invalid": error,
                  })}
                  classNamePrefix="select"
                />
              )}
            />
            <p className="text-warning">
              <small>Harap Menginputkan Minimal 5 Karakter</small>
            </p>
          </FormGroup>

          {currentStudentFormValue && isSiswaUnggulanProduct ? (
            <EditStudent
              errors={errors}
              stepper={stepper}
              control={control}
              register={register}
              setValue={setValue}
              handleSubmit={handleSubmit}
              selectedStudent={selectedStudent}
              selectedDistrict={selectedDistrict}
              selectedProvince={selectedProvince}
              updateStudent={updateStudent}
              isUpdatingStudent={isUpdatingStudent}
              handleToPreviousStep={handleToPreviousStep}
            />
          ) : null}

          <div className="d-flex justify-content-between mt-3">
            <Button
              color="primary"
              className="btn-prev"
              onClick={() => stepper.previous()}
            >
              <ArrowLeft
                size={14}
                className="align-middle mr-sm-25 mr-0"
              ></ArrowLeft>
              <span className="align-middle d-sm-inline-block d-none">
                Sebelumnya
              </span>
            </Button>
            <Button type="submit" color="primary" className="btn-next">
              <span className="align-middle d-sm-inline-block d-none">
                Pilih & Lanjutkan
              </span>

              <ArrowRight
                size={14}
                className="align-middle ml-sm-25 ml-0"
              ></ArrowRight>
            </Button>
          </div>
        </Col>
      </Row>
    </AvForm>
  );
};

export default ChooseStudent;
