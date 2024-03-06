import React from "react";
import classnames from "classnames";
import debounce from "lodash.debounce";
import { ArrowRight } from "react-feather";
import { Controller } from "react-hook-form";
import AsyncSelect from "react-select/async";
import { Button, Col, FormGroup, Label, Row } from "reactstrap";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";

const ChooseStudent = ({ stepper, control, handleSubmit, selectStudent }) => {
  const promiseOptions = debounce((searchTerm, callback) => {
    if (searchTerm.length < 5) {
      return callback([], null);
    }
    axios
      .get(`/api/students/search?value=${searchTerm}`)
      .then((result) => {
        const students = result.data;
        const studentOptions = students.map((student) => ({
          label: `${student.name} (${student.email}) (${student.account_type})`,
          email: student.email,
          name: student.name,
          value: student.smartbtw_id,
          gender: student.jk,
          branch_code: student.branch_code,
          alamat: student.address ?? "",
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

          <div className="d-flex justify-content-end mt-3">
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
