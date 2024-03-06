import React, { Fragment, useContext, useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import PropTypes from "prop-types";
import classnames from "classnames";
import moment from "moment-timezone";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { InterestAndTalentSchoolContext } from "../../../context/InterestAndTalentSchoolContext";
import { debounce } from "lodash";
import { getCsrf, showToast, selectThemeColors , getIdFromURLSegment} from "../../../utility/Utils";
import { yupResolver } from "@hookform/resolvers/yup";
import ContentLoader from "react-content-loader";
import Flatpickr from "react-flatpickr";
import "react-slidedown/lib/slidedown.css";
import "flatpickr/dist/themes/airbnb.css";
import "filepond/dist/filepond.min.css";
import { Eye, EyeOff } from "react-feather";

registerPlugin(FilePondPluginFileValidateType);

const initialSchoolType= [
  {
    label: "SD",
    value: "SD",
    isDisabled: false
  },
  {
    label: "SMP",
    value: "SMP",
    isDisabled: false
  },
  {
    label: "SMA/MA",
    value: "SMA",
    isDisabled: false
  },
  {
    label: "SMK",
    value: "SMK",
    isDisabled: false
  },
]
const SchoolForm = ({ type }) => {
  const {
    toggleSchoolModalVisibility,
    highSchools,
    setHighSchools,
    isFetchingHighSchools,
    setIsFetchingHighSchools,
    provinces,
    fetchProvinces,
    regions,
    isFetchingRegions,
    fetchRegions,
    school,
    showPassword,
    togglePasswordVisibility,
  } = useContext(InterestAndTalentSchoolContext);
  const filePondAcceptedFileTypes = ["image/jpg", "image/jpeg", "image/png"];
  const accessCodeFilePondAcceptedFileTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  const schoolID = getIdFromURLSegment();
  const formSchema = yup.object().shape({
    checkbox: yup.boolean(),
    school: yup.mixed().when('checkbox',{
      is: true,
      then:() => yup.string().required("Harus diisi"),
      otherwise: () => yup.object().typeError("Wajib dipilih").required("Wajib dipilih")
    }),
    school_type: yup.object().typeError("Wajib dipilih").required("Wajib dipilih"),
    school_province: yup
      .object()
      .required("Wajib dipilih")
      .typeError("Wajib dipilih"),
    school_region: yup
      .object()
      .required("Wajib dipilih")
      .typeError("Wajib dipilih"),
    school_address: yup.string().required("Wajib diisi"),
    school_logo: yup
      .array()
      .test(
        "school_logo_is_required",
        "Logo sekolah wajib dipilih",
        function (value, _) {
          if (type === "edit") return true;
          return value.length;
        }
      )
      .test(
        "school_logo_file_type_is_invalid",
        "Tipe/extension file logo sekolah harus berupa .png. .jpg, atau .jpeg",
        function (files, _) {
          return files.every((file) =>
            filePondAcceptedFileTypes.includes(file.type)
          );
        }
      )
      .test(
        "school_logo_dimensions",
        "Ukuran logo terlalu kecil. Ukuran logo minimal 125x125 px.",
        async function (files, _) {
          const checks = await Promise.all(
            files.map(async (file) => {
              const image = new Image();

              return new Promise((resolve) => {
                image.onload = () => {
                  resolve(image.width >= 125 && image.height >= 125);
                };
                image.src = URL.createObjectURL(file);
              });
            })
          );

          return checks.every(Boolean);
        }
      ),
    school_admin_name: yup
      .string()
      .test(
        "school_admin_name_is_required",
        "Wajib diisi",
        function (value, _) {
          if (type === "create" && !value) return false;
          return true;
        }
      ),
    school_admin_username: yup
      .string()
      .test(
        "school_admin_username_is_required",
        "Wajib diisi",
        function (value, _) {
          if (type === "create" && !value) return false;
          return true;
        }
      ),
    school_admin_email: yup
      .string()
      .test(
        "school_admin_email_is_required",
        "Wajib diisi",
        function (value, _) {
          if (type === "create" && !value) return false;
          return true;
        }
      )
      .email("Inputkan Email Yang Valid"),
    school_admin_password: yup
      .string()
      .test(
        "school_admin_password_is_required",
        "Wajib diisi",
        function (value, _) {
          if (type === "create" && !value) return false;
          return true;
        }
      ),
    school_admin_whatsapp_number: yup
      .string()
      .test(
        "school_admin_whatsapp_number_is_required",
        "Wajib diisi",
        function (value, _) {
          if (type === "create" && !value) return false;
          return true;
        }
      ),
    access_code_amount: yup
      .string()
      .test(
        "access_code_amount_is_valid",
        "Wajib diisi dan harus berupa angka",
        function (value, _) {
          if (type === "create" && !value) return false;
          if (type === "create" && isNaN(value)) return false;
          return true;
        }
      )
      .test(
        "access_code_amount_should_not_be_less_or_equal_zero",
        "Minimal 1",
        function (value, _) {
          if (type === "create" && !isNaN(value) && +value <= 0) return false;
          return true;
        }
      )
      .test(
        "access_code_amount_should_not_be_less_or_equal_zero",
        "Maksimal 20",
        function (value, _) {
          if (type === "create" && !isNaN(value) && +value > 20) return false;
          return true;
        }
      ),
    access_code_start_date: yup
      .string()
      .test(
        "access_code_start_date_is_required",
        "Wajib diisi",
        function (value, _) {
          if (type === "create" && !value) return false;
          return true;
        }
      ),
    access_code_start_time: yup
      .string()
      .test(
        "access_code_start_time_is_required",
        "Wajib diisi",
        function (value, _) {
          if (type === "create" && !value) return false;
          return true;
        }
      ),
    access_code_expire_date: yup
      .string()
      .test(
        "access_code_expire_date_is_required",
        "Wajib diisi",
        function (value, _) {
          if (type === "create" && !value) return false;
          return true;
        }
      )
      .test(
        "access_code_expire_date_is_not_valid",
        "Tanggal yang di-inputkan kurang dari 'Tanggal Kode Akses Mulai Berlaku'",
        function (value, context) {
          const access_code_start_date =
            context?.parent?.access_code_start_date;
          if (type === "create" && value < access_code_start_date) return false;
          return true;
        }
      ),
    access_code_expire_time: yup
      .string()
      .test(
        "access_code_expire_time_is_required",
        "Wajib diisi",
        function (value, _) {
          if (type === "create" && !value) return false;
          return true;
        }
      )
      .test(
        "access_code_expire_time_is_not_valid",
        "Jam yang di-inputkan harus setelah jam 'Tanggal Kode Akses Mulai Berlaku",
        function (value, context) {
          if (type === "edit") return true;

          const access_code_start_date =
            context?.parent?.access_code_start_date;
          const access_code_expire_date =
            context?.parent?.access_code_expire_date;

          if (access_code_start_date !== access_code_expire_date) return true;

          const access_code_start_time = moment(
            context?.parent?.access_code_start_time,
            "HH:mm:ss.SSSZ"
          );
          const access_code_expire_time = moment(value, "HH:mm:ss.SSSZ");
          return access_code_start_time.isBefore(access_code_expire_time);
        }
      ),
  });
  const formDefaultValues = {
    school: type === "edit" ? school : "",
    school_type: "",
    checkbox: false,
    school_province: "",
    school_region: "",
    school_address: "",
    school_logo: [],
    school_tags: [],
    school_admin_name: "",
    school_admin_username: "",
    school_admin_email: "",
    school_admin_password: "",
    school_admin_whatsapp_number: "",
    access_code_amount: "",
    access_code_start_date: "",
    access_code_start_time: "",
    access_code_expire_date: "",
    access_code_expire_time: "",
  };
  const {
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(formSchema),
    mode: "all",
    defaultValues: formDefaultValues,
  });
  const {
    school: school_form_value,
    school_province,
    school_region,
    school_address,
    school_tags,
  } = watch();
  
  const [isLoading, setIsLoading] = useState(type === "edit");
  const [page, setPage] = useState(0);
  const [isSubmitting, setIsSubmiting] = useState(false);
  const [schoolTagInput, setSchoolTagInput] = useState("");
  const [isHighSchool, setIsHighschool] = useState(false);
  const [filterRegion, setFilterRegion] = useState([]);
  const [schoolType, setSchoolType] = useState(initialSchoolType)

  useEffect(() => {
    (async () => {
      setHighSchools(await fetchHighSchools({ page }));
      fetchProvinces();
      const regions = await fetchRegions();
      setFilterRegion(regions)
    })();
  }, []);

  useEffect(() => {
    if (!school_form_value) {
      setValue("school_province", "");
      setValue("school_region", "");
      setValue("school_type", "")
      return;
    }
    setValue(
      "school_region",
      regions.find((region) => region._id === school_form_value.location_id)
    );
    setValue("school_type", schoolType.find((type) => type.value === school_form_value.type))
  }, [school_form_value]);

  useEffect(() => {
    if (!school_region) return;
    setValue(
      "school_province",
      provinces.find((province) => province._id === school_region.parent_id)
    );
  }, [school_region]);

  useEffect(() => {
    if (type === "edit") {
      if (!regions.length) return;

      const selectedRegion = regions?.find(
        (region) => region._id === school.location_id
      );
      const selectedProvince = provinces?.find(
        (province) => province._id === selectedRegion.parent_id
      );
      const schoolTags = school?.tag?.map((item) => ({
        label: item,
        value: item,
      }));
      setValue("school_region", selectedRegion);
      setValue("school_province", selectedProvince);
      setValue("school_address", school?.address);
      setValue("school_tags", schoolTags);
    }
  }, [regions]);

  useEffect(() => {
    if (type === "create") return;
    if (school_form_value && school_province && school_region && school_address)
      setIsLoading(false);
  }, [school_form_value, school_province, school_region, school_address]);

  function handleSchoolNameChanged(event, changeForm) {
    const value = event.target.value.toUpperCase();
    changeForm(value);
  }

  const handleSchoolAdminUsernameChanged = (event, changeFormValue) => {
    const value = event.target.value;
    const allowedValue = /^[a-zA-Z0-9._-]*$/;
    if (value && !allowedValue.test(value)) return null;
    changeFormValue(value);
  };

  const handleSchoolAdminWhatsappNumberChanged = (event, changeFormValue) => {
    const value = event.target.value;
    const allowedValue = /^[0-9]*$/;
    if (!allowedValue.test(value)) return null;
    changeFormValue(value);
  };

  const createSchoolTagOption = (label) => ({
    label,
    value: label,
  });

  const handleSchoolTagsKeyDown = (event) => {
    if (!schoolTagInput) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        setValue("school_tags", [
          ...school_tags,
          createSchoolTagOption(schoolTagInput),
        ]);
        setSchoolTagInput("");
        event.preventDefault();
    }
  };

  const handleCheckboxValueChanged = (field,e) => {
    field.onChange(e.target.checked)
    setValue("school","")
    setValue("school_type", "");
    setIsHighschool(e.target.checked);
    const updatedSchoolType = e.target.checked ? [
      {
        label: "SD",
        value: "SD",
        isDisabled: false
      },
      {
        label: "SMP",
        value: "SMP",
        isDisabled: false
      },
      {
        label: "SMA/MA",
        value: "SMA",
        isDisabled: true
      },
      {
        label: "SMK",
        value: "SMK",
        isDisabled: true
      },
    ] : initialSchoolType;
    setSchoolType(updatedSchoolType);
  }

  const handleProvinceChanged = (field, selectedOption) => {
    field.onChange(selectedOption);
    const findRegion = regions.filter((region) => region.parent_id === selectedOption._id)
    setFilterRegion(findRegion);
    setValue("school_region", "");
  }

  const accessCodeAmountInputElement =
    document.getElementById("access_code_amount");
  if (document.contains(accessCodeAmountInputElement)) {
    accessCodeAmountInputElement.addEventListener("wheel", (event) =>
      event.preventDefault()
    );
  }

  const fetchHighSchools = async ({ page = 0, per_page = 100, name = "" }) => {
    try {
      setIsFetchingHighSchools(true);
      const response = await axios.get("/api/highschools/paginated", {
        params: {
          page,
          per_page,
          name,
        },
      });
      const data = await response?.data;
      return data?.data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setIsFetchingHighSchools(false);
    }
  };

  const submitForm = (data) => {
    if (type === "create") createSchool(data);
    else updateSchool(school?.id, data);
  };

  const createSchool = async (data) => {
    try {
      trigger();
      setIsSubmiting(true);
      const formData = new FormData();
      formData.append(
        "school",
        JSON.stringify({
          name: isHighSchool ? data.school : data.school.name,
          type: data.school_type.value,
          location_id: data.school_region._id,
          school_origin_id: isHighSchool ? "" : data.school._id,
          address: data.school_address,
          amount: +data.access_code_amount,
          start_datetime: `${data.access_code_start_date} ${data.access_code_start_time}`,
          end_datetime: `${data.access_code_expire_date} ${data.access_code_expire_time}`,
          tag: data.school_tags.map((item) => item.label),
        })
      );
      if (data.school_logo.length > 0) {
        formData.append("school_logo", data.school_logo[0]);
      }
      formData.append(
        "admin",
        JSON.stringify({
          name: data.school_admin_name,
          username: data.school_admin_username,
          password: data.school_admin_password,
          email: data.school_admin_email,
          phone: data.school_admin_whatsapp_number,
          is_active: true,
        })
      );

      await axios.post(
        "/api/interest-and-talent/schools",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRF-TOKEN": getCsrf(),
          },
        }
      );
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Data sekolah berhasil ditambah",
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      showToast({
        type: "error",
        title: "Terjadi Kesalahan",
        message:
          error?.response?.data?.message ??
          "Terjadi kesalahan silakan coba lagi nanti",
      });
      setIsSubmiting(false);
    }
  };

  const updateSchool = async (school_id, data) => {
    try {
      trigger();
      setIsSubmiting(true);
      const formData = new FormData();
      formData.append(
        "school",
        JSON.stringify({
          id: schoolID,
          name: data.school.name,
          type: data.school.type,
          location_id: data.school_region._id,
          school_origin_id: data.school.school_origin_id,
          address: data.school_address,
          tag: data.school_tags.map((item) => item.label),
        })
      );
      if (data.school_logo.length > 0) {
        formData.append("school_logo", data.school_logo[0]);
      } else {
        formData.append("school_logo", school.logo);
      }
      await axios.post(
        `/api/interest-and-talent/schools/${school_id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-CSRF-TOKEN": getCsrf(),
          },
        }
      );
      showToast({
        type: "success",
        title: "Berhasil",
        message: "Data sekolah berhasil diubah",
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
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

  const highSchoolLoadOptions = async (inputValue, callback) => {
    try {
      setValue("school", "");
      const highschools = await fetchHighSchools({ page, name: inputValue });
      callback(highschools);
    } catch (error) {
      console.error(error);
      callback([], null);
    }
  };
  const debouncedHighSchoolLoadOptions = debounce(highSchoolLoadOptions, 500);

  return isLoading ? (
    <ContentLoader viewBox="0 0 380 70" className="mt-3">
      <rect x="0" y="0" rx="5" ry="5" width="100%" height="10" />
      <rect x="0" y="14" rx="5" ry="5" width="100%" height="10" />
      <rect x="0" y="28" rx="5" ry="5" width="100%" height="10" />
    </ContentLoader>
  ) : (
    <Form onSubmit={handleSubmit(submitForm)}>
      {type === "create" ? (
        <h5 className="mb-1" style={{ color: "#949494", fontWeight: "600" }}>
          Informasi Sekolah
        </h5>
      ) : null}
      {isHighSchool ?  
      <Row>
         <Col md={12}>
           <Controller
             name="school"
             control={control}
             render={({ field, fieldState: { error } }) => {
              const { ref, onChange, ...rest } = field;
               return (
                 <FormGroup>
                   <Label for="school" className="form-label">
                     Nama Sekolah
                   </Label>
                   <Input
                     type="text"
                     className="form-control"
                     id="school"
                     innerRef={field.ref}
                     invalid={error && true}
                     onChange={(event) =>
                      handleSchoolNameChanged(event, onChange)
                    }
                    placeholder="Ketik Nama Sekolah"
                     {...rest}
                   />
                   <FormFeedback>{error?.message}</FormFeedback>
                 </FormGroup>
               );
             }}
           />
         </Col>
       </Row>
      : 
      <Row>
        <Col md={12}>
          <Controller
            name="school"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label for="school" className="form-label">
                    Nama Sekolah
                  </Label>
                  <AsyncSelect
                    {...field}
                    id="school"
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                      }),
                    }}
                    isSearchable
                    isClearable
                    cacheOptions
                    isDisabled={type === "edit"}
                    defaultOptions={highSchools}
                    loadOptions={debouncedHighSchoolLoadOptions}
                    isLoading={isFetchingHighSchools}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option._id}
                    classNamePrefix="select"
                    className={classnames("react-select", {
                      "is-invalid": error && true,
                    })}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>
      }
      {type === "create" 
      ? <Row>
          <Col md={6}>
            <Controller
              name="checkbox"
              control={control}
              render={({ field, fieldState: { error } }) => {
                return (
                 <FormGroup>
                   <label style={{ display: 'flex', alignItems: 'center'}}>
                     <input
                       {...field}
                       type="checkbox"
                       checked={isHighSchool}
                       onChange={(e) => {
                        handleCheckboxValueChanged(field,e)
                       }}
                       style={{ marginRight: '8px' }}
                     />
                     <span>Inputkan data sekolah secara manual.</span>
                   </label>
                 </FormGroup>
                )
              }}
            />
          </Col>
        </Row> 
      : ''
      }
      
      {isHighSchool && (
         <Row>
           <Col md={12}>
             <Controller
               name="school_type"
               control={control}
               render={({ field, fieldState: { error } }) => {
                 return (
                   <FormGroup>
                     <Label for="school_type" className="form-label">
                       Tipe Sekolah
                     </Label>
                     <AsyncSelect
                       {...field}
                       id="school_type"
                       styles={{
                         menu: (provided) => ({
                           ...provided,
                           zIndex: 9999,
                         }),
                       }}
                       isSearchable
                       isClearable
                       cacheOptions
                       isDisabled={type === "edit"}
                       defaultOptions={schoolType}
                       isLoading={isFetchingHighSchools}
                       classNamePrefix="select"
                       className={classnames("react-select", {
                         "is-invalid": error && true,
                       })}
                     />
                     <FormFeedback>{error?.message}</FormFeedback>
                   </FormGroup>
                 );
               }}
             />
           </Col>
        </Row> 
      )}
      <Row>
        <Col md={6}>
          <Controller
            name="school_province"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label for="school_province" className="form-label">
                    Provinsi
                  </Label>
                  <Select
                    {...field}
                    id="school_province"
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                      }),
                    }}
                    isSearchable
                    isDisabled={isHighSchool ? false : true}
                    options={provinces}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option._id}
                    classNamePrefix="select"
                    className={classnames("react-select", {
                      "is-invalid": error && true,
                    })}
                    onChange={(selectedOption) => {
                      handleProvinceChanged(field, selectedOption)
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
            name="school_region"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label for="school_region" className="form-label">
                    Kabupaten/Kota
                  </Label>
                  <Select
                    {...field}
                    id="school_region"
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                      }),
                    }}
                    isSearchable
                    options={filterRegion}
                    isDisabled={isHighSchool ? false : true}
                    isLoading={isFetchingRegions}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option._id}
                    classNamePrefix="select"
                    className={classnames("react-select", {
                      "is-invalid": error && true,
                    })}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Controller
            name="school_address"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label for="school_address" className="form-label">
                    Alamat Sekolah
                  </Label>
                  <Input
                    type="text"
                    className="form-control"
                    id="school_address"
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
        <Col md={12}>
          <Controller
            name="school_logo"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label for="school_logo" className="form-label">
                    Logo Sekolah
                  </Label>
                  <FilePond
                    acceptedFileTypes={filePondAcceptedFileTypes}
                    name="school_logo"
                    id="school_logo"
                    files={field.value}
                    onupdatefiles={(fileItems) => {
                      field.onChange(
                        fileItems.map((fileItem) => fileItem.file)
                      );
                    }}
                    labelIdle='
                      <div class="mt-1">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <p class="my-1 filepond-label">Seret & Jatuhkan atau <span class="filepond--label-action">Pilih File</span> untuk di upload<p>
                        <p class="my-1 text-info-sm">PNG, JPG atau JPEG</p>
                      </div>
                    '
                  />
                  {errors.school_logo && (
                    <p
                      style={{
                        width: "100%",
                        marginTop: "0.25rem",
                        fontSize: "0.857rem",
                        color: "#ea5455",
                      }}
                    >
                      {errors.school_logo.message}
                    </p>
                  )}
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Controller
            name="school_tags"
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label for="school_tags" className="form-label">
                    Tag Sekolah (Opsional)
                  </Label>
                  <CreatableSelect
                    {...field}
                    isMulti
                    components={{ DropdownIndicator: null }}
                    inputValue={schoolTagInput}
                    menuIsOpen={false}
                    id="school_tags"
                    placeholder={`Ketik tag dan tekan "Enter"`}
                    onChange={(newValue) => setValue("school_tags", newValue)}
                    onInputChange={(newValue) => setSchoolTagInput(newValue)}
                    onKeyDown={handleSchoolTagsKeyDown}
                    value={school_tags}
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 9999,
                        borderColor: "#d8d6de",
                        cursor: "text",
                      }),
                    }}
                    classNamePrefix="select"
                    className={classnames("react-select", {
                      "is-invalid": error && true,
                    })}
                    theme={selectThemeColors}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>
      {type === "create" ? (
        <Fragment>
          <hr />
          <h5 className="my-1" style={{ color: "#949494", fontWeight: "600" }}>
            Akun Admin Sekolah
          </h5>
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
                        onChange={(event) =>
                          handleSchoolAdminUsernameChanged(
                            event,
                            field.onChange
                          )
                        }
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
                        type="text"
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
                          className={classnames(
                            "form-control form-control-merge"
                          )}
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
          <hr />
          <h5 className="my-1" style={{ color: "#949494", fontWeight: "600" }}>
            Kode Akses
          </h5>
          <Row>
            <Col md="9">
              <Controller
                control={control}
                name="access_code_start_date"
                render={({
                  field: { onChange, ref, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <Label>Tanggal Kode Akses Mulai Berlaku</Label>
                    <Flatpickr
                      className={classnames("flatpickr-input", "form-control", {
                        "is-invalid": !isValid && error,
                      })}
                      ref={ref}
                      readOnly={false}
                      value={value}
                      onChange={(date) =>
                        onChange(
                          date.length
                            ? moment(date[0]).format("YYYY-MM-DD")
                            : ""
                        )
                      }
                      placeholder="Input Tanggal"
                    />
                    {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
                  </FormGroup>
                )}
              />
            </Col>
            <Col md="3">
              <Controller
                control={control}
                name="access_code_start_time"
                render={({
                  field: { onChange, ref, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <Label>Jam (WIB)</Label>
                    <Flatpickr
                      data-no-calendar
                      data-enable-time
                      data-time_24hr
                      className={classnames("flatpickr-input", "form-control", {
                        "is-invalid": !isValid && error,
                      })}
                      ref={ref}
                      readOnly={false}
                      value={value}
                      onChange={(date) =>
                        onChange(
                          date.length
                            ? moment(date[0]).format("HH:mm:ss.SSS")
                            : ""
                        )
                      }
                      placeholder="Input Jam"
                    />
                    {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
                  </FormGroup>
                )}
              />
            </Col>
          </Row>
          <Row>
            <Col md="9">
              <Controller
                control={control}
                name="access_code_expire_date"
                render={({
                  field: { onChange, ref, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <Label>Tanggal Kode Akses Kadaluarsa</Label>
                    <Flatpickr
                      className={classnames("flatpickr-input", "form-control", {
                        "is-invalid": !isValid && error,
                      })}
                      ref={ref}
                      readOnly={false}
                      value={value}
                      onChange={(date) =>
                        onChange(
                          date.length
                            ? moment(date[0]).format("YYYY-MM-DD")
                            : ""
                        )
                      }
                      placeholder="Input Tanggal"
                    />
                    {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
                  </FormGroup>
                )}
              />
            </Col>
            <Col md="3">
              <Controller
                control={control}
                name="access_code_expire_time"
                render={({
                  field: { onChange, ref, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <Label>Jam (WIB)</Label>
                    <Flatpickr
                      data-no-calendar
                      data-enable-time
                      data-time_24hr
                      className={classnames("flatpickr-input", "form-control", {
                        "is-invalid": !isValid && error,
                      })}
                      ref={ref}
                      readOnly={false}
                      value={value}
                      onChange={(date) =>
                        onChange(
                          date.length
                            ? moment(date[0]).format("HH:mm:ss.SSS")
                            : ""
                        )
                      }
                      placeholder="Input Jam"
                    />
                    {!isValid && <FormFeedback>{error?.message}</FormFeedback>}
                  </FormGroup>
                )}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Controller
                name="access_code_amount"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <FormGroup>
                      <Label for="access_code_amount" className="form-label">
                        Jumlah Kode Akses Yang Akan Di Assign
                      </Label>
                      <Input
                        type="number"
                        className="form-control"
                        id="access_code_amount"
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
        </Fragment>
      ) : null}
      <Row className="mt-5">
        <Col md={12} className="d-flex justify-content-end align-items-center">
          <Button
            color="outline-primary"
            className="mr-25"
            onClick={toggleSchoolModalVisibility}
            disabled={isSubmitting || isLoading}
          >
            Tutup
          </Button>
          <Button
            type="submit"
            color="gradient-primary"
            disabled={isSubmitting || isLoading}
          >
            {type === "create" ? "Buat" : "Ubah"} Data Sekolah
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

SchoolForm.propTypes = {
  type: PropTypes.oneOf(["create", "edit"]),
};

export default SchoolForm;
