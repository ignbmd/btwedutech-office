import Axios from "axios";
import * as yup from "yup";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Save } from "react-feather";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { getLastSegment, isObjEmpty } from "../../../utility/Utils";
import axios from "../../../utility/http";
import SpinnerCenter from "../../core/spinners/Spinner";

const FormSchema = yup.object().shape({
  name: yup.string().required("Wajib diisi"),
});

const CreateEditTryoutCodeForm = ({ type }) => {
  const [isLoading, setIsLoading] = useState(type === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
  });
  const isCanceled = useRef(false);
  const source = Axios.CancelToken.source();

  const loadEdit = async () => {
    const data = await getCurrentTryoutCodeCategory();
    setValue("name", data.name);
    setIsLoading(false);
  };

  const getCurrentTryoutCodeCategory = async () => {
    try {
      const id = getLastSegment();
      const response = await axios.get(
        `/exam/tryout-code-category/detail/${id}`,
        {
          cancelToken: source.token,
        }
      );
      const data = await response.data;
      const tryoutCodeCategory = data?.data ?? [];
      return tryoutCodeCategory;
    } catch (error) {
      return null;
    }
  };

  const getPayload = () => {
    const form = getValues();

    const payload = {
      name: form.name,
    };

    return payload;
  };

  const redirectToIndex = () => {
    window.location.href = "/ujian/kategori-tryout-kode";
  };

  const processFormCreate = async () => {
    setIsSubmitting(true);
    const payload = getPayload();
    try {
      const response = await axios.post(
        "/exam/tryout-code-category/create",
        payload
      );
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const processFormUpdate = async () => {
    setIsSubmitting(true);
    const payload = getPayload();
    payload.id = parseInt(getLastSegment());
    try {
      const response = await axios.put(
        "/exam/tryout-code-category/update",
        payload
      );
      if (!isCanceled.current) {
        redirectToIndex();
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const submitHandler = () => {
    trigger();
    if (isObjEmpty(errors)) {
      if (type === "edit") {
        processFormUpdate();
      } else {
        processFormCreate();
      }
    }
  };

  useEffect(() => {
    if (type === "edit") {
      loadEdit();
    }
  }, []);

  return (
    <Card>
      <CardBody className={classnames(isSubmitting && "block-content")}>
        {isLoading ? (
          <SpinnerCenter />
        ) : (
          <Form onSubmit={handleSubmit(submitHandler)}>
            <Col md={6} className={classnames("mt-2 pl-0")}>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup className="flex-fill">
                      <Label className="form-label">
                        Nama Kategori Tryout Kode
                      </Label>
                      <Input
                        {...rest}
                        id="name"
                        innerRef={ref}
                        invalid={error && true}
                        placeholder="Inputkan Nama Kategori Tryout Kode"
                      />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />

              <div className="text-right mt-4">
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
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

CreateEditTryoutCodeForm.propTypes = {
  type: PropTypes.oneOf(["create", "edit"]),
};

export default CreateEditTryoutCodeForm;
