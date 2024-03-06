import React, { useEffect, useState, useContext } from "react";
import * as yup from "yup";
import Select from "react-select";
import classnames from "classnames";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Card,
  CardBody,
  Col,
  FormGroup,
  Label,
  Row,
  Button,
  FormFeedback,
} from "reactstrap";
import AvForm from "availity-reactstrap-validation-safe/lib/AvForm";
import InvoiceDetail from "./InvoiceDetail";
import TransactionTable from "./TransactionTable";
import InvoiceSummary from "./InvoiceSummary";
import { Save } from "react-feather";
import {
  getUserFromBlade,
  priceFormatter,
  showToast,
  unformatPrice,
} from "../../../utility/Utils";
import { ExpenseContext } from "../../../context/ExpenseContext";
import moment from "moment";
import { createExpense, updateExpense } from "../../../data/finance-expense";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const transactionFormSchema = yup.object().shape({
  account: yup.object().required("Akun biaya harus dipilih"),
  description: yup.string(),
  tax: yup.string(),
  amount: yup.string().required("Nominal Harus diisi"),
});

const fieldsSchema = yup.object().shape({
  paid_from: yup.object().required("Bayar dari harus diisi"),
  contact_id: yup.number().required("Penerima Harus diisi"),
  // payment_method: yup.string().required("Metode Pembayaran harus diisi"),
  transaction_date: yup.string().required("Tanggal harus diisi"),
  tags: yup.array().of(yup.string()),
  transactions: yup
    .array()
    .of(transactionFormSchema)
    .required()
    .min(1, "Minimal 1"),
});

const getDefaultTransactionValues = () => {
  return {
    account: "",
    amount: "",
  };
};

