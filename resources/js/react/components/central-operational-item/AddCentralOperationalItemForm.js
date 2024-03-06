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
} from "reactstrap";
import axios from "axios";
import {
  AvRadioGroup,
  AvRadio,
  AvForm,
} from "availity-reactstrap-validation-safe";
import {
  isObjEmpty,
  normalNumber,
  showToast,
} from "../../../../js/react/utility/Utils";

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const FormSchema = yup.object().shape({
  branch_code: yup
    .object()
    .typeError("Cabang tidak boleh kosong")
    .required("Cabang tidak boleh kosong"),
  product_code: yup
    .object()
    .typeError("Kode produk tidak boleh kosong")
    .required("Kode produk tidak boleh kosong"),
  items_name: yup.string().required("Nama produk tidak boleh kosong"),
  qty: yup
    .number()
    .min(1, "Jumlah tidak boleh 0")
    .typeError("Jumlah tidak boleh kosong")
    .required("Jumlah tidak boleh kosong"),
  amount: yup
    .number()
    .min(1, "Harga tidak boleh 0")
    .typeError("Harga tidak boleh kosong")
    .required("Harga tidak boleh kosong"),
});
const source = axios.CancelToken.source();

const AddCentralOperationalItemForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);

  const {
    trigger,
    control,
    register,
    watch,
    getValues,
    setError,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(FormSchema),
  });
  const { branch_code } = watch();

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (!branch_code) return;
    fetchBranchProducts(branch_code.value);
  }, [branch_code]);

  const createCentralOperationalItem = async () => {
    try {
      setIsSubmitting(true);

      const values = getValues();

      const payload = {
        items_name: values.items_name,
        branch_code: values.branch_code.value,
        product_code: values.product_code.value,
        amount: parseInt(values.amount),
        qty: parseInt(values.qty),
      };

      const response = await axios.post("/api/central-operational-item/", {
        ...payload,
        cancelToken: source.token,
      });
      const data = await response.data;
      if (data.success == true) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data berhasil ditambah",
        });
      } else {
        showToast({
          type: "error",
          title: "Terjadi Kesalahan",
          message: "Proses tambah data gagal, silakan coba lagi nanti",
        });
      }
      window.location.href = "/central-operational-item";
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get("/api/branch/all");
      const body = await response.data;
      if (response.status !== 200) {
        console.error(body.data);
        return;
      }
      const branches = body.data.map((item) => {
        return {
          value: item.code,
          label: `${item.name} (${item.code})`,
        };
      });
      setBranches(branches);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBranchProducts = async (branch_code) => {
    try {
      setIsFetchingProducts(true);
      const response = await axios.get(
        `/api/product/by-query?type=OFFLINE_PRODUCT&branch_code=${branch_code}&status=true`
      );
      const body = await response.data;
      if (response.status !== 200) {
        console.error(body.data);
        return;
      }
      const products = body.data.map((item) => {
        return {
          value: item.product_code,
          label: `${item.title} (${item.product_code})`,
        };
      });
      setProducts(products);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingProducts(false);
    }
  };

  const onSubmit = () => {
    trigger();
    if (isObjEmpty(errors)) {
      createCentralOperationalItem();
    }
  };

  return (
    <Fragment>
      <AvForm onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={6}>
            <Controller
              name="items_name"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="name">Nama Produk</Label>
                    <Input
                      {...rest}
                      placeholder="SKD Premium 10 Modul"
                      id="name"
                      type="text"
                      innerRef={ref}
                      invalid={error && true}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />

            <Controller
              name="branch_code"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="branch_code">Cabang</Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      {...field}
                      options={branches}
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

            <Controller
              name="product_code"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="product_code">Kode Produk</Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      {...field}
                      options={products}
                      isLoading={isFetchingProducts}
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

            <Controller
              render={({ field, fieldState: { error } }) => (
                <FormGroup>
                  <label htmlFor="amount">Harga</label>
                  <InputGroup>
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>Rp</InputGroupText>
                    </InputGroupAddon>
                    <Cleave
                      {...field}
                      options={numeralOptions}
                      className={classnames("form-control", {
                        "is-invalid": error,
                      })}
                      onChange={(e) => field.onChange(e.target.rawValue)}
                      value={field.value ?? 0}
                      placeholder="75.000"
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </InputGroup>
                </FormGroup>
              )}
              id="amount"
              name="amount"
              control={control}
              defaultValue=""
            />

            <Controller
              name="qty"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="qty">Jumlah</Label>
                    <Cleave
                      {...field}
                      options={normalNumber}
                      className={classnames("form-control", {
                        "is-invalid": error,
                      })}
                      onChange={(e) => field.onChange(e.target.rawValue)}
                      value={field.value ?? 0}
                      placeholder="10"
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                );
              }}
            />
          </Col>
        </Row>
        <Col lg={6}>
          <div className="d-flex justify-content-end mt-2">
            <Button
              type="submit"
              color="success"
              className="btn-next"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Save size={14} className="align-middle ml-sm-25 ml-0 mr-50" />
              )}
              <span className="align-middle d-sm-inline-block">
                {isSubmitting ? "Menyimpan data..." : "Simpan"}
              </span>
            </Button>
          </div>
        </Col>
      </AvForm>
    </Fragment>
  );
};

export default AddCentralOperationalItemForm;
