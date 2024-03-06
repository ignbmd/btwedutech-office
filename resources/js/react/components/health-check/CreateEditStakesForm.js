import Axios from "axios";
import * as yup from "yup";
import PropTypes from "prop-types";
import Select from "react-select";
import classnames from "classnames";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import {
  Row,
  Col,
  Form,
  Label,
  Input,
  Button,
  FormGroup,
  Card,
  CardBody,
} from "reactstrap";

import axios from "../../utility/http";
import { areas, stakes } from "../../config/mcu";
import { getLastSegment, isObjEmpty } from "../../utility/Utils";
import { Save } from "react-feather";
import SpinnerCenter from "../core/spinners/Spinner";

const BiodataSchema = yup.object().shape({
  area: yup.object().required(),
  name: yup.string().required(),
  stakes: yup.object().required(),
});

const CreateEditStakesForm = ({ type }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(type === "edit");
  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(BiodataSchema),
  });
  const isCanceled = useRef(false);
  const source = Axios.CancelToken.source();

  const getPayload = () => {
    const form = getValues();
    const payload = {
      area: form.area.value,
      name: form.name,
      value: form.stakes.value,
    };
    return payload;
  };

  const redirectToIndex = () => {
    window.location.href = "/kesehatan/stakes";
  };

  const processForm = async () => {
    setIsSubmitting(true);
    const payload = getPayload();
    try {
      if(type == 'edit') {
        const pointId = getLastSegment()
        await axios.put(`/medical-checkup/point/update/${pointId}`, payload);
      } else {
        await axios.post("/medical-checkup/point/create", payload);
      }
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const onSubmit = () => {
    trigger();
    if (isObjEmpty(errors)) {
      processForm();
    }
  };

  const getCurrentStakesPoint = async () => {
    try {
      const id = getLastSegment();
      const response = await axios.get(`/medical-checkup/point/detail/${id}`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const stakesPoint = data?.data ?? [];
      return stakesPoint;
    } catch (error) {
      return null;
    }
  };

  const loadEdit = async () => {
    const data = await getCurrentStakesPoint();
    setValue(
      "area",
      areas.find((area) => area.value == data.area)
    );
    setValue("name", data.name);
    setValue(
      "stakes",
      stakes.find((item) => item.value == data.value)
    );
    setIsLoading(false);
  };

  useEffect(() => {
    if (type === "edit") {
      loadEdit();
    }
  }, []);

  return (
    <Card className={classnames(isSubmitting && "block-content")}>
      <CardBody>
        {isLoading ? (
          <SpinnerCenter />
        ) : (
          <Form onSubmit={handleSubmit(onSubmit)} className={classnames("")}>
            <Row>
              <Col md={6}>
                <Controller
                  name="area"
                  defaultValue=""
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup>
                        <Label className="form-label" for="area">
                          Area
                        </Label>
                        <Select
                          {...field}
                          styles={{
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                          }}
                          isSearchable={true}
                          options={areas}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": error && true,
                          })}
                        />
                      </FormGroup>
                    );
                  }}
                />

                <Controller
                  name="name"
                  defaultValue=""
                  control={control}
                  render={({ field, fieldState: { error } }) => {
                    const { ref, ...rest } = field;
                    return (
                      <FormGroup>
                        <Label className="form-label" for="name">
                          Poin Pemeriksaan
                        </Label>
                        <Input
                          {...rest}
                          id="name"
                          type="name"
                          innerRef={ref}
                          placeholder="Contoh: Varises ringan dan sedang tanpa keluhan"
                          invalid={error && true}
                        />
                      </FormGroup>
                    );
                  }}
                />

                <Controller
                  name="stakes"
                  control={control}
                  defaultValue={[]}
                  render={({ field, fieldState: { error } }) => {
                    return (
                      <FormGroup>
                        <Label className="form-label">Stakes</Label>
                        <Select
                          {...field}
                          styles={{
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                          }}
                          isSearchable={false}
                          options={stakes}
                          classNamePrefix="select"
                          className={classnames("react-select", {
                            "is-invalid": error && true,
                          })}
                        />
                      </FormGroup>
                    );
                  }}
                />

                <div className="d-flex justify-content-end mt-2">
                  <Button type="submit" color="gradient-success">
                    {isSubmitting ? (
                      "Sedang Menyimpan..."
                    ) : (
                      <>
                        <Save size={14} /> Simpan
                      </>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

CreateEditStakesForm.propTypes = {
  type: PropTypes.oneOf(["create", "edit"]),
};

export default CreateEditStakesForm;
