import React, { useContext, useEffect, useState } from "react";
import Select from "react-select";
import classnames from "classnames";
import Flatpickr from "react-flatpickr";
import { Controller } from "react-hook-form";
import {
  Badge,
  Button,
  Col,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import MultipleInputSelect from "../../core/multiple-input-select/MultipleInputSelect";
import "flatpickr/dist/themes/airbnb.css";
import { Plus } from "react-feather";
import AddContactModal from "./AddContactModal";
import { ExpenseContext } from "../../../context/ExpenseContext";
import { getUserFromBlade } from "../../../utility/Utils";

const howToPayOptions = [
  {
    label: "Kas Tunai",
    value: "Kas Tunai",
  },
  {
    label: "Transfer Bank",
    value: "Transfer Bank",
  },
];

const InvoiceDetail = ({ control, setValue, defaultTags, watch }) => {
  const [isAddNewContact, setIsAddNewContact] = useState(false);
  const [user, setUser] = useState(getUserFromBlade());
  const { contactOption, loadContactOptionByBranchCode, selectedContactId } =
    useContext(ExpenseContext);

  const { contact_id: watchContactId } = watch();

  useEffect(async () => {
    setUser(getUserFromBlade());
    loadContactOptionByBranchCode(user?.branch_code);
  }, []);

  useEffect(async () => {
    if (!selectedContactId) return;
    setValue("contact_id", selectedContactId);
  }, [selectedContactId]);

  useEffect(async () => {
    if (!watchContactId) return;
    const contact = contactOption.find((v) => v.id == watchContactId);
    setValue("address", contact?.address);
  }, [watchContactId]);

  const handleShowModal = () => {
    setIsAddNewContact(true);
  };

  return (
    <div className="invoice-details pt-1">
      <Row>
        <Col md={6}>
          <Controller
            isClearable
            name="contact_id"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <FormGroup>
                <Label className="form-label font-weight-bold" for="scope">
                  Penerima{" "}
                  <Badge
                    size="sm"
                    color="light-primary"
                    className="cursor-pointer"
                    onClick={handleShowModal}
                  >
                    <Plus size={12} /> Klik untuk menambahkan
                  </Badge>
                </Label>
                <Select
                  options={contactOption}
                  onChange={(val) => onChange(val.id)}
                  getOptionValue={(option) => option.id}
                  value={contactOption.filter((v) => v.id == value)}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.branch_code})`
                  }
                  placeholder="Pilih Kontak"
                  classNamePrefix="select"
                  className={classnames("react-select", {
                    "is-invalid": !!error,
                  })}
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            )}
          />
        </Col>
        <Col md={2}>
          <Controller
            isClearable
            name="transaction_date"
            control={control}
            render={({
              field: { onChange, ref, value },
              fieldState: { error },
            }) => (
              <FormGroup>
                <Label className="form-label font-weight-bold" for="scope">
                  Tgl Transaksi
                </Label>
                <Flatpickr
                  className={classnames("form-control", {
                    "is-invalid": error,
                  })}
                  ref={ref}
                  value={value}
                  readOnly={false}
                  onChange={(date) =>
                    onChange(moment(date[0]).format("YYYY-MM-DD"))
                  }
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            )}
          />
        </Col>
        {/* <Col md={3}>
          <Controller
            isClearable
            name="payment_method"
            control={control}
            render={({ field: { onChange }, fieldState: { error } }) => (
              <FormGroup>
                <Label className="form-label font-weight-bold">
                  Cara Pembayaran
                </Label>
                <Select
                  isSearchable={false}
                  options={howToPayOptions}
                  getOptionValue={(option) => option.value}
                  getOptionLabel={(option) => option.label}
                  classNamePrefix="select"
                  className={classnames("react-select", {
                    "is-invalid": !!error,
                  })}
                  onChange={(val) => onChange(val.value)}
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            )}
          />
        </Col> */}
        {/* <Col md={2}>
          <Controller
            isClearable
            name=""
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <FormGroup>
                  <Label className="form-label font-weight-bold">
                    No Biaya
                  </Label>
                  <Input
                    {...field}
                    innerRef={field.ref}
                    placeholder="[Auto]"
                    invalid={!!error}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />
        </Col> */}
        <Col md={4}>
          <Controller
            isClearable
            name="input_tags"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormGroup>
                <Label className="form-label font-weight-bold" for="scope">
                  Tags
                </Label>
                <MultipleInputSelect
                  fieldName={field.name}
                  setValue={setValue}
                  currentValue={field.value}
                  valueName={`tags`}
                  defaultValue={defaultTags}
                  changeHandler={field.onChange}
                />
                <FormFeedback>{error?.message}</FormFeedback>
              </FormGroup>
            )}
          />
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <Controller
            isClearable
            name="address"
            control={control}
            render={({ field, fieldState: { error } }) => {
              const { ref, ...rest } = field;
              return (
                <FormGroup>
                  <Label className="form-label font-weight-bold" for="scope">
                    Alamat Penagihan
                  </Label>
                  <Input
                    {...rest}
                    rows="3"
                    type="textarea"
                    value={field.value ? field.value : ""}
                    innerRef={ref}
                    invalid={!!error}
                  />
                  <FormFeedback>{error?.message}</FormFeedback>
                </FormGroup>
              );
            }}
          />
        </Col>
      </Row>

      <AddContactModal
        isShow={isAddNewContact}
        handleShow={setIsAddNewContact}
      />
    </div>
  );
};

export default InvoiceDetail;
