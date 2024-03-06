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
import axios from 'axios';
import { AvRadioGroup, AvRadio, AvForm } from "availity-reactstrap-validation-safe";
import { isObjEmpty, showToast } from "../../../../js/react/utility/Utils";

const defaultPosition = [
  { value: "CREDIT", label: "Kredit" },
  { value: "DEBIT", label: "Debit" }
];

const numeralOptions = {
  numeral: true,
  delimiter: ".",
  numeralDecimalMark: "thousand",
};

const auth_branch_code = document.getElementById('auth_branch_code');
const is_user_pusat = auth_branch_code.value === "PT0000";

const fetchBranches = async () => {
  try {
    let branchOptions = [];
    const branches = await axios.get('/api/branch/all');
    branches.data.data.forEach((item) => {
      const branchValue = {
        value: item.code,
        label: `(${item.code}) ${item.name}`
      }
      branchOptions.push(branchValue);
    });
    return branchOptions;
  } catch(error) {
    console.error(error);
    return [];
  }
}

const CoaSchema = yup.object().shape({
  name: yup.string().required(),
  account_code: yup.number().required(),
  status: yup.mixed().required(),
  account_category_id: yup.object().required(),
  default_position: yup.object().required(),
});
const source = axios.CancelToken.source();

const FormAddCoa = () => {
  const [accountCategories, setAccountCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    trigger,
    control,
    register,
    getValues,
    setError,
    setFocus,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CoaSchema),
  });

  useEffect(() => {
    (async () => {
      const categories = await getAccountCategories();
      const branches = await fetchBranches();
      setBranches(branches);
      setAccountCategories(categories);
    })();
  }, []);

  const getAccountCategories = async () => {
    try {
      const response = await axios.get('/api/finance/coa/account-categories');
      return response.data.data.map((item) => {
        return {
          value: item.id,
          label: item.name
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const createCoa = async () => {
    try {
      setIsSubmitting(true);

      const values = getValues();

      const payload = {
        account_category_id: values.account_category_id.value,
        branch_code: is_user_pusat ? values.branch_code.value : auth_branch_code.value,
        account_code: parseInt(values.account_code),
        name: values.name,
        init_balance: parseInt(values.init_balance),
        default_position: values.default_position.value,
        status: Boolean(parseInt(values.status)),
        is_default: false,
        is_protected: false
      }

      const response = await axios.post("/api/finance/coa", {...payload, cancelToken: source.token});
      const data = await response.data;
      if(data.success == true) {
        showToast({
          type: "success",
          title: "Berhasil",
          message: "Data akun berhasil ditambah",
        });
      } else {
        showToast({
          type: "error",
          title: "Terjadi Kesalahan",
          message: "Proses tambah akun gagal, silakan coba lagi nanti",
        });
      }

    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
      window.location.href = "/coa";
    }
  };

  const onSubmit = () => {
    trigger();
    if(isObjEmpty(errors)) {
      createCoa();
    }
  }

  return (
    <Fragment>
      <AvForm onSubmit={handleSubmit(onSubmit)}>
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
                    <Label for="name">Nama Akun</Label>
                    <Input {...rest} id="name" type="text" innerRef={ref} invalid={error && true} />
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="account_code"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="account_code">Nomor Akun</Label>
                    <Input {...rest} type="number" innerRef={ref}  invalid={error && true} />
                  </FormGroup>
                );
              }}
            />
            <Controller
              name="account_category_id"
              control={control}
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="account_category_id">Kategori</Label>
                    <Select
                      {...field}
                      options={accountCategories}
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
              name="default_position"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => {
                const { ref, ...rest } = field;
                return (
                  <FormGroup>
                    <Label for="default_position">Posisi</Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      {...field}
                      options={defaultPosition}
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
            render={({ field, fieldState: { error } }) => (
              <FormGroup>
                <label htmlFor="init_balance">Saldo Awal</label>
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
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </InputGroup>
              </FormGroup>
            )}
            id="init_balance"
            name="init_balance"
            control={control}
            placeholder="10.000"
            defaultValue="0"
          />

          {is_user_pusat ? (
            <>
              <Controller
                name="branch_code"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  const { ref, ...rest } = field;
                  return (
                    <FormGroup>
                      <Label for="branch_code">Kode Cabang</Label>
                      <Select
                        {...field}
                        options={branches}
                        classNamePrefix="select"
                        className={classnames("react-select", {
                          "is-invalid": error && true,
                        })}
                        styles={{
                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                      />
                    </FormGroup>
                  );
                }}
              />
            </>
          ) : null}
          <AvRadioGroup
            name="status"
            value="1"
            {...register("status", { required: true })}
            required
          >
          <Label>Status</Label>
          <div className="d-flex mt-50">
            <AvRadio
              className="mb-1 mr-1"
              customInput
              label="Aktif"
              value="1"
            />
            <AvRadio customInput label="Tidak Aktif" value="0" />
          </div>
          </AvRadioGroup>

          </Col>
        </Row>
        <Col lg={6}>
          <div className="d-flex justify-content-end mt-2">
            <Button type="submit" color="success" className="btn-next" disabled={isSubmitting}>
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

export default FormAddCoa;
