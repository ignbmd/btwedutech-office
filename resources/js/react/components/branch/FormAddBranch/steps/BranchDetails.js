import axios from "axios";
import * as yup from "yup";
import { useRef } from "react";
import Select from "react-select";
import classnames from "classnames";
import { Fragment, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, ArrowRight } from "react-feather";
import {
  Form,
  Label,
  Input,
  FormGroup,
  Row,
  Col,
  Button,
  FormFeedback,
  CustomInput,
} from "reactstrap";

import { isObjEmpty } from "../../../../utility/Utils";
import InputCustomPromo from "../../../core/input/InputCustomPromo";
import MapDraggableMarker from "../../../core/map/MapDraggableMarker";

const branchScope = [
  { value: "PV", label: "Provinsi" },
  { value: "KB", label: "Kabupaten" },
];

const branchTags = [
  { value: "FRANCHISE", label: "Franchise" },
  { value: "CENTRAL", label: "Dikelola Pusat" },
];

const feeFor = [
  { value: "CENTRAL", label: "Pusat" },
  { value: "BRANCH", label: "Cabang" },
];

const discountMethod = [
  { value: "ALL", label: "Semua Jenis" },
  { value: "CODE_ONLY", label: "Hanya Kode Diskon" },
];

const BranchSchema = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
  scope: yup.object().required(),
  is_custom_code: yup.boolean().nullable(),
  custom_code: yup.string().when(["is_custom_code"], {
    is: (isCustomCode) => !!isCustomCode,
    then: yup.string().required("Kode cabang harus diisi"),
  }),
  fee_amount: yup.string().required("Nominal harus diisi"),
  fee_for: yup.object().required("Untuk harus diisi"),
  tag: yup.object().required("Tipe cabang harus diisi"),
  discount_method: yup.object().required("Metode Diskon harus diisi"),
});

