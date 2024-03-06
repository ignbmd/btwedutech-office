import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Save } from "react-feather";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  FormGroup,
  Label,
  FormFeedback,
} from "reactstrap";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import InputCustomPromo from "../core/input/InputCustomPromo";
import Select from "react-select";
import classnames from "classnames";
import { getBranches } from "../../data/branch";
import { getProducts } from "../../data/product";
import {
  createBranchEarning,
  getBranchEarningById,
  updateBranchEarning,
} from "../../data/finance-branch-earning";

const formSchema = yup.object().shape({
  branch_code: yup.string().required("Cabang harus dipilih"),
  earning_type: yup.string().required("Tipe Porsi harus dipilih"),
  product_code: yup.string().required("Produk harus dipilih"),
  earning_position: yup.string().required("Untuk Harus dipilih"),
  amount_type: yup.string().required("Tipe Nominal Harus dipilih"),
  amount: yup.string().required("Nominal Harus diisi"),
});

const positionOption = [
  { value: "CENTRAL", label: "Pusat" },
  { value: "BRANCH", label: "Cabang" },
];

const RevenueShareForm = ({ id }) => {
  const [branchOption, setBranchOption] = useState([]);
  const [productOption, setProductOption] = useState([]);
  const [filteredProduct, setFilteredProduct] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    defaultValues: { earning_type: "CUSTOM_PRODUCT" },
    resolver: yupResolver(formSchema),
  });

  useEffect(async () => {
    setBranchOption(await getBranches());
    setProductOption(await getProducts());
    loadDetailOnEdit(id);
  }, []);

  useEffect(() => {
    const branchCode = form.getValues("branch_code");
    setFilteredProduct(
      productOption.filter((v) => v.branch_code == branchCode)
    );
  }, [form.watch("branch_code")]);

  const loadDetailOnEdit = async (id) => {
    if (!id) return;
    const detail = await getBranchEarningById(id);
    console.log(detail);
    form.setValue("id", id);
    form.setValue("branch_code", detail?.branch_code);
    form.setValue("earning_type", detail?.earning_type);
    form.setValue("product_code", detail?.product_code);
    form.setValue("earning_position", detail?.earning_position);
    form.setValue("amount_type", detail?.amount_type);
    form.setValue("amount", String(detail?.amount ?? 0));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const payload = { ...data, amount: Number(data?.amount) };
    const result = await (id
      ? updateBranchEarning(id, payload)
      : createBranchEarning(payload));
    setIsSubmitting(false);

    if (!result?.success) {
      toastr.error(result?.message, "Terjadi Kesalahan", {
        closeButton: true,
        tapToDismiss: false,
        timeOut: 3000,
      });
      return;
    }

    toastr.success(
      result?.message,
      `${id ? "Update" : "Buat"} Porsi pendapatan sukses`,
      {
        timeOut: 1500,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
        onHidden() {
          window.location.href = "/porsi-pendapatan";
        },
      }
    );
  };

  return (
    <Card>
      <CardBody>
        <AvForm onSubmit={form.handleSubmit(onSubmit)}>
          <Row className="justify-content-between align-items-end">
            <Col md={8}>
              <InputCustomPromo
                name="amount"
                typeName="amount_type"
                control={form.control}
                value={form.watch("amount")}
                setValue={form.setValue}
                defaultValue={form.getValues("amount")}
                defaultTypeValue={form.getValues("amount_type")}
              />

              <Controller
                isClearable
                name="branch_code"
                control={form.control}
                render={({ field, fieldState: { error } }) => (
                  <FormGroup>
                    <Label className="form-label">Cabang</Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      className={classnames("react-select", {
                        "is-invalid": !!error,
                      })}
                      value={branchOption.filter(
                        (v) => v?.code == field?.value
                      )}
                      options={branchOption}
                      classNamePrefix="select"
                      getOptionLabel={(option) => option?.name}
                      getOptionValue={(option) => option?.code}
                      onChange={(option) => field.onChange(option?.code)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                )}
              />

              <Controller
                isClearable
                name="product_code"
                control={form.control}
                render={({ field, fieldState: { error } }) => (
                  <FormGroup>
                    <Label className="form-label">Produk</Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      className={classnames("react-select", {
                        "is-invalid": !!error,
                      })}
                      options={productOption.filter(
                        (v) => v.branch_code == form.getValues("branch_code")
                      )}
                      classNamePrefix="select"
                      getOptionLabel={(option) => `${option?.title} (${option?.product_code})`}
                      getOptionValue={(option) => option?._id}
                      value={productOption.filter(
                        (v) => v?.product_code == field.value
                      )}
                      onChange={(option) =>
                        field.onChange(option?.product_code)
                      }
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                )}
              />

              <Controller
                isClearable
                name="earning_position"
                control={form.control}
                render={({ field, fieldState: { error } }) => (
                  <FormGroup>
                    <Label className="form-label">Untuk</Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      className={classnames("react-select", {
                        "is-invalid": !!error,
                      })}
                      value={positionOption.filter(
                        (option) => option?.value == field?.value
                      )}
                      options={positionOption}
                      classNamePrefix="select"
                      getOptionLabel={(option) => option?.label}
                      onChange={(option) => field.onChange(option?.value)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                )}
              />
            </Col>
          </Row>

          <Col md="8" className="mt-2">
            <div className="d-flex justify-content-end mb-5">
              <Button disabled={isSubmitting} color={"primary"}>
                <Save size={14} className="mr-50" />{" "}
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </Col>
        </AvForm>
      </CardBody>
    </Card>
  );
};

export default RevenueShareForm;
