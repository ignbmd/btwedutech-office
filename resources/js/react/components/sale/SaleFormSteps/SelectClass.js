import axios from "axios";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import { Fragment, useEffect, useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { AlertCircle, ArrowLeft, ArrowRight } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { Label, FormGroup, Row, Col, Button, Alert } from "reactstrap";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";

import "flatpickr/dist/themes/airbnb.css";
import "react-slidedown/lib/slidedown.css";
import "filepond/dist/filepond.min.css";

import { isObjEmpty, getUserFromBlade } from "../../../utility/Utils.js";

const classSchema = {
  user_class: yup.object().required(),
};
const user = getUserFromBlade();
const isCentralUser =
  user?.branch_code === "PT0000" || user?.branch_code === null;

const SelectClass = ({ stepper, setSelectedClass }) => {
  const [isFetchingClasses, setIsFetchingClasses] = useState(true);
  const [classes, setClasses] = useState([]);
  const {
    trigger,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(yup.object().shape(classSchema)),
  });
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();

  const getClasses = async () => {
    try {
      const response = await axios.get(`/api/sale/classroom`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const classesData = data?.data ?? [];
      if (!isCanceled.current) {
        setIsFetchingClasses(false);
        setClasses(
          classesData.map((classItem) => ({
            label: isCentralUser
              ? `${classItem.title} (${classItem.branch_code})`
              : `${classItem.title}`,
            // label: classItem.title,
            value: classItem._id,
          }))
        );
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetchingClasses(false);
      }
    }
  };

  useEffect(() => {
    getClasses();

    return () => {
      isCanceled.current = true;
      source.cancel();
    };
  }, []);

  const selectClass = () => {
    trigger();
    if (!isObjEmpty(errors)) return;

    const { user_class } = getValues();
    setSelectedClass({
      id: user_class.value,
      name: user_class.label,
    });
    stepper.next();
  };

  const handleSkipStep = () => {
    setSelectedClass(null);
    setValue("user_class", "");
    stepper.next();
  };

  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0">Pilih Kelas</h5>
        <small>Pilih kelas tatap muka siswa</small>
      </div>
      <AvForm
        className={classnames("mt-50")}
        onSubmit={handleSubmit(selectClass)}
      >
        <Row className="justify-content-between align-items-end">
          <Col md={12}>
            <Controller
              isClearable
              id="user_class"
              name="user_class"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormGroup>
                  <Label for="user_class">Pilih Kelas</Label>
                  <Select
                    styles={{
                      menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    }}
                    {...field}
                    options={classes}
                    isLoading={isFetchingClasses}
                    classNamePrefix="select"
                    className={classnames("react-select", {
                      "is-invalid": error && true,
                    })}
                  />
                </FormGroup>
              )}
            />
            {!isCentralUser ? (
              <Alert color="warning" isOpen>
                <div className="alert-body">
                  <AlertCircle size={15} />{" "}
                  <span className="ml-1">
                    Proses pilih kelas bisa dilewati apabila siswa sudah
                    terdaftar pada kelas
                  </span>
                </div>
              </Alert>
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
              <div>
                {!isCentralUser ? (
                  <Button
                    outline
                    type="button"
                    color="primary"
                    className="btn-next mr-1"
                    onClick={handleSkipStep}
                  >
                    <span className="align-middle d-sm-inline-block">
                      Lewati
                    </span>
                  </Button>
                ) : null}
                <Button
                  type="submit"
                  color="primary"
                  className="btn-next"
                  // disabled={isCreatingStudent}
                >
                  <span className="align-middle d-sm-inline-block d-none">
                    {/* {isCreatingStudent ? "Please wait..." : "Select & Next"} */}
                    Pilih & Lanjutkan
                  </span>

                  <ArrowRight
                    size={14}
                    className="align-middle ml-sm-25 ml-0"
                  ></ArrowRight>
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </AvForm>
    </Fragment>
  );
};

export default SelectClass;
