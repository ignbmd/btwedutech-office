import React, { useContext, useState } from "react";
import * as yup from "yup";
import classnames from "classnames";
import {
  Button,
  Col,
  Form,
  FormGroup,
  FormFeedback,
  Input,
  Label,
  Row,
} from "reactstrap";
import { InterestAndTalentSchoolContext } from "../../../../context/InterestAndTalentSchoolContext";
import { Controller, useForm } from "react-hook-form";
import {
  getCsrf,
  getIdFromURLSegment,
  showToast,
} from "../../../../utility/Utils";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff } from "react-feather";

const AddSchoolAdminForm = () => {
  const [isSubmitting, setIsSubmiting] = useState(false);
  const {
    showPassword,
    togglePasswordVisibility,
    toggleAddNewSchoolAdminModalVisibility,
  } = useContext(InterestAndTalentSchoolContext);
  const formSchema = yup.object().shape({
    school_admin_name: yup.string().required("Wajib diisi"),
    school_admin_username: yup.string().required("Wajib diisi"),
    school_admin_email: yup.string().required("Wajib diisi"),
    school_admin_password: yup.string().required("Wajib diisi"),
    school_admin_whatsapp_number: yup.string().required("Wajib diisi"),
  });
  const formDefaultValues = {
    school_admin_name: "",
    school_admin_username: "",
    school_admin_email: "",
    school_admin_password: "",
    school_admin_whatsapp_number: "",
  };
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: formDefaultValues,
  });
  const school_id = getIdFromURLSegment();
  const handleSchoolAdminUsernameChanged = (event, changeFormValue) => {
    const value = event.target.value;
    const allowedValue = /^[a-zA-Z0-9._-]*$/;
    if (!allowedValue.test(value)) return null;
    changeFormValue(value);
  };
  const handleSchoolAdminWhatsappNumberChanged = (event, changeFormValue) => {
    const value = event.target.value;
    const allowedValue = /^[0-9]*$/;
    if (!allowedValue.test(value)) return null;
    changeFormValue(value);
  };

  const submitForm = async (data) => {
    try {
      setIsSubmiting(true);
      const payload = {
        name: data.school_admin_name,
        username: data.school_admin_username,
        password: data.school_admin_password,
        email: data.school_admin_email,
        phone: data.school_admin_whatsapp_number,
        is_active: true,
        school_id: school_id,
      };
      await axios.post(
        `/api/interest-and-talent/schools/${school_id}/admins`,
        payload,
        {
          headers: {
            "X-CSRF-TOKEN": getCsrf(),
          },
        }
      );
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Data admin sekolah berhasil ditambah",
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message:
          error?.response?.data?.message ??
          "Terjadi kesalahn silakan coba lagi nanti",
      });
      setIsSubmiting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(submitForm)}>
      <Row>
        <Col md={12}>
          <Controller
            name="school_admin_name"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label for="school_admin_name" className="form-label">
                    Nama
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="school_admin_name"
                    innerRef={field.ref}
                    invalid={error && true}
                    {...field}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Controller
            name="school_admin_username"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label for="school_admin_username" className="form-label">
                    Username
                  </Label>
                  <Input
                    {...field}
                    type="text"
                    className="form-control"
                    id="school_admin_username"
                    innerRef={field.ref}
                    invalid={error && true}
                    onChange={(event) => {
                      handleSchoolAdminUsernameChanged(event, field.onChange);
                    }}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />
        </Col>
        <Col md={6}>
          <Controller
            name="school_admin_email"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label for="school_admin_email" className="form-label">
                    Email
                  </Label>
                  <Input
                    type="email"
                    className="form-control"
                    id="school_admin_email"
                    innerRef={field.ref}
                    invalid={error && true}
                    {...field}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Controller
            name="school_admin_password"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label for="school_admin_password" className="form-label">
                    Password
                  </Label>
                  <div
                    className={classnames(
                      "input-group input-group-merge form-password-toggle",
                      {
                        "is-invalid": error?.message,
                      }
                    )}
                  >
                    <Input
                      type={showPassword ? "text" : "password"}
                      className={classnames("form-control form-control-merge")}
                      id="login-password"
                      name="password"
                      tabIndex="2"
                      placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                      aria-describedby="login-password"
                      innerRef={field.ref}
                      invalid={error && true}
                      {...field}
                    />
                    <span className="input-group-text cursor-pointer">
                      {showPassword ? (
                        <EyeOff
                          size={10}
                          onClick={() => togglePasswordVisibility()}
                        />
                      ) : (
                        <Eye
                          size={10}
                          onClick={() => togglePasswordVisibility()}
                        />
                      )}
                    </span>
                  </div>
                  {error?.message && (
                    <div
                      style={{
                        width: "100%",
                        marginTop: "0.25rem",
                        fontSize: "0.857rem",
                        color: "#ea5455",
                      }}
                    >
                      {error?.message}
                    </div>
                  )}
                </FormGroup>
              );
            }}
          />
        </Col>
        <Col md={6}>
          <Controller
            name="school_admin_whatsapp_number"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label
                    for="school_admin_whatsapp_number"
                    className="form-label"
                  >
                    No. Whatsapp
                  </Label>
                  <Input
                    {...field}
                    type="text"
                    className="form-control"
                    id="school_admin_whatsapp_number"
                    innerRef={field.ref}
                    invalid={error && true}
                    pattern="[0-9]*"
                    onChange={(event) => {
                      handleSchoolAdminWhatsappNumberChanged(
                        event,
                        field.onChange
                      );
                    }}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>
      <Row className="mt-5">
        <Col md={12} className="d-flex justify-content-end align-items-center">
          <Button
            color="outline-primary"
            className="mr-25"
            onClick={toggleAddNewSchoolAdminModalVisibility}
            disabled={isSubmitting}
          >
            Tutup
          </Button>
          <Button color="gradient-primary" disabled={isSubmitting}>
            Buat Akun Admin
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default AddSchoolAdminForm;
