import axios from "axios";
import classnames from "classnames";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "react-feather";
import { Fragment, useEffect } from "react";
import { Controller } from "react-hook-form";
import { Row, Col, Label, Input, Button, FormGroup } from "reactstrap";

import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import AvRadio from "availity-reactstrap-validation-safe/lib/AvRadio";
import AvRadioGroup from "availity-reactstrap-validation-safe/lib/AvRadioGroup";

import { isObjEmpty } from "../../../utility/Utils";

const BiodataForm = ({ formType, stepper, selectedStudent, useFormProps }) => {
  const {
    watch,
    control,
    trigger,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useFormProps;

  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const { branch, gender } = watch();

  const onSubmit = () => {
    trigger();
    if (isObjEmpty(errors)) {
      stepper.next();
      window.scrollTo(0,0)
    }
  };

  useEffect(() => {
    if (branch?.code) {
      setValue("classes", "");
      fetchClassesByBranchCode(branch?.code);
    }
  }, [branch?.code]);

  useEffect(() => {
    if (selectedStudent?.id) {
      setValue("id", selectedStudent.id);
      setValue("name", selectedStudent.name);
      setValue("email", selectedStudent.email);
      setValue("branch_code", selectedStudent.branch_code ?? "-");
      if (typeof selectedStudent?.gender !== undefined) {
        setValue("gender", selectedStudent.gender);
      }
    }
  }, [
    selectedStudent?.id,
    selectedStudent?.name,
    selectedStudent?.email,
    selectedStudent?.gender,
    selectedStudent?.branch_code,
  ]);

  useEffect(() => {
    return () => {
      isCanceled.current = true;
      source.cancel();
    };
  }, []);

  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0">Biodata</h5>
        <small className="text-muted">Inputkan biodata siswa</small>
      </div>
      <AvForm onSubmit={handleSubmit(onSubmit)} className={classnames("")}>
        <Row>
          <Col md={12}>
            <Controller
              name="name"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label className="form-label" for="name">
                      Nama
                    </Label>
                    <Input
                      {...rest}
                      readOnly
                      id="name"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="email"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label className="form-label" for="email">
                      Email
                    </Label>
                    <Input
                      {...rest}
                      readOnly
                      id="email"
                      type="email"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />

            <AvRadioGroup
              name="gender"
              {...register("gender")}
              className="mt-1"
              value={gender}
              required
            >
              <Label className="form-label">Jenis Kelamin</Label>
              <div className="d-flex mt-1">
                <AvRadio
                  id="radio-bio-gender-0"
                  className="mb-1 mr-1"
                  customInput
                  label="Laki-laki"
                  value="1"
                />

                <AvRadio
                  id="radio-bio-gender-1"
                  customInput
                  label="Perempuan"
                  value="0"
                />
              </div>
            </AvRadioGroup>

            <Controller
              name="height"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label className="form-label" for="height">
                      Tinggi Badan
                    </Label>
                    <Input
                      {...rest}
                      id="height"
                      type="number"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="weight"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label className="form-label" for="weight">
                      Berat Badan
                    </Label>
                    <Input
                      {...rest}
                      id="weight"
                      type="number"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="age"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label className="form-label" for="age">
                      Umur
                    </Label>
                    <Input
                      {...rest}
                      id="age"
                      type="number"
                      innerRef={ref}
                      invalid={error && true}
                    />
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="branch_code"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <Input
                    {...rest}
                    readOnly
                    type="hidden"
                    innerRef={ref}
                    invalid={error && true}
                  />
                );
              }}
            />
          </Col>
        </Row>

        <div
          className={classnames(
            "d-flex mt-2",
            formType == "create"
              ? "justify-content-between"
              : "justify-content-end"
          )}
        >
          {formType == "create" ? (
            <Button
              color="secondary"
              className="btn-prev"
              outline
              onClick={() => stepper.previous()}
            >
              <ArrowLeft size={14} className="align-middle mr-sm-25 mr-0" />
              <span className="align-middle d-sm-inline-block d-none">
                Sebelumnya
              </span>
            </Button>
          ) : null}
          <Button type="submit" color="primary" className="btn-next">
            <span className="align-middle d-sm-inline-block d-none">
              Lanjutkan
            </span>
            <ArrowRight
              size={14}
              className="align-middle ml-sm-25 ml-0"
            ></ArrowRight>
          </Button>
        </div>
      </AvForm>
    </Fragment>
  );
};

export default BiodataForm;