const ExpenseForm = ({ expenseId = null }) => {
  const {
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      transaction_date: moment().format("YYYY-MM-DD"),
      transactions: [getDefaultTransactionValues()],
    },
    resolver: yupResolver(fieldsSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
  });
  const formAttachments = useFieldArray({
    control,
    name: "attachments",
  });

  const { transactions, tags, default_tags } = watch();
  const defaultTags = watch("default_tags");
  const total = transactions
    .map((transaction) => {
      return transaction.amount;
    })
    .reduce((currentValue, transactionValue) => {
      const plainAmountString = unformatPrice(transactionValue);
      return +plainAmountString + currentValue;
    }, 0);

  const {
    accountFromOption,
    loadAccountFromOption,
    accountToOption,
    loadAccountToOption,
    editExpense,
    loadEditExpense,
  } = useContext(ExpenseContext);

  const [user, setUser] = useState(getUserFromBlade());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(async () => {
    setUser(getUserFromBlade());
    setValue("created_by", user?.name);
    loadAccountFromOption(user?.branch_code);
    loadAccountToOption(user?.branch_code);
    if (expenseId) loadEditExpense(expenseId);
  }, []);

  useEffect(() => {
    if (!editExpense) return;
    loadEditForm();
  }, [editExpense]);

  const loadEditForm = async () => {
    const credit = (editExpense?.journal_records ?? []).find(
      (v) => v.position == "CREDIT"
    );
    const debit = (editExpense?.journal_records ?? [])
      .filter((v) => v.position == "DEBIT")
      .map((v) => ({
        account: accountToOption.find((a) => a.id == v.account_id),
        amount: String(v.amount),
      }));

    const paidFrom = accountFromOption.find((a) => a.id == credit?.account_id);

    setValue("paid_from", paidFrom);
    setValue("contact_id", editExpense?.contact?.id);
    setValue("transactions", debit);
    setValue("tags", editExpense?.tags ?? []);
    setValue("default_tags", editExpense?.tags ?? []);
    setValue("input_tags", editExpense?.tags ?? []);
    setValue("address", editExpense?.address);
    setValue("attachments", editExpense?.document);
    setValue("note", editExpense?.note);
    setValue(
      "transaction_date",
      moment(editExpense?.transaction_date).format("YYYY-MM-DD")
    );
  };

  const onSubmit = async (data) => {
    const state = await MySwal.fire({
      title: "Pastikan data yang diinput sudah benar!",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Proses",
      cancelButtonText: "Batalkan",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-outline-secondary ml-1",
      },
      buttonsStyling: false,
    });
    if (state.isDismissed) return;
    const fd = new FormData();
    fd.append(
      "payload",
      JSON.stringify({
        id: expenseId ? Number(expenseId) : null,
        branch_code: data?.paid_from?.branch_code,
        contact_id: data?.contact_id,
        transaction_date: moment(data?.transaction_date).format("YYYY-MM-DD"),
        note: data?.note,
        address: data?.address,
        created_by: data?.created_by,
        attachments: data?.attachments,
        tags: data?.tags,
        journal_items: [
          {
            account_code: data?.paid_from?.account_code,
            amount: total,
            position: "CREDIT",
          },
          ...data.transactions.map(({ account, amount }) => ({
            account_code: Number(account?.account_code),
            amount: Number(unformatPrice(amount)),
            position: "DEBIT",
          })),
        ],
      })
    );
    (data?.files ?? []).forEach((file) => {
      fd.append("files[]", file);
    });

    setIsSubmitting(true);
    const result = await (expenseId ? updateExpense(fd) : createExpense(fd));
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
      `${expenseId ? "Update" : "Buat"} biaya sukses`,
      {
        timeOut: 2000,
        closeButton: true,
        tapToDismiss: true,
        preventDuplicates: true,
        onHidden() {
          const id = expenseId ? expenseId : result?.data?.id;
          window.location.href = `/biaya/detail/${id}`;
        },
      }
    );
  };

  return (
    <Card>
      <CardBody className="pt-0 px-1">
        <AvForm>
          <Row
            className={classnames(
              "pt-75 bg-light-primary rounded",
              "d-flex align-items-center justify-content-between"
            )}
          >
            <Col md={4}>
              <Controller
                isClearable
                name="paid_from"
                control={control}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => (
                  <FormGroup>
                    <Label className="form-label font-weight-bold" for="scope">
                      Bayar dari
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      getOptionValue={(v) => v?.id}
                      getOptionLabel={({ name, branch_code, account_code }) =>
                        `${name} (${branch_code}) (${account_code}) `
                      }
                      options={accountFromOption}
                      classNamePrefix="select"
                      className={classnames("react-select", {
                        "is-invalid": !!error,
                      })}
                      value={value}
                      onChange={(val) => onChange(val)}
                    />
                    <FormFeedback>{error?.message}</FormFeedback>
                  </FormGroup>
                )}
              />
            </Col>
            <Col md={4}>
              <h3
                className={classnames(
                  "d-flex align-items-center justify-content-end"
                )}
              >
                <span className="mr-50">Total</span>
                <span className="font-weight-bolder">
                  {priceFormatter(total)}
                </span>
              </h3>
            </Col>
          </Row>

          <InvoiceDetail
            control={control}
            setValue={setValue}
            defaultTags={defaultTags}
            watch={watch}
          />

          <TransactionTable
            control={control}
            fields={fields}
            handleAdd={() => append(getDefaultTransactionValues())}
            handleRemove={remove}
          />

          <InvoiceSummary
            control={control}
            setValue={setValue}
            fields={formAttachments.fields}
            handleRemove={formAttachments.remove}
            total={total}
          />

          <div className="text-right mt-3">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className={classnames(
                "btn-icon d-flex align-items-center ml-auto",
                "px-2"
              )}
              color="gradient-success"
              size="md"
              disabled={isSubmitting}
            >
              <Save size={16} className="mr-25" />{" "}
              {isSubmitting
                ? "Menyimpan..."
                : `${expenseId ? "Update" : "Buat"} Biaya`}
            </Button>
          </div>
        </AvForm>
      </CardBody>
    </Card>
  );
};

export default ExpenseForm;
