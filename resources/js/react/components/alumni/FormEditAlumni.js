import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import Cleave from "cleave.js/react";
import { Save } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Label,
  Input,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
  Col,
  Button,
  CustomInput,
  FormFeedback,
  Form,
} from "reactstrap";
import axios from 'axios';
import "cleave.js/dist/addons/cleave-phone.id";
import FileUpload from "../core/file-upload/FileUpload";
import SpinnerCenter from "../core/spinners/Spinner";
import { useFileUpload } from "../../hooks/useFileUpload";
import { AvRadioGroup, AvRadio, AvForm } from "availity-reactstrap-validation-safe";
import { isObjEmpty, showToast, getCsrf } from "../../utility/Utils";

const AlumniSchema = yup.object().shape({
  name: yup.string().required("Nama harus diisi"),
  phone: yup.mixed().notRequired(),
  twk: yup.lazy(value => {
    if(value) return yup.number().positive("Nilai TWK tidak boleh berupa bilangan negatif")
    return yup.mixed().notRequired();
  }),
  tiu: yup.lazy(value => {
    if(value) return yup.number().positive("Nilai TIU tidak boleh berupa bilangan negatif")
    return yup.mixed().notRequired();
  }),
  tkp: yup.lazy(value => {
    if(value) return yup.number().positive("Nilai TKP tidak boleh berupa bilangan negatif")
    return yup.mixed().notRequired();
  })
});
const source = axios.CancelToken.source();

const path = window.location.pathname;
const trimmedPath = path.replace(/^\W+/, "");
const splittedPath = trimmedPath.split("/");

const selection = splittedPath[2];
const id = splittedPath[3];

const ImagePreview = ({ files, name }) => {
  return (
    <div
      className={classnames(
        typeof files?.[name][0] !== "string" && "d-none",
        "mt-50"
      )}
    >
      <a href={files?.[name][0]} target="_blank" >
        <img src={files?.[name][0]} width={100}/>
      </a>
    </div>
  );
};

