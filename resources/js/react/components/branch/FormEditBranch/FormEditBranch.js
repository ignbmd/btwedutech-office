import axios from "axios";
import * as yup from "yup";
import { useRef } from "react";
import Select from "react-select";
import classnames from "classnames";
import { Save } from "react-feather";
import { Fragment, useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import {
  Form,
  Label,
  Input,
  FormGroup,
  Row,
  Col,
  Button,
  CustomInput,
} from "reactstrap";
import { getBranchEarningDefaultByBranchCode } from "../../../data/finance-branch-earning";

import SpinnerCenter from "../../core/spinners/Spinner";
import MapDraggableMarker from "../../core/map/MapDraggableMarker";
import { getLastSegment, isObjEmpty, showToast } from "../../../utility/Utils";
import InputCustomPromo from "../../core/input/InputCustomPromo";

const branchScope = [
  { value: "province", label: "Provinsi" },
  { value: "district", label: "Kabupaten" },
];

const feeFor = [
  { value: "CENTRAL", label: "Pusat" },
  { value: "BRANCH", label: "Cabang" },
];

const branchTags = [
  { value: "FRANCHISE", label: "Franchise" },
  { value: "CENTRAL", label: "Dikelola Pusat" },
];

const discountMethod = [
  { value: "ALL", label: "Semua Jenis" },
  { value: "CODE_ONLY", label: "Hanya Kode Diskon" },
];

const BranchSchema = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
  scope: yup.object().required(),
  tag: yup.object().required(),
  discount_method: yup.object().required("Metode Diskon harus diisi"),
});

const FormEditBranch = () => {
  const [center] = useState({
    lat: -8.672289570382828,
    lng: 115.25852667012805,
  });
  const [marker, setMarker] = useState({
    lat: -8.672289570382828,
    lng: 115.25852667012805,
  });
  const branchCode = getLastSegment();
  const [isFetching, setIsFetching] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const isCanceled = useRef(false);
  const source = axios.CancelToken.source();
  const { fee_amount } = watch();

  // const onChangeCustomCode = (event, changeForm) => {
  //   const value = event.target.value;
  //   const allowedValue = /^[a-zA-Z0-9_]*$/;
  //   if (!allowedValue.test(value)) return null;
  //   changeForm(value);
  // };

  // console.log(is_custom_code);

  const onSubmit = async () => {
    trigger();
    if (isObjEmpty(errors)) {
      const values = getValues();
      const updatedValues = {
        name: values.name,
        address: values.address,
        lat: marker.lat,
        lng: marker.lng,
        earning_position: values.fee_for?.value,
        tag: values.tag?.value ?? "",
        amount_type: values?.fee_amount_type,
        discount_method: values.discount_method.value,
        amount: Number(values?.fee_amount ?? 0),
        branch_code: values.is_custom_code ? values.custom_code : null,
      };

      try {
        setIsUpdating(true);
        const response = await axios.put(`/api/branch/update/${branchCode}`, {
          ...updatedValues,
          cancelToken: source.token,
        });
        const payload = await response.data;
        const isSuccess = payload.data.success;
        if (!isCanceled.current && isSuccess) {
          window.location.href = "/cabang";
        }
      } catch (error) {
        if (!isCanceled.current) {
          setIsUpdating(false);
          showToast({
            type: "error",
            title: "Terjadi Kesalahan",
            message: "Sistem dalam perbaikan, harap mencoba beberapa saat lagi",
          });
        }
      }
    }
  };

  const getBranch = async (code) => {
    try {
      const response = await axios.get(`/api/branch/${code}`, {
        cancelToken: source.token,
      });
      const data = await response.data;
      const branch = data?.data;
      if (!isCanceled.current) {
        setValue("name", branch.name);
        setValue("address", branch.address);
        let selectedScope = {};
        if (branch.level === "PV") {
          selectedScope = {
            label: "Provinsi",
            value: "PV",
          };
        } else if (branch.level === "KB") {
          selectedScope = {
            label: "Kabupaten",
            value: "KB",
          };
        }
        setValue("scope", selectedScope);
        setValue(
          "tag",
          branchTags.find((tag) => tag.value === branch.tag)
        );
        let selectedDiscountMethod = {};
        if (branch.discount_method === "ALL") {
          selectedDiscountMethod = {
            label: "Semua Jenis",
            value: "ALL",
          };
        } else if (branch.discount_method === "CODE_ONLY") {
          selectedDiscountMethod = {
            label: "Hanya Kode Diskon",
            value: "CODE_ONLY",
          };
        }
        setValue("discount_method", selectedDiscountMethod);
        setMarker({
          lat: branch.geolocation.lat,
          lng: branch.geolocation.lng,
        });
        setIsFetching(false);
      }
    } catch (error) {
      if (!isCanceled.current) {
        setIsFetching(false);
      }
    }
  };

  const loadDefaultBranchEarning = async (branchCode) => {
    const earning = await getBranchEarningDefaultByBranchCode(branchCode);
    setValue("fee_amount_type", earning?.amount_type);
    setValue("fee_amount", String(earning?.amount ?? 0));
    setValue(
      "fee_for",
      feeFor.find((f) => f.value == earning?.earning_position)
    );
  };

  useEffect(() => {
    getBranch(branchCode);
    loadDefaultBranchEarning(branchCode);
    return () => {};
  }, []);

  return (
    <Fragment>
      {isFetching ? (
        <SpinnerCenter />
      ) : (
        <Form
          onSubmit={handleSubmit(onSubmit)}
          className={classnames(isUpdating ? "block-content" : "")}
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
                      isDisabled
                      options={branchScope}
                      classNamePrefix="select"
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
            <div className="form-group col-md-6 z-10">
              <Controller
                name="discount_method"
                control={control}
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
            </div>
          </Row>

          {/* <Row>
            <Col>
              <Controller
                name="is_custom_code"
                defaultValue={is_custom_code}
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
                        onChange={(event) =>
                          onChangeCustomCode(event, onChange)
                        }
                      />
                    </FormGroup>
                  );
                }}
              />
            </Row>
          ) : null} */}
          <Row>
            <div className="form-group col-md-6 z-10">
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
              <Label className="form-label">Pin Lokasi</Label>
              <MapDraggableMarker
                center={center}
                marker={marker}
                setMarker={setMarker}
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
                defaultValue={getValues("fee_amount")}
                defaultTypeValue={getValues("fee_amount_type")}
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
                  </FormGroup>
                )}
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-2">
            <Button type="submit" color="primary" className="btn-next">
              <Save size={14} className="align-middle ml-sm-25 ml-0 mr-50" />
              <span className="align-middle d-sm-inline-block">
                {isUpdating ? "Memperbarui data..." : "Perbarui"}
              </span>
            </Button>
          </div>
        </Form>
      )}
    </Fragment>
  );
};

export default FormEditBranch;