const AccountDetails = ({ stepper, formData, updateFormData }) => {
  const [center] = useState({
    lat: -8.672289570382828,
    lng: 115.25852667012805,
  });
  const [marker, setMarker] = useState({
    lat: -8.672289570382828,
    lng: 115.25852667012805,
  });
  const {
    watch,
    control,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(BranchSchema),
  });
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();
  const { fee_amount, is_custom_code } = watch();

  const createBranch = async () => {
    try {
      setIsCreatingBranch(true);
      const values = getValues();
      const payload = {
        name: values.name,
        address: values.address,
        level: values.scope.value,
        earning_position: values.fee_for?.value,
        amount_type: values?.fee_amount_type,
        tag: values.tag?.value ?? "",
        discount_method: values.discount_method.value,
        amount: Number(values?.fee_amount ?? 0),
        branch_code: values.is_custom_code ? values.custom_code : null,
        ...marker,
      };

      let response;
      if (formData?.branchCode) {
        response = await axios.put(
          `/api/branch/update/${formData.branchCode}`,
          {
            ...payload,
            cancelToken: source.token,
          }
        );
      } else {
        response = await axios.post("/api/branch/create", {
          ...payload,
          cancelToken: source.token,
        });
      }

      const data = await response.data;
      const branch = data?.data;

      if (!isCanceled.current) {
        setIsCreatingBranch(false);
        const values = getValues();
        updateFormData({
          ...values,
          geolocation: marker,
          branchCode: formData?.branchCode ?? branch.BranchCode,
        });
        stepper.next();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeCustomCode = (event, changeForm) => {
    const value = event.target.value;
    const allowedValue = /^[a-zA-Z0-9_]*$/;
    if (!allowedValue.test(value)) return null;
    changeForm(value);
  };

  const onSubmit = () => {
    trigger();
    if (isObjEmpty(errors)) {
      createBranch();
    }
  };

  return (
    <Fragment>
      <div className="content-header">
        <h5 className="mb-0">Detail Cabang</h5>
        <small className="text-muted">Inputkan detail informasi cabang</small>
      </div>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className={classnames(isCreatingBranch ? "block-content" : "")}
      >
        <Row>
          <Controller
            name="name"
            defaultValue=""
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, ...rest } = field;
              return (
                <FormGroup tag={Col} md="6">
                  <Label className="form-label" for="name">
                    Nama Cabang
                  </Label>
                  <Input
                    {...rest}
                    id="name"
                    innerRef={ref}
                    placeholder="BTW Bali"
                    invalid={error && true}
                  />
                </FormGroup>
              );
            }}
          />
        </Row>
        <Row>
          <Controller
            name="address"
            defaultValue=""
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, ...rest } = field;
              return (
                <FormGroup tag={Col} md="6">
                  <Label className="form-label" for="address">
                    Alamat Lengkap
                  </Label>
                  <Input
                    {...rest}
                    id="address"
                    placeholder=""
                    innerRef={ref}
                    invalid={error && true}
                  />
                </FormGroup>
              );
            }}
          />
        </Row>
        <Row>
          <div className="form-group col-md-6 z-10">
            <Controller
              isClearable
              name="scope"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormGroup>
                  <Label className="form-label" for="scope">
                    Lingkup
                  </Label>
                  <Select
                    styles={{
                      menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    }}
                    {...field}
                    options={branchScope}
                    isDisabled={formData?.branchCode && true}
                    classNamePrefix="select"
                    className={classnames("react-select", {
                      "is-invalid": error && true,
                    })}
                  />
                </FormGroup>
              )}
            />

            <Controller
              name="discount_method"
              control={control}
              defaultValue={discountMethod[0]}
              render={({ field, fieldState: { error } }) => (
                <FormGroup>
                  <Label className="form-label">Metode Diskon</Label>
                  <Select
                    styles={{
                      menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    }}
                    {...field}
                    options={discountMethod}
                    classNamePrefix="select"
                    isClearable={true}
                    className={classnames("react-select", {
                      "is-invalid": error && true,
                    })}
                  />
                </FormGroup>
              )}
            />
            <Controller
              name="tag"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormGroup>
                  <Label className="form-label">Tipe Cabang</Label>
                  <Select
                    styles={{
                      menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    }}
                    {...field}
                    options={branchTags}
                    classNamePrefix="select"
                    isClearable={true}
                    className={classnames("react-select", {
                      "is-invalid": error && true,
                    })}
                  />
                </FormGroup>
              )}
            />
          </div>
        </Row>

        <Row>
          <Col>
            <Controller
              name="is_custom_code"
              defaultValue={0}
              control={control}
              render={({ field }) => {
                const { ref, ...rest } = field;
                return (
                  <CustomInput
                    {...rest}
                    inline
                    type="checkbox"
                    label="Kustomisasi Kode Cabang"
                    id="is_custom_code"
                    innerRef={ref}
                    className="mb-1"
                  />
                );
              }}
            />
          </Col>
        </Row>

        {is_custom_code ? (
          <Row>
            <Controller
              name="custom_code"
              defaultValue=""
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, onChange, ...rest } = field;
                return (
                  <FormGroup tag={Col} md="6">
                    <Label className="form-label" for="custom_code">
                      Kode Cabang
                    </Label>
                    <Input
                      {...rest}
                      id="custom_code"
                      placeholder=""
                      innerRef={ref}
                      invalid={error && true}
                      onChange={(event) => onChangeCustomCode(event, onChange)}
                    />
                  </FormGroup>
                );
              }}
            />
          </Row>
        ) : null}
        <Row>
          <Col>
            <Label className="form-label">Pin Lokasi</Label>
            <MapDraggableMarker
              center={center}
              marker={marker}
              setMarker={setMarker}
              withGetCurrentLocation
            />
          </Col>
        </Row>

        <hr />
        <h5 className="mb-0">Atur Bonus</h5>
        <small className="text-muted">
          Atur besaran bonus untuk pusat atau cabang
        </small>

        <Row className="mt-2">
          <Col md="6">
            <InputCustomPromo
              name="fee_amount"
              typeName="fee_amount_type"
              control={control}
              value={fee_amount}
              setValue={setValue}
            />

            <Controller
              isClearable
              name="fee_for"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormGroup>
                  <Label className="form-label">Untuk</Label>
                  <Select
                    styles={{
                      menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    }}
                    {...field}
                    options={feeFor}
                    classNamePrefix="select"
                    className={classnames("react-select", {
                      "is-invalid": error && true,
                    })}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              )}
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-between mt-2">
          <Button color="secondary" className="btn-prev" outline disabled>
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
              {isCreatingBranch
                ? "Please wait..."
                : formData?.branchCode
                ? "Perbarui & Lanjutkan"
                : "Simpan & Lanjutkan"}
            </span>
            <ArrowRight
              size={14}
              className="align-middle ml-sm-25 ml-0"
            ></ArrowRight>
          </Button>
        </div>
      </Form>
    </Fragment>
  );
};

export default AccountDetails;