const FormEditAlumni = () => {
  const [alumni, setAlumni] = useState({});
  const [isSubmitting, setIsSubmiting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [userFiles, setUserFiles] = useState({
    formal_picture: [],
  });
  const [oldFormalPicture, setOldFormalPicture] = useState({
    formal_picture: [],
  });
  const isCanceled = useRef(false);

  const {
    watch,
    trigger,
    control,
    register,
    getValues,
    setValue,
    setError,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(AlumniSchema),
    defaultValues: {
      "is_all_passed": false,
      "is_skd_passed": false,
      "is_online_program": false,
      "is_offline_program": false,
    }
  });

  const {
    files,
    fileErrors,
    handleError,
    registerFile,
    checkIsFileValid,
    handleSelectedFile,
  } = useFileUpload(userFiles);

  const [twk, tiu, tkp] = watch(["twk", "tiu", "tkp"]);

  useEffect(() => {
    return () => {
      isCanceled.current = true;
    };
  }, []);

  useEffect(() => {
    (async () => {
      setAlumni(await fetchAlumni(selection, id));
    })();
  }, []);

  useEffect(() => {
    loadFormValue();
  }, [alumni]);

  useEffect(() => {
    if(twk && twk <= parseInt("0")) setValue("twk", "");
    if(tiu && tiu <= parseInt("0")) setValue("tiu", "");
    if(tkp && tkp <= parseInt("0")) setValue("tkp", "");

    if(twk !== "" && tiu !== "" && tkp !== "") {
      const total_score = parseInt(twk) + parseInt(tiu) + parseInt(tkp);
      setValue("total_score", total_score);
    } else {
      setValue("total_score", "");
    }
  }, [twk, tiu, tkp]);

  const loadFormValue = () => {
    setValue("name", alumni?.name);
    setValue("email", alumni?.email ?? "");
    setValue("phone", alumni?.phone ?? "");
    setValue("school_origin", alumni?.school_origin ?? "");
    setValue("major", alumni?.major ?? "");
    if(selection == "sekdin") setValue("instance", alumni?.instance ?? "");
    if(selection == "cpns") setValue("formation", alumni?.formation);
    setValue("social_ig", alumni?.social_ig ?? "");
    setValue("twk", alumni?.twk ?? 0);
    setValue("tiu", alumni?.tiu ?? 0);
    setValue("tkp", alumni?.tkp ?? 0);
    setValue("joined_year", alumni?.joined_year ?? "");
    setValue("passed_year", alumni?.passed_year ?? "");
    setValue("testimony", alumni?.testimony ?? "");
    setValue("is_skd_passed", alumni?.is_skd_passed);
    setValue("is_all_passed", alumni?.is_all_passed);
    setValue("is_online_program", alumni?.is_online_program);
    setValue("is_offline_program", alumni?.is_offline_program);
    setOldFormalPicture({ formal_picture: [alumni?.formal_picture] });
  };

  const fetchAlumni = async (selection, id) => {
    try {
      setIsFetching(true);
      const response = await axios.get(`/api/alumni/skd/${selection}/${id}`);
      const data = await response.data;
      if(data.data) setIsFetching(false);
      return data.data ?? {};
    } catch (error) {
      console.error(error);
      return {};
    }
  };

  const onSubmit = () => {
    trigger();
    const isFormFileValid = checkIsFileValid();

    if (isObjEmpty(errors) && isFormFileValid) {
      const formData = getFormData();
      editAlumni(formData);
    }
  }

  const getFormData = () => {
    let formData = new FormData();
    Object.keys(files).map((fileKey) => {
      formData.append(fileKey, files[fileKey][0]);
    });

    if(oldFormalPicture.formal_picture[0]) {
      Object.keys(oldFormalPicture).map((key) => {
        formData.append("old_formal_picture", oldFormalPicture[key][0]);
      });
    }

    const values = getValues();
    Object.keys(values).map((inputKey) => {
      if (inputKey == "selection") {
        formData.append(inputKey, JSON.stringify(values[inputKey]));
      } else if (
        inputKey == "is_all_passed" ||
        inputKey == "is_skd_passed" ||
        inputKey == "is_online_program" ||
        inputKey == "is_offline_program"
      ) {
        const value = values[inputKey] == true ? "1" : "0";
        formData.append(inputKey, value);
      } else {
        formData.append(inputKey, values[inputKey]);
      }
      formData.append('created_at', alumni?.created_at);
    });
    return formData;
  }

  const editAlumni = async (formData) => {
    try {
      setIsSubmiting(true);
      const response = await axios.post(`/api/alumni/skd/${selection}/${id}`, formData, {
        headers: {
          "X-CSRF-TOKEN": getCsrf(),
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.data;
      if(!isCanceled.current && data) {
        showToast({
          type: 'success',
          title: 'Berhasil',
          message: 'Data alumni berhasil diupdate'
        });
        setTimeout(() => {
          window.location.href = `/alumni`;
        }, 3000);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsSubmiting(false);
        if(error.response.status == 422) {
          const errorMessage = error.response.data.message;
          showToast({
            type: 'error',
            title: 'Terjadi Kesalahan',
            message: errorMessage
          });
        } else {
          showToast({
            type: 'error',
            title: 'Terjadi Kesalahan',
            message: 'Proses update data alumni gagal, silakan coba lagi nanti'
          });
        }
      }
    }
  }

  return isFetching ? (
    <SpinnerCenter />
  ) : (
    <Fragment>
      <Form
        className={classnames("mt-50", isSubmitting && "block-content")}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Row>
          <Col md={6} className="mb-1">
            <h5 className="mb-0 text-primary font-weight-bolder">Informasi Pribadi</h5>
            <small className="text-muted">Masukan informasi pribadi</small>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="name">Nama</Label>
                    <Input {...rest} id="name" type="text" innerRef={ref} invalid={error && true} value={field.value ?? ""}/>
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
              name="email"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input {...rest} id="email" type="email" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
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
              name="phone"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="phone">No. Whatsapp</Label>
                    <Input {...rest} id="phone" type="text" innerRef={ref} invalid={error && true} value={field.value ?? ""}/>
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
              name="school_origin"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="school_origin">Asal Sekolah</Label>
                    <Input {...rest} id="school_origin" type="text" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
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
              name="major"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="major">Jurusan</Label>
                    <Input {...rest} id="major" type="text" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            {selection == "sekdin" ? (
              <Controller
                name="instance"
                control={control}
                defaultValue=""
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup>
                      <Label for="instance">Instansi</Label>
                      <Input {...rest} id="instance" type="text" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />
            ) : (
              <Controller
                name="formation"
                control={control}
                defaultValue=""
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup>
                      <Label for="formation">Formasi</Label>
                      <Input {...rest} id="formation" type="text" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
                      <FormFeedback>{error?.message}</FormFeedback>
                    </FormGroup>
                  );
                }}
              />
            )}
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Controller
              name="social_ig"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="social_ig">Username Akun Instagram</Label>
                    <Input {...rest} id="social_ig" type="text" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
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
              name="formal_picture"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="formal_picture">Foto Formal</Label>
                    <FileUpload
                      {...registerFile("formal_picture")}
                      changed={handleSelectedFile}
                      name="formal_picture"
                      maxFileSize="5MB"
                      onerror={(e) => handleError("formal_picture", e)}
                      className={classnames({
                        "filepond-is-invalid": fileErrors.formal_picture.length > 0,
                      })}
                    />
                  </FormGroup>
                );
              }}
            />
          </Col>
        </Row>
        {alumni?.formal_picture ? (
          <Row>
            <Col md={6}>
              <FormGroup>
                <ImagePreview files={oldFormalPicture} name="formal_picture" />
              </FormGroup>
            </Col>
          </Row>
        ) : null}
        <Row className="mt-3">
          <Col md={6} className="mb-1">
            <h5 className="mb-0 text-primary font-weight-bolder">Informasi Nilai, Kelulusan & Testimoni</h5>
            <small className="text-muted">Masukan informasi nilai, kelulusan & testimoni</small>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Controller
              name="twk"
              control={control}
              defaultValue="0"
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="twk">Nilai TWK</Label>
                    <Input {...rest} id="twk" type="number" min="0" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
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
              name="tiu"
              control={control}
              defaultValue="0"
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="tiu">Nilai TIU</Label>
                    <Input {...rest} id="tiu" type="number" min="0" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
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
              name="tkp"
              control={control}
              defaultValue="0"
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="tkp">Nilai TKP</Label>
                    <Input {...rest} id="tkp" type="number" min="0" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
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
              name="total_score"
              control={control}
              defaultValue="0"
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="total_score">Nilai Total</Label>
                    <Input {...rest} id="total_score" type="number" innerRef={ref} invalid={error && true} readOnly={true} value={field.value ?? ""} />
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
              name="is_skd_passed"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, value, ...rest } = field;
                return (
                  <FormGroup>
                    <CustomInput
                      {...rest}
                      className="mt-50"
                      innerRef={ref}
                      type="checkbox"
                      name="is_skd_passed"
                      id="is_skd_passed"
                      label="Apakah lulus SKD?"
                      checked={value}
                      inline
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
              name="is_all_passed"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, value, ...rest } = field;
                return (
                  <FormGroup>
                    <CustomInput
                      {...rest}
                      className="mt-50"
                      innerRef={ref}
                      type="checkbox"
                      name="is_all_passed"
                      id="is_all_passed"
                      label="Apakah lulus pantukhir?"
                      checked={value}
                      inline
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
              name="is_online_program"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, value, ...rest } = field;
                return (
                  <FormGroup>
                    <CustomInput
                      {...rest}
                      className="mt-50"
                      innerRef={ref}
                      type="checkbox"
                      name="is_online_program"
                      id="is_online_program"
                      label="Apakah mengikuti program pembelajaran online?"
                      checked={value}
                      inline
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
              name="is_offline_program"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, value, ...rest } = field;
                return (
                  <FormGroup>
                    <CustomInput
                      {...rest}
                      className="mt-50"
                      innerRef={ref}
                      type="checkbox"
                      name="is_offline_program"
                      id="is_offline_program"
                      label="Apakah mengikuti program tatap muka?"
                      checked={value}
                      inline
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
              name="joined_year"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="joined_year">Tahun Bergabung di Bimbel BTW</Label>
                    <Input {...rest} id="joined_year" type="number" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
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
              name="passed_year"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="passed_year">Tahun Lulus Seleksi</Label>
                    <Input {...rest} id="passed_year" type="number" innerRef={ref} invalid={error && true} value={field.value ?? ""} />
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
              name="testimony"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="testimony">Testimoni</Label>
                    <Input {...rest} id="testimony" type="textarea" innerRef={ref} invalid={error && true} value={field.value ?? ""} bsSize="lg"/>
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
          </Col>
        </Row>
        <Col lg={6}>
          <div className="d-flex justify-content-end mt-2">
            <Button type="submit" color="success" className="btn-next" >
              {isSubmitting && (
                <Save size={14} className="align-middle ml-sm-25 ml-0 mr-50" />
              )}
              <span className="align-middle d-sm-inline-block">
                {isSubmitting ? "Menyimpan data..." : "Simpan"}
              </span>
            </Button>
          </div>
        </Col>
      </Form>
    </Fragment>
  );
};

export default FormEditAlumni;
